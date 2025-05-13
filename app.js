const { useState, useEffect } = React;

// Константы
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbww1aZoAnZx1HvaE33VW7N9MYyUevH_bmrhIBiu7SBunthR93Q58oeRDnbcnLyvfumiHg/exec";
const SHEET_ID = "174UJqeEN3MXeRkQNdnaK8V6bquo6Ce5rzsumQ9OWO3I";
const NFT_CONTRACT_ADDRESS = "0xdE3252Ba19C00Cb75c205b0e4835312dF0e8bdDF";
const USDCARD_CONTRACT_ADDRESS = "0x0Bcbe06d75491470D5bBE2e6F2264c5DAa55621b";
const ADMIN_ADDRESS = "0x32B26a75Deaf84ACf1e5F67CB680FAD9fb2C783a";

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
            address: USDCARD_CONTRACT_ADDRESS,
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

function LeaderboardScreen({ players, onBackClick, onRefresh, account }) {
  const formatAddress = (addr) => 
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <button className="back-btn" onClick={onBackClick}>
          ← Back to Game
        </button>
        <h2>Top 100 Players</h2>
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      
      <div className="leaderboard-container">
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
              <tr key={index} className={player.address.toLowerCase() === account?.toLowerCase() ? 'highlight' : ''}>
                <td>{index + 1}</td>
                <td>{player.balance.toLocaleString()}</td>
                <td>{formatAddress(player.address)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameSection({ account, contracts, onLeaderboardClick }) {
  return (
    <div className="game-section">
      <h2>Welcome to Somnia Card Game</h2>
      <div className="action-buttons">
        <AddTokenButton />
        <button 
          className="action-btn play-btn"
          onClick={() => alert('Game "Durak" will start soon')}
        >
          Play Durak (10 USDCard fee)
        </button>
        <button 
          className="action-btn leaderboard-btn"
          onClick={onLeaderboardClick}
        >
          View Leaderboard
        </button>
      </div>
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [players, setPlayers] = useState([]);

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

  const updateLeaderboard = async (address, balance) => {
    console.log("Attempting to update leaderboard:", { address, balance });
    
    if (!address || address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      console.log("Skipped - admin address or empty address");
      return { status: "skipped" };
    }
  
    try {
      const payload = { 
        address: address.toLowerCase(),
        balance: parseFloat(balance)
      };
  
      console.log("Sending payload:", payload);
  
      // Пробуем стандартный запрос с обработкой CORS
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("Update successful (standard mode):", result);
          return result;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (standardError) {
        console.warn("Standard POST failed, trying no-cors:", standardError);
        
        // Fallback: no-cors режим
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log("Request sent (no-cors fallback mode)");
        return { status: "success_no_cors" };
      }
    } catch (error) {
      console.error('Leaderboard update failed:', error);
      return { 
        status: 'error', 
        message: error.message,
        details: error.stack 
      };
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // 1. Сначала обновляем баланс текущего пользователя (если он подключен)
      if (account && contracts) {
        try {
          const balance = await contracts.usdcardContract.balanceOf(account);
          const formattedBalance = ethers.utils.formatUnits(balance, 18);
          await updateLeaderboard(account, formattedBalance);
        } catch (updateError) {
          console.warn("Failed to update user balance:", updateError);
          // Продолжаем загрузку даже если обновление не удалось
        }
      }
  
      // 2. Загружаем лидерборд с прокси-параметром для CORS
      const timestamp = Date.now(); // Добавляем timestamp чтобы избежать кеширования
      const leaderboardUrl = `${GOOGLE_SCRIPT_URL}?action=getLeaderboard&t=${timestamp}`;
      
      const response = await fetch(leaderboardUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // 3. Обрабатываем данные
      const playersData = (Array.isArray(data) ? data : [])
        .filter(player => 
          player.address && 
          player.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase() && 
          !isNaN(player.balance)
        )
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 100);
  
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      
      // Показываем пользователю понятное сообщение
      let errorMessage = 'Failed to load leaderboard';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += ' - Network error. Please check your connection.';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAssetStatus = async () => {
    if (!account || !isVerified) return;

    try {
      const contracts = await getContracts();
      if (!contracts) return;

      setNftStatus(prev => ({ ...prev, isProcessing: true }));
      setUsdcardStatus(prev => ({ ...prev, isProcessing: true }));

      // Проверяем NFT
      const nftBalance = await contracts.nftContract.balanceOf(account);
      const hasMintedNFT = await contracts.nftContract.hasMinted(account);
      setNftStatus({ isMinted: nftBalance.gt(0) || hasMintedNFT, isProcessing: false });

      // Проверяем USDCard
      const hasMintedUSDCard = await contracts.usdcardContract.hasMinted(account);
      setUsdcardStatus({ isMinted: hasMintedUSDCard, isProcessing: false });

      // Обновляем баланс в лидерборде
      if (hasMintedUSDCard) {
        const balance = await contracts.usdcardContract.balanceOf(account);
        await updateLeaderboard(account, ethers.utils.formatUnits(balance, 18));
      }
    } catch (error) {
      console.error("Error checking assets:", error);
      setNftStatus(prev => ({ ...prev, isProcessing: false }));
      setUsdcardStatus(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleMint = async (assetType) => {
    if (!account) return;
  
    try {
      const contracts = await getContracts();
      if (!contracts) return;
  
      if (assetType === 'NFT') {
        const hasMinted = await contracts.nftContract.hasMinted(account);
        if (hasMinted) {
          setNftStatus({ isMinted: true, isProcessing: false });
          return alert("You've already minted NFT");
        }
  
        setNftStatus(prev => ({ ...prev, isProcessing: true }));
        const tx = await contracts.nftContract.mint();
        await tx.wait();
        setNftStatus({ isMinted: true, isProcessing: false });
        alert("NFT successfully minted!");
      } else if (assetType === 'USDCard') {
        const hasMinted = await contracts.usdcardContract.hasMinted(account);
        if (hasMinted) {
          setUsdcardStatus({ isMinted: true, isProcessing: false });
          return alert("You've already minted USDCard");
        }
  
        setUsdcardStatus(prev => ({ ...prev, isProcessing: true }));
        const tx = await contracts.usdcardContract.mint();
        await tx.wait();
        setUsdcardStatus({ isMinted: true, isProcessing: false });
  
        const balance = await contracts.usdcardContract.balanceOf(account);
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        await updateLeaderboard(account, formattedBalance);
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

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === '0xc488');
    }
  };

  useEffect(() => {
    if (contracts && isVerified) {
      contracts.usdcardContract.on("BalanceChanged", (user, balance) => {
        if (user.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
          updateLeaderboard(user, ethers.utils.formatUnits(balance, 18));
        }
      });

      return () => {
        contracts.usdcardContract.removeAllListeners("BalanceChanged");
      };
    }
  }, [contracts, isVerified]);

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
        ) : showLeaderboard ? (
          <LeaderboardScreen 
            players={players} 
            onBackClick={() => setShowLeaderboard(false)}
            onRefresh={loadLeaderboard}
            account={account}
          />
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
            <GameSection 
              account={account} 
              contracts={contracts} 
              onLeaderboardClick={() => {
                loadLeaderboard();
                setShowLeaderboard(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);