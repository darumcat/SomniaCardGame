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
      ⚠️ Please switch to Somnia Testnet
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

function MintButton({ assetType, isMinted, isProcessing, onClick }) {
  const buttonStates = {
    NFT: {
      default: "MINT NFT",
      checking: "CHECKING NFT...",
      minted: "NFT MINTED"
    },
    USDCard: {
      default: "MINT 10,000 USDCard",
      checking: "CHECKING USDCard...",
      minted: "USDCard MINTED"
    }
  };

  const getButtonText = () => {
    if (isProcessing) return buttonStates[assetType].checking;
    if (isMinted) return buttonStates[assetType].minted;
    return buttonStates[assetType].default;
  };

  return (
    <button
      className={`mint-btn ${isMinted ? 'minted' : ''} ${isProcessing ? 'processing' : ''}`}
      onClick={onClick}
      disabled={isProcessing || isMinted}
    >
      {getButtonText()}
    </button>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nftStatus, setNftStatus] = useState({ isMinted: false, isProcessing: false });
  const [usdcardStatus, setUsdcardStatus] = useState({ isMinted: false, isProcessing: false });

  // Contract addresses
  const NFT_CONTRACT_ADDRESS = "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641";
  const USDCARD_CONTRACT_ADDRESS = "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80";

  // Connect to contracts
  const getContracts = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return null;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Import ABIs
      const nftAbi = await fetch('./abi/NFT.json').then(res => res.json());
      const usdcardAbi = await fetch('./abi/USDCard.json').then(res => res.json());

      return {
        nftContract: new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi.abi, signer),
        usdcardContract: new ethers.Contract(USDCARD_CONTRACT_ADDRESS, usdcardAbi.abi, signer)
      };
    } catch (error) {
      console.error("Error connecting contracts:", error);
      alert("Error connecting to blockchain");
      return null;
    }
  };

  // Check asset status
  const checkAssetStatus = async () => {
    if (!account || !isVerified) return;

    try {
      const contracts = await getContracts();
      if (!contracts) return;

      // Check NFT
      const nftBalance = await contracts.nftContract.balanceOf(account);
      setNftStatus(prev => ({ ...prev, isMinted: nftBalance.gt(0) }));

      // Check USDCard
      const hasMintedUSDCard = await contracts.usdcardContract.hasMinted(account);
      setUsdcardStatus(prev => ({ ...prev, isMinted: hasMintedUSDCard }));

    } catch (error) {
      console.error("Error checking assets:", error);
    }
  };

  // Handle minting
  const handleMint = async (assetType) => {
    if (!account) return;

    try {
      // Set processing state
      if (assetType === 'NFT') {
        setNftStatus(prev => ({ ...prev, isProcessing: true }));
      } else {
        setUsdcardStatus(prev => ({ ...prev, isProcessing: true }));
      }

      const contracts = await getContracts();
      if (!contracts) return;

      if (assetType === 'NFT') {
        // Check NFT balance first
        const balance = await contracts.nftContract.balanceOf(account);
        if (balance.gt(0)) {
          setNftStatus({ isMinted: true, isProcessing: false });
          return;
        }

        // Mint NFT
        const tx = await contracts.nftContract.mint();
        await tx.wait();
        setNftStatus({ isMinted: true, isProcessing: false });
        alert("NFT successfully minted!");

      } else if (assetType === 'USDCard') {
        // Check USDCard status first
        const hasMinted = await contracts.usdcardContract.hasMinted(account);
        if (hasMinted) {
          setUsdcardStatus({ isMinted: true, isProcessing: false });
          return;
        }

        // Mint USDCard
        const tx = await contracts.usdcardContract.mint();
        await tx.wait();
        setUsdcardStatus({ isMinted: true, isProcessing: false });
        alert("10,000 USDCard successfully minted!");
      }

    } catch (error) {
      console.error(`Error minting ${assetType}:`, error);
      alert(`Error: ${error.message}`);
      
      // Reset processing state
      if (assetType === 'NFT') {
        setNftStatus(prev => ({ ...prev, isProcessing: false }));
      } else {
        setUsdcardStatus(prev => ({ ...prev, isProcessing: false }));
      }
    }
  };

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
      await checkAssetStatus();
    } catch (error) {
      console.error('Verification error:', error);
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
      window.ethereum.on('accountsChanged', async (accounts) => {
        setAccount(accounts[0] || '');
        setIsVerified(false);
        setNftStatus({ isMinted: false, isProcessing: false });
        setUsdcardStatus({ isMinted: false, isProcessing: false });
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      if (account && isVerified) {
        checkAssetStatus();
      }
    }
  }, [account, isVerified]);

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
              <MintButton 
                assetType="NFT"
                isMinted={nftStatus.isMinted}
                isProcessing={nftStatus.isProcessing}
                onClick={() => handleMint('NFT')}
              />
              <MintButton 
                assetType="USDCard"
                isMinted={usdcardStatus.isMinted}
                isProcessing={usdcardStatus.isProcessing}
                onClick={() => handleMint('USDCard')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);