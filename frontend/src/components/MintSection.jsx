import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';

const MintSection = () => {
  const { account, contracts, updateBalances } = useWeb3();
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [isMintingUSD, setIsMintingUSD] = useState(false);

  // Универсальная функция для обработки ошибок контракта
  const parseContractError = (error) => {
    if (!error) return "Unknown error";
    
    // Обработка ошибки из revert
    if (error.reason) return error.reason;
    
    // Обработка ошибки из метамаски
    if (error.data?.message) {
      const revertReason = error.data.message.match(/reverted with reason string '(.*?)'/);
      if (revertReason) return revertReason[1];
      return error.data.message;
    }
    
    // Обработка обычной ошибки
    if (error.message) {
      // Для ошибки "Already minted"
      if (error.message.includes("Already minted")) {
        return "You've already minted this item";
      }
      return error.message.split('(')[0];
    }
    
    return "Unknown error occurred";
  };

  const mintNFT = async () => {
    if (!account) {
      toast.error("Connect wallet first!");
      return;
    }
    setIsMintingNFT(true);
    try {
      const tx = await contracts.nftContract.mint();
      await tx.wait();
      toast.success("NFT successfully minted!");
      await updateBalances();
      
      const balance = await contracts.nftContract.balanceOf(account);
      console.log("NFT Balance:", balance.toString());
      
    } catch (error) {
      console.error("NFT Mint error:", error);
      const errorMsg = parseContractError(error);
      toast.warning(errorMsg);
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
      console.error("USDC Mint error:", error);
      const errorMsg = parseContractError(error);
      
      // Специальная обработка для USDCard
      if (errorMsg.includes("USDCard: Already minted")) {
        toast.info("You've already minted your USDC tokens");
      } else {
        toast.warning(errorMsg);
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
