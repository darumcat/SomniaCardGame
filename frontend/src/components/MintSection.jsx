import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const MintSection = () => {
  const { 
    account, 
    contracts, 
    isLoading, 
    connect, 
    isCorrectNetwork,
    networkConfig
  } = useWeb3();
  
  const [mintState, setMintState] = useState({
    isMintingNFT: false,
    isMintingUSD: false,
    hasMintedNFT: false,
    hasMintedUSD: false
  });

  // Проверка статуса минтинга
  useEffect(() => {
    const checkMintStatus = async () => {
      if (!contracts?.nft || !contracts?.usdcard || !account) return;
      
      try {
        const [nftStatus, usdStatus] = await Promise.all([
          contracts.nft.hasMinted(account).catch(() => false),
          contracts.usdcard.hasMinted(account).catch(() => false)
        ]);
        
        setMintState(prev => ({
          ...prev,
          hasMintedNFT: nftStatus,
          hasMintedUSD: usdStatus
        }));
      } catch (error) {
        console.error('Error checking mint status:', error);
        toast.error('Failed to load mint status');
      }
    };

    checkMintStatus();
  }, [contracts, account]);

  const mintNFT = async () => {
    if (!isCorrectNetwork) {
      toast.error(`Please switch to ${networkConfig.chainName}`);
      return;
    }

    if (!account) {
      await connect();
      return;
    }

    if (mintState.hasMintedNFT) {
      toast.info('You already minted your NFT');
      return;
    }

    if (!contracts?.nft) {
      toast.error('NFT contract not loaded');
      return;
    }

    setMintState(prev => ({ ...prev, isMintingNFT: true }));

    try {
      const tx = await contracts.nft.mint();
      await tx.wait();
      
      toast.success('NFT minted successfully!');
      setMintState(prev => ({ 
        ...prev, 
        hasMintedNFT: true 
      }));
    } catch (error) {
      console.error('NFT mint error:', error);
      toast.error(
        error.code === 4001 
          ? 'Transaction cancelled' 
          : error.reason || 'Minting failed'
      );
    } finally {
      setMintState(prev => ({ ...prev, isMintingNFT: false }));
    }
  };

  const mintUSD = async () => {
    if (!isCorrectNetwork) {
      toast.error(`Please switch to ${networkConfig.chainName}`);
      return;
    }

    if (!account) {
      await connect();
      return;
    }

    if (mintState.hasMintedUSD) {
      toast.info('You already minted USDC tokens');
      return;
    }

    if (!contracts?.usdcard) {
      toast.error('USDCard contract not loaded');
      return;
    }

    setMintState(prev => ({ ...prev, isMintingUSD: true }));

    try {
      const tx = await contracts.usdcard.mint();
      await tx.wait();
      
      toast.success('10,000 USDC tokens minted!');
      setMintState(prev => ({ 
        ...prev, 
        hasMintedUSD: true 
      }));
    } catch (error) {
      console.error('USDC mint error:', error);
      toast.error(
        error.code === 4001 
          ? 'Transaction cancelled' 
          : error.reason || 'Minting failed'
      );
    } finally {
      setMintState(prev => ({ ...prev, isMintingUSD: false }));
    }
  };

  if (isLoading) {
    return <div className="loading">Loading blockchain data...</div>;
  }

  return (
    <div className="mint-section">
      <h2>Get Game Access</h2>
      
      {!isCorrectNetwork && (
        <div className="network-warning">
          Please connect to Somnia Testnet to mint
        </div>
      )}

      <div className="mint-buttons">
        <button
          onClick={mintNFT}
          disabled={mintState.isMintingNFT || mintState.hasMintedNFT}
          className={mintState.isMintingNFT ? 'loading' : ''}
        >
          {mintState.isMintingNFT 
            ? 'Minting...' 
            : mintState.hasMintedNFT 
              ? 'Already Minted' 
              : 'Mint NFT (1 free)'}
        </button>

        <button
          onClick={mintUSD}
          disabled={mintState.isMintingUSD || mintState.hasMintedUSD}
          className={mintState.isMintingUSD ? 'loading' : ''}
        >
          {mintState.isMintingUSD 
            ? 'Minting...' 
            : mintState.hasMintedUSD 
              ? 'Already Minted' 
              : 'Mint USDC (10,000 max)'}
        </button>
      </div>
    </div>
  );
};

export default MintSection;
