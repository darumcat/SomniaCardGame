export const CONTRACT_ADDRESSES = {
  nft: import.meta.env.VITE_NFT_ADDRESS,
  usdcard: import.meta.env.VITE_USDCARD_ADDRESS,
  game: import.meta.env.VITE_GAME_ADDRESS,
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
    game: '/CardGame.json',
  };

  try {
    const response = await fetch(abiFiles[contractName]);
    if (!response.ok) throw new Error(`Failed to load ${contractName} ABI`);
    
    const data = await response.json();
    const abi = data.abi || data;
    
    if (!Array.isArray(abi)) throw new Error('Invalid ABI format');
    return abi;
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    return [];
  }
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
      params: [SOMNIA_CONFIG],
    });
    return true;
  } catch (error) {
    console.error('Failed to switch network:', error);
    return false;
  }
};
