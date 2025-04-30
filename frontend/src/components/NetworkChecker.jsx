import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useWeb3 } from '../context/Web3Context'

const NetworkChecker = () => {
  const { account } = useWeb3()

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && account) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        if (chainId !== '0xc4d8') { // 50312 в hex
          toast.error('Пожалуйста, подключитесь к Somnia Testnet (ChainID: 50312)', {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false
          })
        }
      }
    }

    checkNetwork()
    window.ethereum?.on('chainChanged', checkNetwork)

    return () => {
      window.ethereum?.removeListener('chainChanged', checkNetwork)
    }
  }, [account])

  return null
}

export default NetworkChecker
export default NetworkChecker;
