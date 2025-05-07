async function loadABI(fileName) {
  try {
    const response = await fetch(`abi/${fileName}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.abi) throw new Error(`ABI field missing in ${fileName}`);
    return data.abi;
  } catch (error) {
    console.error(`Failed to load ABI (${fileName}):`, error);
    showError(`Ошибка загрузки ABI (${fileName}): ${error.message}`);
    return null;
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message') || createErrorElement();
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function createErrorElement() {
  const div = document.createElement('div');
  div.id = 'error-message';
  div.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px;
    background: #ff4444;
    color: white;
    border-radius: 5px;
    display: none;
    z-index: 1000;
  `;
  document.body.appendChild(div);
  return div;
}

document.addEventListener('DOMContentLoaded', async () => {
  const [nftAbi, usdcardAbi, gameAbi] = await Promise.all([
    loadABI('NFT.json'),
    loadABI('USDCard.json'),
    loadABI('CardGame.json')
  ]);

  if (!nftAbi || !usdcardAbi || !gameAbi) {
    return showError('Не удалось загрузить данные контрактов. Обновите страницу.');
  }

  const CONTRACTS = {
    NFT: {
      address: "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641",
      abi: nftAbi
    },
    USDCard: {
      address: "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80",
      abi: usdcardAbi
    },
    CardGame: {
      address: "0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512",
      abi: gameAbi
    }
  };

  let provider, signer, nftContract, usdcardContract, gameContract;

  document.getElementById('connectWallet').addEventListener('click', async () => {
    if (!window.ethereum) {
      return showError('Установите MetaMask! https://metamask.io');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();

      const network = await provider.getNetwork();
      if (network.chainId !== 12345) {
        showError('Подключитесь к Somnia Testnet в MetaMask');
        return;
      }

      initContracts();
      showError(`Кошелек подключен: ${accounts[0]}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
      showError(`Ошибка подключения: ${error.message}`);
    }
  });

  function initContracts() {
    try {
      nftContract = new ethers.Contract(CONTRACTS.NFT.address, CONTRACTS.NFT.abi, signer);
      usdcardContract = new ethers.Contract(CONTRACTS.USDCard.address, CONTRACTS.USDCard.abi, signer);
      gameContract = new ethers.Contract(CONTRACTS.CardGame.address, CONTRACTS.CardGame.abi, signer);
    } catch (error) {
      console.error('Contract init error:', error);
      showError('Ошибка инициализации контрактов');
    }
  }

  document.getElementById('mintNft').addEventListener('click', async () => {
    if (!nftContract) return showError('Сначала подключите кошелек!');

    try {
      const tx = await nftContract.mint();
      showError('Транзакция отправлена! Ожидайте подтверждения...');
      const receipt = await tx.wait();
      showError(`NFT успешно создан! Хэш: ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Mint NFT error:', error);
      showError(`Ошибка: ${error.message}`);
    }
  });

  document.getElementById('mintUsdcard').addEventListener('click', async () => {
    if (!usdcardContract) return showError('Сначала подключите кошелек!');

    try {
      const tx = await usdcardContract.mint();
      showError('Транзакция отправлена! Ожидайте подтверждения...');
      const receipt = await tx.wait();
      showError(`10,000 USDCard зачислены! Хэш: ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Mint USDCard error:', error);
      showError(`Ошибка: ${error.message}`);
    }
  });
});
