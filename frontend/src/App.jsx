import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
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
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [CardGameABI, setCardGameABI] = useState(null);
  const [NFTABI, setNFTABI] = useState(null);
  const [USDCardABI, setUSDCardABI] = useState(null);

  // Загружаем ABI файлы
  useEffect(() => {
    const loadABIs = async () => {
      try {
        const cardGameRes = await fetch('/CardGame.json');
        const nftRes = await fetch('/NFT.json');
        const usdCardRes = await fetch('/USDCard.json');
        
        if (!cardGameRes.ok || !nftRes.ok || !usdCardRes.ok) {
          throw new Error('Ошибка загрузки ABI файлов');
        }

        const cardGameData = await cardGameRes.json();
        const nftData = await nftRes.json();
        const usdCardData = await usdCardRes.json();

        setCardGameABI(cardGameData.abi);
        setNFTABI(nftData.abi);
        setUSDCardABI(usdCardData.abi);
      } catch (err) {
        console.error('Ошибка загрузки ABI:', err);
        setError('Не удалось загрузить ABI');
      }
    };

    loadABIs();
  }, []);

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

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✍️ Подписание сообщения
      const message = `Sign in to Somnia Card Game.
      This signature is required to verify your identity. No funds will be withdrawn from your wallet. Only in-game transactions using internal assets may occur.`;
      await signer.signMessage(message);

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
