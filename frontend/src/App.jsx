import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Конфигурация сети Somnia (Chain ID 50312)
const SOMNIA_CONFIG = {
  chainId: '0xc488', // 50312 в HEX
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'SOM', // Официальный символ
    decimals: 18
  },
  rpcUrls: ['https://rpc.somnia.network'], // Основной RPC endpoint
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
  iconUrls: ['https://somnia.network/logo.png'] // Логотип сети
};

const CONTRACTS = {
  NFT: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  USDCARD: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  CARDGAME: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'
};

export default function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Проверка подключения при загрузке
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await checkWalletConnection();
        setupEventListeners();
      }
    };
    init();

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const setupEventListeners = () => {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const checkWalletConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await setupProvider(accounts[0]);
      }
    } catch (err) {
      console.error('Auto-connect error:', err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      resetConnection();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    if (chainId !== SOMNIA_CONFIG.chainId) {
      setError(`Please switch to ${SOMNIA_CONFIG.chainName}`);
    } else {
      setError(null);
      window.location.reload();
    }
  };

  const resetConnection = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  const setupProvider = async (account) => {
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      setSigner(await browserProvider.getSigner());
      setAccount(account);
      setError(null);
    } catch (err) {
      console.error('Provider setup error:', err);
      setError('Failed to setup provider');
    }
  };

  const switchToSomniaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [SOMNIA_CONFIG]
      });
      return true;
    } catch (err) {
      console.error('Network switch error:', err);
      setError('Failed to switch to Somnia network');
      return false;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Подключаем аккаунт
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }).catch(err => {
        if (err.code === 4001) {
          setError('Connection rejected by user');
          return null;
        }
        throw err;
      });

      if (!accounts) return;

      // 2. Проверяем сеть
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SOMNIA_CONFIG.chainId) {
        const switched = await switchToSomniaNetwork();
        if (!switched) return;
      }

      // 3. Инициализируем провайдер
      await setupProvider(accounts[0]);
      
    } catch (err) {
      setError(err.message || 'Connection failed');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Somnia Card Game</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!account ? (
        <button 
          className="connect-button"
          onClick={connectWallet}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      ) : (
        <div className="wallet-info">
          <h2>Wallet Connected</h2>
          <p>Account: {`${account.slice(0, 6)}...${account.slice(-4)}`}</p>
          
          <div className="network-info">
            <span>Network:</span>
            <strong>{SOMNIA_CONFIG.chainName}</strong>
          </div>

          {/* Здесь будут компоненты для работы с контрактами */}
        </div>
      )}
    </div>
  );
}
