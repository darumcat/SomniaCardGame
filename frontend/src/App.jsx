import { useState, useEffect } from 'react'
import { ethers } from 'ethers/dist/ethers.min.js'
import NetworkChecker from './components/NetworkChecker'
import MintSection from './components/MintSection'
import GameLobby from './components/GameLobby'
import Leaderboard from './components/Leaderboard'
import { Web3Provider } from './context/Web3Context'
import './styles.css'

function App() {
  const [account, setAccount] = useState(null)
  const [hasNFT, setHasNFT] = useState(false)
  const [hasUSDCard, setHasUSDCard] = useState(false)

  return (
    <Web3Provider>
      <div className="app">
        <NetworkChecker />
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <>
            {!hasNFT && <MintSection />}
            {hasNFT && <GameLobby />}
            <Leaderboard />
          </>
        )}
      </div>
    </Web3Provider>
  )
}

export default App
