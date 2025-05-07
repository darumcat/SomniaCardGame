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

function MintButton({ type, onClick, isProcessing }) {
  const buttonText = {
    NFT: isProcessing ? "Checking NFT..." : "Mint NFT",
    USDCard: isProcessing ? "Checking USDCard..." : "Mint 10,000 USDCard"
  };

  return (
    <button
      className="action-btn"
      onClick={onClick}
      disabled={isProcessing}
    >
      {buttonText[type]}
    </button>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingNFT, setIsCheckingNFT] = useState(false);
  const [isCheckingUSDCard, setIsCheckingUSDCard] = useState(false);

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

      const nftAbi = await fetch('./ABI/NFT.json').then(res => res.json());
      const usdcardAbi = await fetch('./ABI/USDCard.json').then(res => res.json());

      return {
        signer,
        nftContract: new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi.abi, signer),
        usdcardContract: new ethers.Contract(USDCARD_CONTRACT_ADDRESS, usdcardAbi.abi, signer)
      };
    } catch (error) {
      console.error("Error connecting contracts:", error);
      alert("Error connecting to blockchain");
      return null;
    }
  };

  const handleNFTMint = async () => {
    setIsCheckingNFT(true);
    try {
      const contracts = await getContracts();
      if (!contracts) return;

      const balance = await contracts.nftContract.balanceOf(account);
      if (balance.gt(0)) {
        alert("You already own an NFT! Check your wallet.");
        return;
      }

      const tx = await contracts.nftContract.mint();
      await tx.wait();
      alert("NFT successfully minted! Check your wallet.");
    } catch (error) {
      console.error("NFT error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCheckingNFT(false);
    }
  };

  const handleUSDCardMint = async () => {
    setIsCheckingUSDCard(true);
    try {
      const contracts = await getContracts();
      if (!contracts) return;

      // Альтернатива: если нет метода hasMinted — проверяем баланс
      const balance = await contracts.usdcardContract.balanceOf(account);
      if (balance.gt(0)) {
        alert("You already own USDCard! Check your wallet.");
        return;
      }

      const tx = await contracts.usdcardContract.mint();
      await tx.wait();
      alert("10,000 USDCard successfully minted! Check your wallet.");
    } catch (error) {
      console.error("USDCard error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCheckingUSDCard(false);
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
        `Wallet: ${account}\n` +
        `Nonce: ${Math.floor(Math.random() * 10000)}`;
      
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });
      
      setIsVerified(true);
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

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
              <MintButton 
                type="NFT"
                onClick={handleNFTMint}
                isProcessing={isCheckingNFT}
              />
              <MintButton 
                type="USDCard"
                onClick={handleUSDCardMint}
                isProcessing={isCheckingUSDCard}
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
