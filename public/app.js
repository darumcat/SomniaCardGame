// Получаем ABI из загруженных JSON
const nftAbi = JSON.parse(document.getElementById('nftAbi').textContent).abi;
const usdcardAbi = JSON.parse(document.getElementById('usdcardAbi').textContent).abi;
const gameAbi = JSON.parse(document.getElementById('gameAbi').textContent).abi;

// Адреса контрактов
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

// Подключение кошелька
document.getElementById('connectWallet').addEventListener('click', async () => {
  if (!window.ethereum) {
    alert('Установите MetaMask!');
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  initContracts();
  alert('Кошелек подключен: ' + await signer.getAddress());
});

// Инициализация контрактов
function initContracts() {
  nftContract = new ethers.Contract(CONTRACTS.NFT.address, CONTRACTS.NFT.abi, signer);
  usdcardContract = new ethers.Contract(CONTRACTS.USDCard.address, CONTRACTS.USDCard.abi, signer);
  gameContract = new ethers.Contract(CONTRACTS.CardGame.address, CONTRACTS.CardGame.abi, signer);
}

// Минт NFT
document.getElementById('mintNft').addEventListener('click', async () => {
  if (!nftContract) return alert('Сначала подключите кошелек!');
  try {
    await nftContract.mint();
    alert('NFT успешно создан!');
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});

// Минт USDCard
document.getElementById('mintUsdcard').addEventListener('click', async () => {
  if (!usdcardContract) return alert('Сначала подключите кошелек!');
  try {
    await usdcardContract.mint();
    alert('10,000 USDCard зачислены!');
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
});