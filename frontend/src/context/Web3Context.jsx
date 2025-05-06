import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  isMetaMaskConnected, 
  initEthersProvider, 
  connectWallet,
  setupListeners
} from '../utils/web3';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initContracts = useCallback(async (signer) => {
    try {
      const nftContract = new ethers.Contract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        signer
      );
      
      const usdcardContract = new ethers.Contract(
        import.meta.env.VITE_USDCARD_CONTRACT_ADDRESS,
        USDCARD_ABI,
        signer
      );

      setContracts({ nftContract, usdcardContract });
    } catch (error) {
      console.error("Contract init error:", error);
      toast.error("Failed to load contracts");
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts) => {
    setAccount(accounts[0] || null);
    if (!accounts[0]) {
      setContracts(null);
    }
  }, []);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  const connect = useCallback(async () => {
    try {
      const { address, signer } = await connectWallet();
      setAccount(address);
      await initContracts(signer);
    } catch (error) {
      toast.error(error.message);
    }
  }, [initContracts]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await isMetaMaskConnected();
        if (isConnected) {
          const provider = initEthersProvider();
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          await initContracts(signer);
        }
      } catch (error) {
        console.error("Initial connection check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
    setupListeners({
      handleAccountsChanged,
      handleChainChanged
    });

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged, initContracts]);

  return (
    <Web3Context.Provider value={{ 
      account, 
      contracts, 
      isLoading, 
      connect 
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};
