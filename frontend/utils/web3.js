// Проверяем доступность MetaMask
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

// Инициализация провайдера
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('Please install MetaMask extension');
  }
  return window.ethereum;
};

// Подключение кошелька
export const connectWallet = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.request({ 
      method: 'eth_requestAccounts' 
    });
    
    return {
      address: accounts[0],
      chainId: provider.chainId
    };
  } catch (error) {
    console.error('MetaMask connection error:', error);
    throw error;
  }
};

// Слушатель изменений аккаунта
export const setupAccountChangeListener = (callback) => {
  const provider = getProvider();
  provider.on('accountsChanged', (accounts) => {
    callback(accounts[0] || null);
  });
};

// Слушатель изменений сети
export const setupNetworkChangeListener = (callback) => {
  const provider = getProvider();
  provider.on('chainChanged', (chainId) => {
    callback(chainId);
  });
};

// Отправка транзакции
export const sendTransaction = async (transactionConfig) => {
  const provider = getProvider();
  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transactionConfig]
    });
    return txHash;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
};

// Подписание сообщения
export const signMessage = async (message, address) => {
  const provider = getProvider();
  try {
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address]
    });
    return signature;
  } catch (error) {
    console.error('Signing error:', error);
    throw error;
  }
};

// Получение баланса
export const getBalance = async (address) => {
  const provider = getProvider();
  try {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    return balance;
  } catch (error) {
    console.error('Balance check error:', error);
    throw error;
  }
};
