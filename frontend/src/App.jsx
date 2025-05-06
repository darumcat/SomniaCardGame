import { useState, useEffect } from 'react';
import { useWeb3 } from './context/Web3Context';
import MintSection from './components/MintSection';
import GameLobby from './components/GameLobby';
import Leaderboard from './components/Leaderboard';
import './App.css';

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

export default function App() {
  const { account, nftBalance, connectWallet } = useWeb3();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('game'); // 'game' или 'leaderboard'

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
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SOMNIA_CONFIG],
              });
              return true;
            } catch (addError) {
              console.error('Ошибка добавления сети:', addError);
              return false;
            }
          }
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Ошибка проверки сети:', err);
      return false;
    }
  };

  const handleConnect = async () => {
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

      await connectWallet();
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
            onClick={handleConnect}
            disabled={isLoading}
            className="connect-button"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="game-container">
            <div className="tabs">
              <button 
                className={activeTab === 'game' ? 'active' : ''}
                onClick={() => setActiveTab('game')}
              >
                Game
              </button>
              <button 
                className={activeTab === 'leaderboard' ? 'active' : ''}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
            </div>

            {activeTab === 'game' ? (
              <>
                {nftBalance > 0 ? (
                  <GameLobby />
                ) : (
                  <>
                    <p>You need an NFT to play!</p>
                    <MintSection />
                  </>
                )}
              </>
            ) : (
              <Leaderboard />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
