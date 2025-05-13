const { useState, useEffect } = React;

// Константы для Google Sheets
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwa2Vw6m5QX2R4dM9rBSMEwa9Otr8wStI8vr_cyo_10vwXrsB60LViGHq8tcpYxQV6VJg/exec";
const SHEET_ID = "174UJqeEN3MXeRkQNdnaK8V6bquo6Ce5rzsumQ9OWO3I"; // Замените на ваш ID таблицы

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

function AddTokenButton() {
  const addTokenToMetaMask = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0x6B50Dd99609b7C7790fA41E3050eBEBB3aF2d213',
            symbol: 'USDCD',
            decimals: 18,
            image: 'https://pink-defiant-koi-687.mypinata.cloud/ipfs/bafkreiggz5q3jc3qgc2fcuik7apeha3u3m4jesbegdzi76iskyozao4o4a',
          },
        },
      });
      alert('USDCard token successfully added to MetaMask!');
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token to MetaMask');
    }
  };

  return (
    <button className="action-btn" onClick={addTokenToMetaMask}>
      Add USDCard to MetaMask
    </button>
  );
}

function Leaderboard({ players, userAddress, userBalance }) {
  const formatAddress = (addr) => 
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div className="leaderboard">
      <h3>Top Players</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>USDCard</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index} className={player.address === userAddress ? 'highlight' : ''}>
              <td>{index + 1}</td>
              <td>{player.balance}</td>
              <td>{formatAddress(player.address)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {userBalance !== null && (
        <div className="user-position">
          <p>Your balance: {userBalance} USDCD</p>
        </div>
      )}
    </div>
  );
}

function GameSection({ account, contracts }) {
  const [players, setPlayers] = useState([]);
  const [userBalance, setUserBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateGoogleSheet = async (address, balance) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, balance })
      });
    } catch (error) {
      console.error('Google Sheets error:', error);
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const balance = await contracts.usdcardContract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      setUserBalance(formattedBalance);

      await updateGoogleSheet(account, formattedBalance);

      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
      );
      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));

      const playersData = json.table.rows.map(row => ({
        address: row.c[0].v,
        balance: row.c[1].v
      })).sort((a, b) => b.balance - a.balance);

      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contracts) loadLeaderboard();
  }, [contracts, account]);

  return (
    <div className="game-section">
      <h2>Welcome to Somnia Card Game</h2>
      <div className="action-buttons">
        <AddTokenButton />
        <button 
          className="action-btn"
          onClick={loadLeaderboard}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh Leaderboard'}
        </button>
        <button 
          className="action-btn play-btn"
          onClick={() => alert('Game "Durak" will start soon')}
        >
          Play Durak (10 USDCard fee)
        </button>
      </div>
      <Leaderboard 
        players={players} 
        userAddress={account} 
        userBalance={userBalance}
      />
    </div>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nftStatus, setNftStatus] = useState({ isMinted: false, isProcessing: false });
  const [usdcardStatus, setUsdcardStatus] = useState({ isMinted: false, isProcessing: false });
  const [contracts, setContracts] = useState(null);

  const NFT_CONTRACT_ADDRESS = "0xF83B0C394226c9Aa974e6D1cD62Bc1ABC062F81d";
  const USDCARD_CONTRACT_ADDRESS = "0x6B50Dd99609b7C7790fA41E3050eBEBB3aF2d213";

  const getContracts = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return null;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const nftAbi = await fetch('./abi/NFT.json').then(res => res.json());
      const usdcardAbi = await fetch('./abi/USDCard.json').then(res => res.json());

      const newContracts = {
        nftContract: new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi.abi, signer),
        usdcardContract: new ethers.Contract(USDCARD_CONTRACT_ADDRESS, usdcardAbi.abi, signer)
      };

      setContracts(newContracts);
      return newContracts;
    } catch (error) {
      console.error("Error connecting contracts:", error);
      alert("Error connecting to blockchain");
      return null;
    }
  };

  const checkAssetStatus = async () => {
    if (!account || !isVerified) return;

    try {
      const contracts = await getContracts();
      if (!contracts) return;

      setNftStatus(prev => ({ ...prev, isProcessing: true }));
      setUsdcardStatus(prev => ({ ...prev, isProcessing: true }));

      const nftBalance = await contracts.nftContract.balanceOf(account);
      const hasMintedNFT = await contracts.nftContract.hasMinted(account);
      setNftStatus({ isMinted: nftBalance.gt(0) || hasMintedNFT, isProcessing: false });

      const hasMintedUSDCard = await contracts.usdcardContract.hasMinted(account);
      setUsdcardStatus({ isMinted: hasMintedUSDCard, isProcessing: false });

    } catch (error) {
      console.error("Error checking assets:", error);
      setNftStatus(prev => ({ ...prev, isProcessing: false }));
      setUsdcardStatus(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleMint = async (assetType) => {
    if (!account) return;

    try {
      if (assetType === 'NFT') {
        setNftStatus(prev => ({ ...prev, isProcessing: true }));
      } else {
        setUsdcardStatus(prev => ({ ...prev, isProcessing: true }));
      }

      const contracts = await getContracts();
      if (!contracts) return;

      if (assetType === 'NFT') {
        const tx = await contracts.nftContract.mint();
        await tx.wait();
        setNftStatus({ isMinted: true, isProcessing: false });
        alert("NFT successfully minted!");
      } else if (assetType === 'USDCard') {
        const tx = await contracts.usdcardContract.mint();
        await tx.wait();
        setUsdcardStatus({ isMinted: true, isProcessing: false });
        alert("10,000 USDCard successfully minted!");
      }
    } catch (error) {
      console.error(`Error minting ${assetType}:`, error);
      alert(`Error: ${error.message}`);
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
        `Please note: Only in-game tokens (minted through this site) will be used for gameplay transactions.\n\n` +
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
          <>
            <div className="mint-section">
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
            <GameSection account={account} contracts={contracts} />
          </>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
