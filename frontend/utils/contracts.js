export const CONTRACT_ADDRESSES = {
  nft: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  usdcard: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  game: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'
}

export const getContractABI = (contractName) => {
  const basicABI = [
    "function balanceOf(address) view returns (uint256)",
    "function mint()",
    "function transfer(address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ]
  
  const gameABI = [
    "function startGame(address, uint8)",
    "function sendMessage(uint256, string)",
    "function commitChoice(uint256, bytes32)",
    "function revealChoice(uint256, address, bytes32)",
    "event GameStarted(uint256 indexed gameId, address player1, address player2, uint8 gameType)",
    "event MessageSent(uint256 indexed gameId, address sender, string text)"
  ]

  return contractName === 'game' ? gameABI : basicABI
}
