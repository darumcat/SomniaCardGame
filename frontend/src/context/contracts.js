export const CONTRACT_ADDRESSES = {
  nft: import.meta.env.VITE_NFT_ADDRESS || '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: import.meta.env.VITE_USDCARD_ADDRESS || '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: import.meta.env.VITE_GAME_ADDRESS || '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512',
};

export const SOMNIA_CONFIG = {
  chainId: '0xC488', // HEX для 50312
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
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
    const abi = data.abi || data;
    
    if (!Array.isArray(abi)) throw new Error('Invalid ABI format');
    if (abi.length === 0) throw new Error('Empty ABI');
    
    return abi;
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    return getFallbackABI(contractName);
  }
};

const getFallbackABI = (contractName) => {
  const baseABI = [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "function hasMinted(address) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  const extendedABI = {
    nft: [
      ...baseABI,
      "function ownerOf(uint256) view returns (address)",
      "function tokenURI(uint256) view returns (string)"
    ],
    usdcard: [
      ...baseABI,
      "function approve(address, uint256) returns (bool)",
      "function transferFrom(address, address, uint256) returns (bool)"
    ],
    game: [
      "function startGame(address, uint8)",
      "function sendMessage(uint256, string)",
      "event GameStarted(uint256, address, address, uint8)"
    ]
  };

  return extendedABI[contractName] || baseABI;
};

export const checkNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === SOMNIA_CONFIG.chainId;
  } catch (error) {
    console.error('Network check failed:', error);
    return false;
  }
};

export const switchToSomniaNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [SOMNIA_CONFIG]
    });
    return true;
  } catch (error) {
    console.error('Failed to switch network:', error);
    return false;
  }
};
