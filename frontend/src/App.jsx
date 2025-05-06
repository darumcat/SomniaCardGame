import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Импортируем ABI контрактов с помощью require
const CardGameArtifact = require('../contracts/CardGame.json');
const NFTArtifact = require('../contracts/NFT.json');
const USDCardArtifact = require('../contracts/USDCard.json');

const SOMNIA_CONFIG = {
  chainId: '0xC488', // 50312 в HEX
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
};

// Адреса контрактов
const CONTRACT_ADDRESSES = {
  CardGame: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512',
  NFT: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  USDCard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
};

export default function App() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState({});

  // Проверка и переключение сети при необходимости
  const ensureCorrectNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== SOMNIA_CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SOMNIA_CONFIG.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SOMNIA_CONFIG],
              });
            } catch (addError) {
              console.error('Ошибка добавления сети:', addError);
              return false;
            }
          } else {
            console.error('Ошибка переключения сети:', switchError);
            return false;
          }
        }
      }
      return true;
    } catch (err) {
      console.error('Ошибка проверки сети:', err);
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
      const isCorrectNetwork = await ensureCorrectNetwork();
      if (!isCorrectNetwork) {
        throw new Error(`Please connect to ${SOMNIA_CONFIG.chainName}`);
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Подписание сообщения
      const message = `Sign in to Somnia Card Game.

This signature is required to verify your identity. No funds will be withdrawn from your wallet. Only in-game transactions using internal assets may occur.`;
      await signer.signMessage(message);

      // Подключение контрактов
      const cardGame = new ethers.Contract(CONTRACT_ADDRESSES.CardGame, CardGameArtifact.abi, signer);
      const nft = new ethers.Contract(CONTRACT_ADDRESSES.NFT, NFTArtifact.abi, signer);
      const usdCard = new ethers.Contract(CONTRACT_ADDRESSES.USDCard, USDCardArtifact.abi, signer);

      setContracts({ cardGame, nft, usdCard });
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

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
