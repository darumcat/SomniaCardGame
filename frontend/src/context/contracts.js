// frontend/src/context/contracts.js

export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',     // Адрес контракта NFT
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80', // Адрес контракта USDCard
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'     // Адрес контракта CardGame
};

// Асинхронная загрузка ABI-файлов
const loadABI = async (name) => {
  const response = await fetch(`${import.meta.env.BASE_URL}${name}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load ABI: ${name}.json`);
  }
  return await response.json();
};

// Получение ABI по названию контракта
export const getContractABI = async (contractName) => {
  if (contractName === 'game') return await loadABI('CardGame');
  if (contractName === 'nft') return await loadABI('NFT');
  if (contractName === 'usdcard') return await loadABI('USDCard');

  // Базовое ABI на случай неизвестного имени
  return [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "function transfer(address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];
};

// Необязательная проверка валидности адресов (только в браузере)
if (typeof window !== 'undefined') {
  Object.values(CONTRACT_ADDRESSES).forEach(addr => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      console.warn(`Invalid contract address: ${addr}`);
    }
  });
}
