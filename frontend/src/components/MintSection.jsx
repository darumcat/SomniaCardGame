import { useState } from 'react'
import { toast } from 'react-toastify'
import { useWeb3 } from '../context/Web3Context'

const MintSection = () => {
  const { account, contracts } = useWeb3()
  const [isMinting, setIsMinting] = useState(false)

  const mintNFT = async () => {
    try {
      setIsMinting(true)
      const tx = await contracts.nftContract.mint()
      await tx.wait()
      toast.success("NFT успешно заминтирован!")
    } catch (error) {
      toast.error(`Ошибка: ${error.message.split('(')[0]}`)
    } finally {
      setIsMinting(false)
    }
  }

  const mintUSDCard = async () => {
    try {
      setIsMinting(true)
      const tx = await contracts.usdcardContract.mint()
      await tx.wait()
      toast.success("USDCard успешно получены!")
    } catch (error) {
      toast.error(`Ошибка: ${error.message.split('(')[0]}`)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="mint-section">
      <h2>Получите доступ к игре</h2>
      <button onClick={mintNFT} disabled={isMinting}>
        {isMinting ? 'Minting...' : 'Mint NFT (1 шт)'}
      </button>
      <button onClick={mintUSDCard} disabled={isMinting}>
        {isMinting ? 'Minting...' : 'Получить USDCard (10000)'}
      </button>
    </div>
  )
}

export default MintSection
