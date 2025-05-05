import { useEffect, useState } from 'react';
import { 
  isMetaMaskConnected,
  connectWallet,
  setupListeners
} from '@utils/web3'; // Используем алиас

export default function WalletConnect() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (await isMetaMaskConnected()) {
        const connection = await connectWallet();
        setWallet(connection);
      }
    };
    
    checkConnection();
    
    const handlers = {
      handleAccountsChanged: (accounts) => {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
      },
      handleChainChanged: (chainId) => {
        setWallet(prev => ({ ...prev, chainId }));
      }
    };
    
    setupListeners(handlers);
    
    return () => {
      window.ethereum?.removeAllListeners();
    };
  }, []);

  const handleConnect = async () => {
    try {
      const connection = await connectWallet();
      setWallet(connection);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {wallet ? (
        <div>
          <p>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
          <p>Chain ID: {wallet.chainId}</p>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
