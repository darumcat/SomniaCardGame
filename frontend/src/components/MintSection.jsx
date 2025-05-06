import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const MintSection = () => {
  const { account, contracts, updateBalances } = useWeb3();
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [isMintingUSD, setIsMintingUSD] = useState(false);

  const mintNFT = async () => {
    if (!account) {
      toast.error("Connect wallet first!");
      return;
    }
    setIsMintingNFT(true);
    try {
      const tx = await contracts.nftContract.mint();
      await tx.wait(); // Ждём подтверждения транзакции
      toast.success("NFT successfully minted!");
      await updateBalances(); // Обновляем балансы

      // Проверяем баланс NFT
      const balance = await contracts.nftContract.balanceOf(account);
      console.log("NFT Balance:", balance.toString());
      
    } catch (error) {
      console.error("Mint error:", error);
      toast.error(`Error: ${error.reason || error.message.split("(")[0]}`);
    } finally {
      setIsMintingNFT(false);
    }
  };

  const mintUSD = async () => {
    if (!account) {
      toast.error("Connect wallet first!");
      return;
    }
    setIsMintingUSD(true);
    try {
      const tx = await contracts.usdcardContract.mint();
      await tx.wait();
      toast.success("USDC tokens minted!");
      await updateBalances();
    } catch (error) {
      toast.error(`Error: ${error.message.split('(')[0]}`);
    } finally {
      setIsMintingUSD(false);
    }
  };

  return (
    <div className="mint-section">
      <h2>Get Game Access</h2>
      <div className="mint-buttons">
        <button 
          onClick={mintNFT} 
          disabled={isMintingNFT}
          className={isMintingNFT ? 'loading' : ''}
        >
          {isMintingNFT ? 'Minting...' : 'Mint NFT (1 free)'}
        </button>
        <button 
          onClick={mintUSD} 
          disabled={isMintingUSD}
          className={isMintingUSD ? 'loading' : ''}
        >
          {isMintingUSD ? 'Minting...' : 'Mint USDC (10,000 max)'}
        </button>
      </div>
    </div>
  );
};

export default MintSection;
