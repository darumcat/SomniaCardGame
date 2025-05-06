import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'

const SOMNIA_CONFIG = {
  chainId: '0xC498',
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['https://shannon-explorer.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
}

const CONTRACTS = {
  NFT: '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
  USDCARD: '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
  CARDGAME: '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512'
}

export default function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      // Подключение аккаунта
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])

      // Проверка сети
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== SOMNIA_CONFIG.chainId) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_CONFIG]
        })
      }

      // Инициализация провайдера
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      
      // Получение подписанта
      const walletSigner = await browserProvider.getSigner()
      setSigner(walletSigner)

    } catch (error) {
      console.error('Connection error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="App">
      <h1>Somnia Card Game</h1>
      
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <p>Network: Somnia Testnet</p>
        </div>
      )}
    </div>
  )
}
