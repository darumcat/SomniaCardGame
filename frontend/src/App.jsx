import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Константы контрактов Somnia
const NFT_ADDRESS = "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641"
const USDCARD_ADDRESS = "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80"
const CARDGAME_ADDRESS = "0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512"

// Вставьте сюда полные ABI из ваших файлов:
const NFT_ABI = [] // Вставьте ABI из ABI NFT.txt
const USDCARD_ABI = [] // Вставьте ABI из ABI USDCard.txt
const CARDGAME_ABI = [] // Вставьте ABI из ABI CardGame.txt

function App() {
  const [account, setAccount] = useState(null)
  const [nftContract, setNftContract] = useState(null)
  const [usdCardContract, setUsdCardContract] = useState(null)
  const [cardGameContract, setCardGameContract] = useState(null)

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Подключение кошелька
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0])
        
        // Проверка сети
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        if (chainId !== "0xC498") { // 50316 в hex
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: "0xC498",
              chainName: "Somnia Testnet",
              nativeCurrency: {
                name: "STT",
                symbol: "STT",
                decimals: 18
              },
              rpcUrls: ["https://dream-rpc.somnia.network/"],
              blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
            }]
          })
        }

        // Инициализация контрактов
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        setNftContract(new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer))
        setUsdCardContract(new ethers.Contract(USDCARD_ADDRESS, USDCARD_ABI, signer))
        setCardGameContract(new ethers.Contract(CARDGAME_ADDRESS, CARDGAME_ABI, signer))

      } catch (error) {
        console.error("Error:", error)
      }
    } else {
      alert("Please install MetaMask!")
    }
  }

  const mintNFT = async () => {
    try {
      const tx = await nftContract.mint()
      await tx.wait()
      alert("NFT успешно заминчен!")
    } catch (error) {
      console.error("Ошибка минта NFT:", error)
    }
  }

  const mintUSDCard = async () => {
    try {
      const tx = await usdCardContract.mint()
      await tx.wait()
      alert("USDCard успешно заминчены!")
    } catch (error) {
      console.error("Ошибка минта USDCard:", error)
    }
  }

  return (
    <div className="App">
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <button onClick={mintNFT}>Mint NFT</button>
          <button onClick={mintUSDCard}>Mint USDCard</button>
        </div>
      )}
    </div>
  )
}

export default App
