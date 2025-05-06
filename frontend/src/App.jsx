import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Конфигурация сети Somnia Testnet
const SOMNIA_CONFIG = {
  chainId: '0xC488', // 50312 в HEX
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
  iconUrls: ['https://somnia.network/logo.png']
};

export default function App() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Проверка подключения при загрузке
  useEffect(() => {
    if (window.ethereum) {
      checkWalletConnection();
      setupEventListeners();
    }
  }, []);

  const setupEventListeners = () => {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const checkWalletConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error('Auto-connect error:', err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    setAccount(accounts[0] || null);
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  // НОВЫЙ МЕТОД ДОБАВЛЕНИЯ СЕТИ
  const addSomniaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: SOMNIA_CONFIG.chainId,
          chainName: SOMNIA_CONFIG.chainName,
          nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
          rpcUrls: SOMNIA_CONFIG.rpcUrls,
          blockExplorerUrls: SOMNIA_CONFIG.blockExplorerUrls
        }]
      });
      return true;
    } catch (err) {
      console.error('Network add error:', err);
      setError('Failed to add Somnia network');
      return false;
    }
  };

  // ОСНОВНОЕ ПОДКЛЮЧЕНИЕ
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Запрос аккаунтов
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }).catch(err => {
        if (err.code === 4001) throw new Error('Connection rejected');
        throw err;
      });

      // 2. Проверка сети
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SOMNIA_CONFIG.chainId) {
        try {
          // Попытка переключения
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SOMNIA_CONFIG.chainId }],
          });
        } catch (switchError) {
          // Если сеть не добавлена, добавляем
          if (switchError.code === 4902) {
            const added = await addSomniaNetwork();
            if (!added) return;
          } else {
            throw switchError;
          }
        }
      }

      // 3. Успешное подключение
      setAccount(accounts[0]);
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Somnia Card Game</h1>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {!account ? (
        <button 
          onClick={connectWallet}
          disabled={isLoading}
          className="connect-button"
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      ) : (
        <div className="wallet-info">
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>Network: Somnia Testnet</p>
        </div>
      )}
    </div>
  );
}
