import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, getContractABI } from './contracts';

// Утилиты можно оставить в отдельном файле или перенести сюда
const isMetaMaskInstalled = () => window.ethereum && window.ethereum.isMetaMask;

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [state, setState] = useState({
    account: null,
    contracts: null,
    isLoading: true,
    isMetaMaskInstalled: isMetaMaskInstalled()
  });

  const initContracts = useCallback(async (signer) => {
    try {
      const [nftABI, usdcardABI, gameABI] = await Promise.all([
        getContractABI('nft'),
        getContractABI('usdcard'),
        getContractABI('game')
      ]);

      const contracts = {
        nft: new ethers.Contract(CONTRACT_ADDRESSES.nft, nftABI, signer),
        usdcard: new ethers.Contract(CONTRACT_ADDRESSES.usdcard, usdcardABI, signer),
        game: new ethers.Contract(CONTRACT_ADDRESSES.game, gameABI, signer),
        addresses: CONTRACT_ADDRESSES
      };

      setState(prev => ({ ...prev, contracts }));
    } catch (error) {
      console.error("Contract init failed:", error);
      toast.error("Failed to initialize contracts");
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!state.isMetaMaskInstalled) {
      toast.error("Please install MetaMask first!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setState(prev => ({ ...prev, account: accounts[0] }));
      await initContracts(signer);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  }, [state.isMetaMaskInstalled, initContracts]);

  useEffect(() => {
    if (!state.isMetaMaskInstalled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const init = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setState(prev => ({ ...prev, account: accounts[0] }));
          await initContracts(signer);
        }
      } catch (error) {
        console.error("Initialization error:", error);
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

    const handleChainChanged = () => window.location.reload();

    init();
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [initContracts, state.isMetaMaskInstalled]);

  return (
    <Web3Context.Provider value={{
      ...state,
      connect: connectWallet
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
