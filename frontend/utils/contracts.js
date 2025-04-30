import { ethers } from 'ethers';

export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'
};

export const getContractABI = (contractName) => {
  // В реальном проекте импортируйте ABI из JSON-файлов
  const basicABI = [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];
  
  const gameABI = [
    "function startGame(address, uint8)",
    "function sendMessage(uint256, string)",
    "event GameStarted(uint256 indexed gameId, address player1, address player2, uint8 gameType)"
  ];

  return contractName === 'game' ? gameABI : basicABI;
};

export const initContracts = async (provider) => {
  const signer = provider.getSigner();
  return {
    nftContract: new ethers.Contract(CONTRACT_ADDRESSES.nft, getContractABI('nft'), signer),
    usdcardContract: new ethers.Contract(CONTRACT_ADDRESSES.usdcard, getContractABI('usdcard'), signer),
    gameContract: new ethers.Contract(CONTRACT_ADDRESSES.game, getContractABI('game'), signer)
  };
};