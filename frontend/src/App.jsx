import { useState, useEffect } from 'react'
import { useWeb3 } from './context/Web3Context'
import NetworkChecker from './components/NetworkChecker'
import MintSection from './components/MintSection'
import GameLobby from './components/GameLobby'
import Leaderboard from './components/Leaderboard'
import './styles.css'

function App() {
  const { account, contracts, connectWallet } = useWeb3()
  const [hasNFT, setHasNFT] = useState(false)
  const [hasUSDCard, setHasUSDCard] = useState(false)
  const [loading, setLoading] = useState(true)

  {!hasNFT && (
  <MintSection 
    onMintSuccess={(type) => {
      if (type === 'nft') setHasNFT(true)
      if (type === 'usdcard') setHasUSDCard(true)
    }} 
  />
)}
  // Проверяем балансы при изменении аккаунта
  useEffect(() => {
    const checkBalances = async () => {
      if (!account || !contracts) return
      
      try {
        setLoading(true)
        
        // Проверка NFT
        const nftBalance = await contracts.nftContract.balanceOf(account)
        setHasNFT(nftBalance > 0)
        
        // Проверка USDCard
        const usdBalance = await contracts.usdcardContract.balanceOf(account)
        setHasUSDCard(usdBalance >= 10 * 10**18) // Проверяем минимум 10 токенов
        
      } catch (error) {
        console.error("Ошибка проверки балансов:", error)
      } finally {
        setLoading(false)
      }
    }

    checkBalances()
  }, [account, contracts])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <NetworkChecker />
      
      {!account ? (
        <button 
          onClick={connectWallet} 
          className="connect-button"
        >
          Подключить кошелек
        </button>
      ) : (
        <>
          {!hasNFT ? (
            <MintSection 
              onMintSuccess={() => setHasNFT(true)} 
            />
          ) : (
            <>
              <GameLobby hasUSDCard={hasUSDCard} />
              <Leaderboard />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
