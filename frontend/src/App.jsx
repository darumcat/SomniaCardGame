import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Конфигурация сети Somnia
const SOMNIA_CONFIG = {
  chainId: '0xC498', // 50312
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['https://shannon-explorer.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
};

// Адреса контрактов
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

  // Проверка подключения кошелька при загрузке
  useEffect(() => {
    if (window.ethereum) {
      checkWalletConnection();
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

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

  const handleChainChanged = () => {
    window.location.reload();
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    try {
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

      await setupProvider(accounts[0]);
      
      // Проверка сети
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== SOMNIA_CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SOMNIA_CONFIG]
          });
        } catch (err) {
          setError('Failed to switch network');
          console.error('Network switch error:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
      console.error('Wallet connection error:', err);
    }
  };

  return (
    <div className="App">
      <h1>Somnia Card Game</h1>
      
      {error && <div className="error">{error}</div>}

      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div className="wallet-info">
          <p>Connected: {account}</p>
          <p>Network: Somnia Testnet</p>
          {/* Добавьте здесь компоненты для работы с контрактами */}
        </div>
      )}
    </div>
  );
}
