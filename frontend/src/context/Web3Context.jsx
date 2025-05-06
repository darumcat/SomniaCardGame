import { ethers } from 'ethers';
import { getContractABI } from './contracts';

export const Web3Provider = ({ children }) => {
  const [contracts, setContracts] = useState(null);

  const initContracts = useCallback(async (signer) => {
    try {
      const [nftABI, usdcardABI] = await Promise.all([
        getContractABI('nft'),
        getContractABI('usdcard')
      ]);

      // Добавляем проверку на существование методов
      if (!nftABI.some(item => item.name === 'mint') || 
          !usdcardABI.some(item => item.name === 'mint')) {
        throw new Error('ABI is missing required methods');
      }

      setContracts({
        nft: new ethers.Contract(
          import.meta.env.VITE_NFT_ADDRESS,
          nftABI,
          signer
        ),
        usdcard: new ethers.Contract(
          import.meta.env.VITE_USDCARD_ADDRESS,
          usdcardABI,
          signer
        )
      });
    } catch (error) {
      console.error("Contract initialization failed:", error);
      throw error;
    }
  }, []);

  // ... остальной код контекста
};
