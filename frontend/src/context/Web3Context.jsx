import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { 
  CONTRACT_ADDRESSES, 
  getContractABI, 
  checkNetwork, 
  switchToSomniaNetwork,
  SOMNIA_CONFIG
} from './contracts';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [state, setState] = useState({
    account: null,
    contracts: null,
    isLoading: true,
    error: null,
    isMetaMaskInstalled: false,
    isCorrectNetwork: false
  });

  const initContracts = useCallback(async (signer) => {
    try {
      const [nftABI, usdcardABI] = await Promise.all([
        getContractABI('nft'),
        getContractABI('usdcard')
      ]);

      // Проверка загрузки ABI
      if (!nftABI || !usdcardABI) {
        throw new Error("ABI files not found");
      }

      const contracts = {
        nft: new ethers.Contract(CONTRACT_ADDRESSES.nft, nftABI, signer),
        usdcard: new ethers.Contract(CONTRACT_ADDRESSES.usdcard, usdcardABI, signer),
        addresses: CONTRACT_ADDRESSES
      };

      setState(prev => ({ ...prev, contracts, error: null }));
      return contracts;
    } catch (error) {
      console.error("Contract initialization failed:", error);
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum?.isMetaMask) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Проверка сети
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await switchToSomniaNetwork();
        if (!switched) throw new Error('Please switch to Somnia Testnet');
      }

      // Запрос аккаунтов
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Инициализация провайдера и контрактов
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      await initContracts(signer);

      // Обновление состояния
      setState(prev => ({
        ...prev,
        account: accounts[0],
        isMetaMaskInstalled: true,
        isCorrectNetwork: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      toast.error(error.message.includes('rejected') 
        ? 'Connection rejected' 
        : error.message);
    }
  }, [initContracts]);

  useEffect(() => {
    const init = async () => {
      const isInstalled = !!window.ethereum;
      setState(prev => ({ ...prev, isMetaMaskInstalled: isInstalled }));

      if (!isInstalled) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const isCorrectNetwork = await checkNetwork();
          if (!isCorrectNetwork) {
            setState(prev => ({ ...prev, isCorrectNetwork: false }));
            return;
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          await initContracts(signer);

          setState(prev => ({
            ...prev,
            account: accounts[0],
            isCorrectNetwork: true,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    const handleAccountsChanged = (accounts) => {
      setState(prev => ({
        ...prev,
        account: accounts[0] || null,
        contracts: accounts[0] ? prev.contracts : null
      }));
    };

    const handleChainChanged = (chainId) => {
      const isCorrect = chainId === SOMNIA_CONFIG.chainId;
      setState(prev => ({ ...prev, isCorrectNetwork: isCorrect }));
      if (!isCorrect) toast.warning('Please switch to Somnia Testnet');
    };

    init();

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [initContracts]);

  return (
    <Web3Context.Provider value={{
      ...state,
      connect: connectWallet,
      networkConfig: SOMNIA_CONFIG,
      resetError: () => setState(prev => ({ ...prev, error: null }))
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
