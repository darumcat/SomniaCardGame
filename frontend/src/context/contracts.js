export const CONTRACT_ADDRESSES = {
  nft: import.meta.env.VITE_NFT_ADDRESS || '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: import.meta.env.VITE_USDCARD_ADDRESS || '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: import.meta.env.VITE_GAME_ADDRESS || '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512',
};

export const getContractABI = async (contractName) => {
  const abiFiles = {
    nft: '/NFT.json',
    usdcard: '/USDCard.json',
    game: '/CardGame.json'
  };

  try {
    const response = await fetch(abiFiles[contractName]);
    if (!response.ok) throw new Error(`Failed to load ${contractName} ABI`);
    const data = await response.json();
    return data.abi || data; // Поддержка разных форматов ABI
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    return getFallbackABI(contractName);
  }
};

// Резервные ABI на случай проблем с загрузкой
const getFallbackABI = (contractName) => {
  const baseABI = [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "function transfer(address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  const nftABI = [
    ...baseABI,
    "function hasMinted(address) view returns (bool)",
    "function ownerOf(uint256) view returns (address)",
    "function tokenURI(uint256) view returns (string)"
  ];

  const usdcardABI = [
    ...baseABI,
    "function hasMinted(address) view returns (bool)",
    "function approve(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)"
  ];

  const gameABI = [
    "function startGame(address, uint8)",
    "function sendMessage(uint256, string)",
    "event GameStarted(uint256, address, address, uint8)"
  ];

  switch(contractName) {
    case 'nft': return nftABI;
    case 'usdcard': return usdcardABI;
    case 'game': return gameABI;
    default: return baseABI;
  }
};
