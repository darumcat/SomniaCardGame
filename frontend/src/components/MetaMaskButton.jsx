import { useState, useEffect } from 'react';
import { 
  isMetaMaskInstalled,
  connectWallet,
  setupAccountChangeListener,
  setupNetworkChangeListener
} from '../utils/web3';

export default function MetaMaskButton() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      setupAccountChangeListener(setAccount);
      setupNetworkChangeListener(setChainId);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const { address, chainId } = await connectWallet();
      setAccount(address);
      setChainId(chainId);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {isMetaMaskInstalled() ? (
        <button onClick={handleConnect}>
          {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect MetaMask'}
        </button>
      ) : (
        <a href="https://metamask.io/download.html" target="_blank">
          Install MetaMask
        </a>
      )}
      {chainId && <p>Chain ID: {chainId}</p>}
    </div>
  );
}
