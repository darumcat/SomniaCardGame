import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const MintSection = () => {
  const { account, contracts, updateBalances } = useWeb3();
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [isMintingUSD, setIsMintingUSD] = useState(false);

  const mintNFT = async () => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!contracts?.nftContract) {
      toast.error("NFT contract not loaded");
      return;
    }

    setIsMintingNFT(true);
    
    try {
      // Проверяем, не минтил ли уже пользователь
      const hasMinted = await contracts.nftContract.hasMinted(account);
      if (hasMinted) {
        toast.info("You've already minted your free NFT");
        return;
      }

      // Вызываем mint
      const tx = await contracts.nftContract.mint();
      await toast.promise(
        tx.wait(),
        {
          pending: 'Minting NFT...',
          success: 'NFT successfully minted!',
          error: 'NFT minting failed'
        },
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );

      // Обновляем балансы
      await updateBalances();

      // Проверяем баланс NFT
      const balance = await contracts.nftContract.balanceOf(account);
      console.log("NFT Balance:", balance.toString());

    } catch (error) {
      console.error("NFT mint error:", error);
      
      // Обработка разных типов ошибок
      if (error.code === 4001) {
        toast.warning("Transaction rejected by user");
      } else if (error.message?.includes("Already minted") || error.reason?.includes("Already minted")) {
        toast.warning("You've already minted this NFT");
      } else if (error.message?.includes("user rejected transaction")) {
        toast.warning("Transaction was cancelled");
      } else {
        toast.error(`Mint error: ${error.reason || error.message?.split('(')[0] || 'Unknown error'}`);
      }
    } finally {
      setIsMintingNFT(false);
    }
  };

  const mintUSD = async () => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!contracts?.usdcardContract) {
      toast.error("USDCard contract not loaded");
      return;
    }

    setIsMintingUSD(true);
    
    try {
      // Проверяем, не минтил ли уже пользователь
      const hasMinted = await contracts.usdcardContract.hasMinted(account);
      if (hasMinted) {
        toast.info("You've already minted your USDC tokens");
        return;
      }

      // Вызываем mint
      const tx = await contracts.usdcardContract.mint();
      await toast.promise(
        tx.wait(),
        {
          pending: 'Minting USDC tokens...',
          success: '10,000 USDC tokens minted!',
          error: 'USDC minting failed'
        },
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );

      // Обновляем балансы
      await updateBalances();

    } catch (error) {
      console.error("USDC mint error:", error);
      
      // Обработка разных типов ошибок
      if (error.code === 4001) {
        toast.warning("Transaction rejected by user");
      } else if (error.message?.includes("Already minted") || error.reason?.includes("USDCard: Already minted")) {
        toast.warning("You've already minted USDC tokens");
      } else if (error.message?.includes("user rejected transaction")) {
        toast.warning("Transaction was cancelled");
      } else {
        toast.error(`Mint error: ${error.reason || error.message?.split('(')[0] || 'Unknown error'}`);
      }
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
          className={`mint-button ${isMintingNFT ? 'loading' : ''}`}
        >
          {isMintingNFT ? (
            <>
              <span className="spinner"></span>
              Minting...
            </>
          ) : (
            'Mint NFT (1 free)'
          )}
        </button>
        
        <button 
          onClick={mintUSD} 
          disabled={isMintingUSD}
          className={`mint-button ${isMintingUSD ? 'loading' : ''}`}
        >
          {isMintingUSD ? (
            <>
              <span className="spinner"></span>
              Minting...
            </>
          ) : (
            'Mint USDC (10,000 max)'
          )}
        </button>
      </div>
      
      <style jsx>{`
        .mint-section {
          text-align: center;
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .mint-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .mint-button {
          padding: 12px 24px;
          background: #4e44ce;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 180px;
        }
        
        .mint-button:hover:not(:disabled) {
          background: #3a30a0;
        }
        
        .mint-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        
        .mint-button.loading {
          position: relative;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MintSection;
