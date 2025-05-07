import { useEffect, useState } from 'react';
import './styles.css'; // Подключение основного стиля

const App = () => {
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
          const classicUrl = `https://metamask.app.link/browser/${encodeURIComponent(`${window.location.origin}?metamask_redirect=true`)}`;

          window.location.href = wcUrl;
          setTimeout(() => {
            if (!document.hidden) window.location.href = classicUrl;
          }, 1000);

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

    const params = new URLSearchParams(window.location.search);
    if (params.has('metamask_redirect') && window.ethereum) {
      connectWallet();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkNetwork();

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts.length > 0 ? accounts[0] : '');
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }

    if (mobileCheck) {
      setShowMobileGuide(true);
    }
  }, []);

  if (showMobileGuide) {
    return (
      <div className="mobile-guide">
        <h2>Mobile Connection Guide</h2>
        <ol>
          <li>Open the link in MetaMask browser</li>
          <li>Refresh the page after opening</li>
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
        {/* Здесь компоненты для игры */}
      </div>
    </div>
  );
};

export default App;
