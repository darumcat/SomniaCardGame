const cardGameABI = require(`${process.env.PUBLIC_URL}/CardGame.json`);
const nftABI = require(`${process.env.PUBLIC_URL}/NFT.json`);
const usdCardABI = require(`${process.env.PUBLIC_URL}/USDCard.json`);

export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641', // Адрес контракта NFT
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80', // Адрес контракта USDCard
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512' // Адрес контракта CardGame
};

export const getContractABI = (contractName) => {
  if (contractName === 'game') return cardGameABI;
  if (contractName === 'nft') return nftABI;
  if (contractName === 'usdcard') return usdCardABI;

  // Default return basic ABI for unknown contract names
  const basicABI = [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "function transfer(address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];
  
  return basicABI;
};

// Необязательная проверка адресов при импорте
if (typeof window !== 'undefined') {
  Object.values(CONTRACT_ADDRESSES).forEach(addr => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      console.warn(`Invalid contract address: ${addr}`);
    }
  });
}
