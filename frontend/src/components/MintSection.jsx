import { useState } from 'react'
import { toast } from 'react-toastify'
import { useWeb3 } from '../context/Web3Context'

const MintSection = ({ onMintSuccess }) => {
  const { account, contracts } = useWeb3()
  const [isMintingNFT, setIsMintingNFT] = useState(false)
  const [isMintingUSDC, setIsMintingUSDC] = useState(false)

  const mintNFT = async () => {
    if (!account || !contracts?.nftContract) {
      toast.error("Кошелек не подключен")
      return
    }

    try {
      setIsMintingNFT(true)
      const tx = await contracts.nftContract.mint()
      await tx.wait()
      
      toast.success("NFT успешно заминтирован!")
      if (onMintSuccess) onMintSuccess('nft')
      
      // Проверяем баланс NFT после минта
      const balance = await contracts.nftContract.balanceOf(account)
      console.log("Текущий баланс NFT:", balance.toString())
      
    } catch (error) {
      const errorMsg = error.reason || error.message.split('(')[0]
      toast.error(`Ошибка минта NFT: ${errorMsg}`)
    } finally {
      setIsMintingNFT(false)
    }
  }

  const mintUSDCard = async () => {
    if (!account || !contracts?.usdcardContract) {
      toast.error("Кошелек не подключен")
      return
    }

    try {
      setIsMintingUSDC(true)
      const tx = await contracts.usdcardContract.mint()
      await tx.wait()
      
      toast.success("USDCard успешно получены!")
      if (onMintSuccess) onMintSuccess('usdcard')
      
      // Проверяем баланс после минта
      const balance = await contracts.usdcardContract.balanceOf(account)
      console.log("Текущий баланс USDCard:", balance.toString())
      
    } catch (error) {
      const errorMsg = error.reason || error.message.split('(')[0]
      toast.error(`Ошибка получения USDCard: ${errorMsg}`)
    } finally {
      setIsMintingUSDC(false)
    }
  }

  return (
    <div className="mint-section">
      <h2>Получите доступ к игре</h2>
      
      <div className="mint-buttons">
        <button 
          onClick={mintNFT} 
          disabled={isMintingNFT}
          className={isMintingNFT ? 'loading' : ''}
        >
          {isMintingNFT ? 'Идет минт...' : 'Mint NFT (1 шт)'}
        </button>
        
        <button 
          onClick={mintUSDCard} 
          disabled={isMintingUSDC}
          className={isMintingUSDC ? 'loading' : ''}
        >
          {isMintingUSDC ? 'Идет минт...' : 'Получить USDCard (10000)'}
        </button>
      </div>
      
      <div className="mint-info">
        <p>Для игры требуется:</p>
        <ul>
          <li>1 NFT (пропуск в игру)</li>
          <li>Минимум 10 USDCard для ставок</li>
        </ul>
      </div>
    </div>
  )
}

export default MintSection
