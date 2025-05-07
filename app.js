// Деструктуризация React-хуков
const { useState, useEffect } = React;

// Компонент Header
function Header({ account, connectWallet }) {
  return (
    <header>
      <h1>🎮 Somnia Card Game</h1>
      {account ? (
        <p className="wallet-address">
          {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button onClick={connectWallet} className="connect-btn">
          Connect Wallet
        </button>
      )}
    </header>
  );
}

// Компонент предупреждения о сети
function NetworkAlert() {
  return (
    <div className="network-alert">
      ⚠️ Switch to Somnia Testnet in MetaMask (ChainID: 0xc488)
    </div>
  );
}

// Главный компонент
function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Проверка сети
  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === '0xc488');
    }
  };

  // Подключение кошелька
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Эффекты при загрузке
  useEffect(() => {
    // Проверка мобильного устройства
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    
    // Слушатели изменений
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
      });
      
      window.ethereum.on('chainChanged', checkNetwork);
    }
  }, []);

  return (
    <div className="app-container">
      <Header account={account} connectWallet={connectWallet} />
      
      {!isCorrectNetwork && <NetworkAlert />}
      
      <div className="game-area">
        {account ? (
          <div className="game-ui">
            <button className="action-btn" onClick={() => alert('Mint NFT')}>
              Mint NFT
            </button>
            <button className="action-btn" onClick={() => alert('Mint USDCard')}>
              Mint 10,000 USDCard
            </button>
          </div>
        ) : (
          <p className="connect-hint">
            Connect your wallet to start playing
          </p>
        )}
      </div>
    </div>
  );
}

// Рендеринг приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);