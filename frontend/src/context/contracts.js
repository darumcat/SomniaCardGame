// frontend/src/context/contracts.js
export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512',
};

// Асинхронно загружает ABI файл по имени контракта
export const getContractABI = async (contractName) => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}${contractName === 'game' ? 'CardGame' : contractName === 'nft' ? 'NFT' : contractName === 'usdcard' ? 'USDCard' : ''}.json`);
    if (!response.ok) throw new Error('ABI not found');
    return await response.json();
  } catch (err) {
    console.error(`Ошибка загрузки ABI для ${contractName}:`, err);
    return [
      "function balanceOf(address) view returns (uint256)",
      "function mint()",
      "function transfer(address, uint256) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];
  }
};
