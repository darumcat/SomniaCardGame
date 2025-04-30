import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';
import ethers from '../ethers-resolver'; // Измененный импорт

const MintSection = () => {
  const { account, contracts } = useWeb3();
  const [isMinting, setIsMinting] = useState(false);

  const mintNFT = async () => {
    try {
      setIsMinting(true);
      const tx = await contracts.nftContract.mint();
      await tx.wait();
      toast.success("NFT успешно заминтирован!");
    } catch (error) {
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mint-section">
      <h2>Получите доступ к игре</h2>
      <button onClick={mintNFT} disabled={isMinting}>
        {isMinting ? 'Minting...' : 'Mint NFT (1 шт)'}
      </button>
    </div>
  );
};

export default MintSection;
export default MintSection;
