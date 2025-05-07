const { useState, useEffect } = React;

function Header({ account, isVerified }) {
  return (
    <header>
      <h1>🎮 Somnia Card Game</h1>
      {account && (
        <div className="wallet-info">
          <span className="wallet-address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          {isVerified && <span className="verified-badge">Verified</span>}
        </div>
      )}
    </header>
  );
}

function NetworkAlert() {
  return (
    <div className="network-alert">
      ⚠️ Please switch to Somnia Testnet (ChainID: 0xc488)
    </div>
  );
}

function VerificationMessage() {
  return (
    <div className="verification-message">
      <h3>Wallet Verification Required</h3>
      <p>Sign the message in MetaMask to verify wallet ownership.</p>
      <ul>
        <li>No gas fees required</li>
        <li>Only uses in-game tokens</li>
        <li>Testnet may require minor STT gas fees</li>
      </ul>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === '0xc488');
    }
  };

  const verifyWallet = async () => {
    if (!account) return;
    
    setIsLoading(true);
    
    try {
      const message = `Sign this message to verify ownership of your wallet.\n\n` +
        `This action will not cost any gas or tokens.\n` +
        `Please note: Only in-game tokens (minted through this site) will be used for gameplay transactions.\n` +
        `You may also encounter minor testnet gas fees (STT) required by the Somnia Testnet.\n\n` +
        `Wallet: ${account}\n` +
        `Nonce: ${Math.floor(Math.random() * 10000)}`;
      
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });
      
      setIsVerified(true);
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Wallet verification cancelled');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask extension');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      await checkNetwork();
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect: ${error.message}`);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
        setIsVerified(false);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="app-container">
      <Header account={account} isVerified={isVerified} />
      
      {!isCorrectNetwork && <NetworkAlert />}
      
      <div className="main-content">
        {!account ? (
          <div className="connect-section">
            <button className="connect-btn" onClick={connectWallet}>
              Connect MetaMask
            </button>
            <VerificationMessage />
          </div>
        ) : !isVerified ? (
          <div className="verification-section">
            <VerificationMessage />
            <button 
              className="verify-btn" 
              onClick={verifyWallet}
              disabled={isLoading}
            >
              {isLoading ? 'Waiting for Signature...' : 'Verify Wallet'}
            </button>
          </div>
        ) : (
          <div className="game-section">
            <h2>Welcome to Somnia Card Game</h2>
            <div className="action-buttons">
              <button className="action-btn">
                Mint NFT
              </button>
              <button className="action-btn">
                Mint 10,000 USDCard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);