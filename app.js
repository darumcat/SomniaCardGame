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

function MintStatus({ hasMinted, isMinting, onMint, type }) {
  const messages = {
    NFT: {
      minted: "NFT already minted",
      notMinted: "Click to mint NFT",
      minting: "Minting NFT..."
    },
    USDCard: {
      minted: "USDCard already minted",
      notMinted: "Click to mint 10,000 USDCard",
      minting: "Minting USDCard..."
    }
  };

  return (
    <div className="mint-status">
      <button 
        className={`action-btn ${hasMinted ? 'minted' : ''}`}
        onClick={onMint}
        disabled={isMinting || hasMinted}
      >
        {isMinting ? messages[type].minting : 
         hasMinted ? messages[type].minted : messages[type].notMinted}
      </button>
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [hasUSDCard, setHasUSDCard] = useState(false);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [isMintingUSDCard, setIsMintingUSDCard] = useState(false);

  // Contract addresses
  const NFT_CONTRACT_ADDRESS = "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641";
  const USDCARD_CONTRACT_ADDRESS = "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80";

  // Connect to contracts
  const connectContracts = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Import ABIs
    const nftAbi = await fetch('./abi/NFT.json').then(res => res.json());
    const usdcardAbi = await fetch('./abi/USDCard.json').then(res => res.json());

    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi.abi, signer);
    const usdcardContract = new ethers.Contract(USDCARD_CONTRACT_ADDRESS, usdcardAbi.abi, signer);

    return { nftContract, usdcardContract };
  };

  // Check user assets
  const checkUserAssets = async () => {
    if (!account) return;

    try {
      const { nftContract, usdcardContract } = await connectContracts();
      
      // Check NFT
      const nftBalance = await nftContract.balanceOf(account);
      setHasNFT(nftBalance.gt(0));
      
      // Check USDCard
      const hasMintedUSDCard = await usdcardContract.hasMinted(account);
      setHasUSDCard(hasMintedUSDCard);
    } catch (error) {
      console.error("Error checking assets:", error);
    }
  };

  // Mint NFT
  const mintNFT = async () => {
    setIsMintingNFT(true);
    try {
      const { nftContract } = await connectContracts();
      const tx = await nftContract.mint();
      await tx.wait();
      setHasNFT(true);
      alert("NFT successfully minted!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Error minting NFT: " + error.message);
    } finally {
      setIsMintingNFT(false);
    }
  };

  // Mint USDCard
  const mintUSDCard = async () => {
    setIsMintingUSDCard(true);
    try {
      const { usdcardContract } = await connectContracts();
      const tx = await usdcardContract.mint();
      await tx.wait();
      setHasUSDCard(true);
      alert("10,000 USDCard successfully minted!");
    } catch (error) {
      console.error("Error minting USDCard:", error);
      alert("Error minting USDCard: " + error.message);
    } finally {
      setIsMintingUSDCard(false);
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
      await checkUserAssets();
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
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
        setIsVerified(false);
        setHasNFT(false);
        setHasUSDCard(false);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      if (account && isVerified) {
        checkUserAssets();
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
              <MintStatus 
                hasMinted={hasNFT}
                isMinting={isMintingNFT}
                onMint={mintNFT}
                type="NFT"
              />
              <MintStatus 
                hasMinted={hasUSDCard}
                isMinting={isMintingUSDCard}
                onMint={mintUSDCard}
                type="USDCard"
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