import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES, getContractABI } from '@utils/contracts.js'

const Web3Context = createContext()

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [contracts, setContracts] = useState({})
  
  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask не установлен!")
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      initContracts(accounts[0])
    } catch (error) {
      console.error("Ошибка подключения:", error)
    }
  }

  const initContracts = async (account) => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner(account)
    
    setContracts({
      nftContract: new ethers.Contract(
        CONTRACT_ADDRESSES.nft,
        getContractABI('nft'),
        signer
      ),
      usdcardContract: new ethers.Contract(
        CONTRACT_ADDRESSES.usdcard,
        getContractABI('usdcard'),
        signer
      ),
      gameContract: new ethers.Contract(
        CONTRACT_ADDRESSES.game,
        getContractABI('game'),
        signer
      )
    })
  }

  return (
    <Web3Context.Provider value={{ account, contracts, connectWallet }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
