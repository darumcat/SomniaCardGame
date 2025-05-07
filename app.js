import { useEffect, useState } from 'react';

const App = () => {
  const [account, setAccount] = useState('');
  const [isSomniaNetwork, setIsSomniaNetwork] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileGuide, setShowMobileGuide] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsSomniaNetwork(chainId === '0xc488'); // Somnia Testnet chain ID
    }
  };

  const connectWallet = async () => {
    try {
      if (account) return; // Не вызываем повторно, если уже подключено

      if (!window.ethereum) {
        if (isMobile) {
          const wcUrl = `https://metamask.app.link/wc?uri=${encodeURIComponent(`https://${window.location.hostname}/connect`)}`;
          const classicUrl = `https://metamask.app.link/browser/${encodeURIComponent(`${window.location.origin}?metamask_redirect=true`)}`;
          window.location.href = wcUrl;

          setTimeout(() => {
            if (!document.hidden) {
              window.location.href = classicUrl;
            }
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

        const message = `Sign this message to confirm you own this wallet.\n\nNo funds will be spent.\n\nOnly in-game tokens will be used inside the app after minting. Gas fees are paid in STT (Somnia Testnet token).`;
        await window.ethereum.request({
          method: 'personal_sign',
          params: [message, accounts[0]],
        });
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
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }

    if (isMobile) {
      setShowMobileGuide(true);
    }
  }, [isMobile]);

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
      <h1>Somnia Card Game</h1>
      <button 
        onClick={connectWallet} 
        className="connect-wallet-btn"
        disabled={!!account} // Блокируем, если кошелёк подключён
      >
        {account ? 'Connected' : 'Connect Wallet'}
      </button>
      {account && (
        <div className="wallet-status">
          Connected: {account}
        </div>
      )}
      {!isSomniaNetwork && (
        <div className="wallet-status" style={{ backgroundColor: '#ffdddd', color: '#000' }}>
          Please switch to the Somnia Testnet
        </div>
      )}
    </div>
  );
};

export default App;
