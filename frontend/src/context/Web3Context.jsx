import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { CONTRACT_ADDRESSES, getContractABI } from './contracts';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [state, setState] = useState({
    account: null,
    contracts: null,
    isLoading: true,
    error: null,
    isMetaMaskInstalled: typeof window.ethereum !== 'undefined'
  });

  const initContracts = useCallback(async (signer) => {
    try {
      console.log('Initializing contracts...');
      
      const [nftABI, usdcardABI] = await Promise.all([
        getContractABI('nft'),
        getContractABI('usdcard')
      ]);

      // Валидация ABI
      const validateABI = (abi, contractName) => {
        if (!abi.some(item => item.name === 'mint')) {
          throw new Error(`${contractName} ABI missing mint function`);
        }
        if (!abi.some(item => item.name === 'hasMinted')) {
          console.warn(`${contractName} ABI may be incomplete - hasMinted function missing`);
        }
        return true;
      };

      validateABI(nftABI, 'NFT');
      validateABI(usdcardABI, 'USDCard');

      const contracts = {
        nft: new ethers.Contract(
          CONTRACT_ADDRESSES.nft,
          nftABI,
          signer
        ),
        usdcard: new ethers.Contract(
          CONTRACT_ADDRESSES.usdcard,
          usdcardABI,
          signer
        ),
        addresses: CONTRACT_ADDRESSES
      };

      // Тестовая проверка контрактов
      try {
        await Promise.all([
          contracts.nft.hasMinted(signer.address).catch(() => {}),
          contracts.usdcard.hasMinted(signer.address).catch(() => {})
        ]);
      } catch (testError) {
        console.warn('Contract test calls failed:', testError);
      }

      setState(prev => ({
        ...prev,
        contracts,
        error: null
      }));

      console.log('Contracts initialized successfully:', contracts);
    } catch (error) {
      console.error('Contract initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: error.message
      }));
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!state.isMetaMaskInstalled) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      console.log('Connected to:', {
        account: accounts[0],
        chainId: network.chainId,
        network: network.name
      });

      await initContracts(signer);

      setState(prev => ({
        ...prev,
        account: accounts[0],
        isLoading: false
      }));

      toast.success(`Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      toast.error(error.message.includes('rejected') 
        ? 'Connection rejected' 
        : 'Failed to connect wallet');
    }
  }, [initContracts, state.isMetaMaskInstalled]);

  useEffect(() => {
    if (!state.isMetaMaskInstalled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          await initContracts(signer);
          setState(prev => ({
            ...prev,
            account: accounts[0],
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Initial connection check failed:', error);
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
      console.log('Chain changed:', chainId);
      window.location.reload();
    };

    checkConnection();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [initContracts, state.isMetaMaskInstalled]);

  return (
    <Web3Context.Provider value={{
      ...state,
      connect: connectWallet,
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
