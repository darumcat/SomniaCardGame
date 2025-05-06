import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers'; // Импортируем напрямую BrowserProvider
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
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
};

export default function App() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Проверка подключения сети
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === SOMNIA_CONFIG.chainId;
    } catch (err) {
      console.error('Network check error:', err);
      return false;
    }
  };

  // Основное подключение
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Проверка сети
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        throw new Error(`Please connect to ${SOMNIA_CONFIG.chainName}`);
      }

      // 2. Запрос аккаунтов
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // 3. Инициализация провайдера
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 4. Успешное подключение
      setAccount(accounts[0]);
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="content-container">
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
            <p>Network: {SOMNIA_CONFIG.chainName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
