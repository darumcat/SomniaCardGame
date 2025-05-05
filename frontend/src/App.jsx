import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Контракты Somnia Testnet
const CONTRACTS = {
  NFT: {
    address: "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641",
    abi: [/* Вставьте полный ABI из ABI NFT.txt */]
  },
  USDCARD: {
    address: "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80",
    abi: [/* Вставьте полный ABI из ABI USDCard.txt */]
  },
  CARD_GAME: {
    address: "0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512",
    abi: [/* Вставьте полный ABI из ABI CardGame.txt */]
  }
};

const SOMNIA_NETWORK = {
  chainId: "0xC498", // 50312
  chainName: "Somnia Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18
  },
  rpcUrls: ["https://dream-rpc.somnia.network/"],
  blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
};

function App() {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [usdCardContract, setUsdCardContract] = useState(null);
  const [cardGameContract, setCardGameContract] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Инициализация контрактов
        setNftContract(new ethers.Contract(
          CONTRACTS.NFT.address, 
          CONTRACTS.NFT.abi, 
          signer
        ));
        
        setUsdCardContract(new ethers.Contract(
          CONTRACTS.USDCARD.address,
          CONTRACTS.USDCARD.abi,
          signer
        ));
        
        setCardGameContract(new ethers.Contract(
          CONTRACTS.CARD_GAME.address,
          CONTRACTS.CARD_GAME.abi,
          signer
        ));
        
        // Проверка сети
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SOMNIA_NETWORK.chainId) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SOMNIA_NETWORK]
          });
        }
        
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const mintNFT = async () => {
    try {
      const tx = await nftContract.mint();
      await tx.wait();
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const mintUSDCard = async () => {
    try {
      const tx = await usdCardContract.mint();
      await tx.wait();
      alert("USDCard minted successfully!");
    } catch (error) {
      console.error("Error minting USDCard:", error);
    }
  };

  return (
    <div className="App">
      <h1>Somnia Card Game</h1>
      
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          
          <div>
            <button onClick={mintNFT}>Mint NFT</button>
            <button onClick={mintUSDCard}>Mint USDCard</button>
          </div>
          
          {/* Здесь будет игровой интерфейс */}
        </div>
      )}
    </div>
  );
}

export default App;
