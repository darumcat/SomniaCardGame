import { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed!');
        }

        // Запрос доступа к аккаунту
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);

        // Проверка сети (например, Polygon Mumbai Testnet)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x13881') { // Замените на нужный chainId
          toast.error('Please switch to Mumbai Testnet');
          throw new Error('Wrong network');
        }

        // Инициализация провайдера и контрактов
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Инициализация контрактов
        const nftContract = new ethers.Contract(
          process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
          NFT_ABI,
          signer
        );

        const usdcardContract = new ethers.Contract(
          process.env.REACT_APP_USDCARD_CONTRACT_ADDRESS,
          USDCARD_ABI,
          signer
        );

        setContracts({ nftContract, usdcardContract });
        
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error(`Initialization failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3();

    // Обработчики изменений аккаунта/сети
    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Web3Context.Provider value={{ account, contracts }}>
      {children}
    </Web3Context.Provider>
  );
};
