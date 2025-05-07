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
      ⚠️ Пожалуйста, переключитесь на Somnia Testnet (ChainID: 0xc488)
    </div>
  );
}

function VerificationMessage() {
  return (
    <div className="verification-message">
      <h3>Требуется верификация кошелька</h3>
      <p>Подпишите сообщение в MetaMask для подтверждения владения кошельком.</p>
      <ul>
        <li>Без комиссии за газ</li>
        <li>Используются только внутриигровые токены</li>
        <li>Для тестовой сети могут потребоваться небольшие комиссии STT</li>
      </ul>
    </div>
  );
}

function MintStatus({ hasMinted, isMinting, onMint, type }) {
  const messages = {
    NFT: {
      minted: "NFT уже заминчена",
      notMinted: "Нажмите чтобы заминтить NFT",
      minting: "Минтинг NFT..."
    },
    USDCard: {
      minted: "USDCard уже заминчены",
      notMinted: "Нажмите чтобы заминтить 10,000 USDCard",
      minting: "Минтинг USDCard..."
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

  // Адреса контрактов
  const NFT_CONTRACT_ADDRESS = "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641";
  const USDCARD_CONTRACT_ADDRESS = "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80";

  // Подключаемся к контрактам
  const connectContracts = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Импортируем ABI
    const nftAbi = await fetch('./abi/NFT.json').then(res => res.json());
    const usdcardAbi = await fetch('./abi/USDCard.json').then(res => res.json());

    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi.abi, signer);
    const usdcardContract = new ethers.Contract(USDCARD_CONTRACT_ADDRESS, usdcardAbi.abi, signer);

    return { nftContract, usdcardContract };
  };

  // Проверяем есть ли у пользователя NFT и USDCard
  const checkUserAssets = async () => {
    if (!account) return;

    try {
      const { nftContract, usdcardContract } = await connectContracts();
      
      // Проверяем NFT
      const nftBalance = await nftContract.balanceOf(account);
      setHasNFT(nftBalance.gt(0));
      
      // Проверяем USDCard
      const hasMintedUSDCard = await usdcardContract.hasMinted(account);
      setHasUSDCard(hasMintedUSDCard);
    } catch (error) {
      console.error("Ошибка при проверке активов:", error);
    }
  };

  // Минтим NFT
  const mintNFT = async () => {
    setIsMintingNFT(true);
    try {
      const { nftContract } = await connectContracts();
      const tx = await nftContract.mint();
      await tx.wait();
      setHasNFT(true);
      alert("NFT успешно заминчена!");
    } catch (error) {
      console.error("Ошибка при минте NFT:", error);
      alert("Ошибка при минте NFT: " + error.message);
    } finally {
      setIsMintingNFT(false);
    }
  };

  // Минтим USDCard
  const mintUSDCard = async () => {
    setIsMintingUSDCard(true);
    try {
      const { usdcardContract } = await connectContracts();
      const tx = await usdcardContract.mint();
      await tx.wait();
      setHasUSDCard(true);
      alert("10,000 USDCard успешно заминчены!");
    } catch (error) {
      console.error("Ошибка при минте USDCard:", error);
      alert("Ошибка при минте USDCard: " + error.message);
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
      const message = `Подпишите это сообщение для подтверждения владения кошельком.\n\n` +
        `Это действие не требует комиссий за газ или токенов.\n` +
        `Обратите внимание: только внутриигровые токены (созданные через этот сайт) будут использоваться для игровых транзакций.\n` +
        `Также могут потребоваться небольшие комиссии тестовой сети (STT), необходимые для Somnia Testnet.\n\n` +
        `Кошелек: ${account}\n` +
        `Nonce: ${Math.floor(Math.random() * 10000)}`;
      
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });
      
      setIsVerified(true);
      await checkUserAssets();
    } catch (error) {
      console.error('Ошибка верификации:', error);
      alert('Верификация кошелька отменена');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Пожалуйста, установите расширение MetaMask');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      await checkNetwork();
    } catch (error) {
      console.error('Ошибка подключения:', error);
      alert(`Не удалось подключиться: ${error.message}`);
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
              Подключить MetaMask
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
              {isLoading ? 'Ожидание подписи...' : 'Подтвердить кошелек'}
            </button>
          </div>
        ) : (
          <div className="game-section">
            <h2>Добро пожаловать в Somnia Card Game</h2>
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