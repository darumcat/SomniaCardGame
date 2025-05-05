// Проверка подключения MetaMask
export const isMetaMaskConnected = async () => {
  if (typeof window.ethereum === 'undefined') return false;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts.length > 0;
};

// Инициализация провайдера Ethers.js
export const initEthersProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// Подключение кошелька
export const connectWallet = async () => {
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
      chainId: network.chainId
    };
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`);
  }
};

// Слушатели изменений
export const setupListeners = (handlers) => {
  if (typeof window.ethereum === 'undefined') return;

  window.ethereum.on('accountsChanged', handlers.handleAccountsChanged);
  window.ethereum.on('chainChanged', handlers.handleChainChanged);
};

// Отправка ETH
export const sendEth = async (from, to, amount) => {
  const provider = initEthersProvider();
  const signer = await provider.getSigner();
  const tx = await signer.sendTransaction({
    from,
    to,
    value: ethers.parseEther(amount)
  });
  return tx.wait();
};
