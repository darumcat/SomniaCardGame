// Компонент Header
function Header({ account, connectWallet }) {
  return (
    <header>
      <h1>Somnia Card Game</h1>
      {account ? (
        <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet} className="connect-wallet-btn">
          Connect Wallet
        </button>
      )}
    </header>
  );
}

// Компонент NetworkAlert
function NetworkAlert() {
  return (
    <div className="network-alert">
      <p>Please switch to Somnia Testnet in MetaMask!</p>
    </div>
  );
}

// Главный компонент App
function App() {
  const [account, setAccount] = useState('');
  const [isSomniaNetwork, setIsSomniaNetwork] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileGuide, setShowMobileGuide] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsSomniaNetwork(chainId === '0xc488');
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        if (isMobile) {
          const wcUrl = `https://metamask.app.link/wc?uri=${encodeURIComponent(`https://${window.location.hostname}/connect`)}`;
          window.location.href = wcUrl;
          return;
        }
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert(`Connection failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  if (showMobileGuide) {
    return (
      <div className="mobile-guide">
        <h2>Mobile Connection Guide</h2>
        <ol>
          <li>Open in MetaMask browser</li>
          <li>Refresh the page</li>
          <li>Click "Connect Wallet"</li>
        </ol>
        <button 
          onClick={() => window.location.href = `https://metamask.app.link/browser/${encodeURIComponent(window.location.href)}`}
          className="action-btn"
        >
          Open in MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <Header account={account} connectWallet={connectWallet} />
      {!isSomniaNetwork && <NetworkAlert />}
      <div className="dashboard">
        {/* Game components will go here */}
      </div>
    </div>
  );
}

// Инициализация React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);