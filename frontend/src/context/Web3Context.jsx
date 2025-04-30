import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

const Web3Context = createContext()

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [contracts, setContracts] = useState({})
  
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      initContracts()
    }
  }

  const initContracts = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    
    const nftContract = new ethers.Contract(
      '0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641',
      ['function balanceOf(address) view returns (uint256)'],
      signer
    )
    
    const usdcardContract = new ethers.Contract(
      '0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80',
      [
        'function balanceOf(address) view returns (uint256)',
        'function mint()',
        'function getPlayerScore(address) view returns (uint256)'
      ],
      signer
    )
    
    const gameContract = new ethers.Contract(
      '0x566aaC422C630CE3c093CD2C13C5B3EceCe0D512',
      [
        'function startGame(address, uint8)',
        'function sendMessage(uint256, string)',
        'event GameStarted(uint256, address, address, uint8)'
      ],
      signer
    )
    
    setContracts({ nftContract, usdcardContract, gameContract })
  }

  return (
    <Web3Context.Provider value={{ account, contracts, connectWallet }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)