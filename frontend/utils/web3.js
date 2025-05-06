import { ethers } from 'ethers';

export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

export const isMetaMaskConnected = async () => {
  if (!isMetaMaskInstalled()) return false;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking MetaMask connection:', error);
    return false;
  }
};

export const initEthersProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed or not detected');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('Please install MetaMask first');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const provider = initEthersProvider();
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    
    return {
      address: accounts[0],
      signer,
      provider,
      chainId: String(network.chainId) // Преобразуем в строку для consistency
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw new Error(
      error.code === 4001 
        ? 'Connection rejected by user' 
        : `Connection failed: ${error.message}`
    );
  }
};

export const setupListeners = (handlers) => {
  if (!isMetaMaskInstalled()) return;

  const { handleAccountsChanged, handleChainChanged } = handlers;
  
  window.ethereum.on('accountsChanged', (accounts) => {
    handleAccountsChanged(accounts);
  });

  window.ethereum.on('chainChanged', (chainId) => {
    handleChainChanged(chainId);
  });
};

export const sendEth = async (from, to, amount) => {
  try {
    const provider = initEthersProvider();
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      from,
      to,
      value: ethers.parseEther(String(amount))
    });
    return await tx.wait();
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error(
      error.code === 4001
        ? 'Transaction rejected by user'
        : `Transaction failed: ${error.message}`
    );
  }
};
