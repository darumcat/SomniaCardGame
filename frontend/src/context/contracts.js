// Используем динамические импорты для ABI
export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'
};

// Асинхронная загрузка ABI
export const loadABI = async (contractName) => {
  try {
    const response = await fetch(`/${contractName}.json`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    
    // Fallback ABI
    return [
      "function balanceOf(address) view returns (uint256)",
      "function mint()",
      "function transfer(address, uint256) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];
  }
};

// Проверка адресов
if (typeof window !== 'undefined') {
  Object.values(CONTRACT_ADDRESSES).forEach(addr => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      console.warn(`Invalid contract address: ${addr}`);
    }
  });
}
