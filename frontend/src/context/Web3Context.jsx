import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, getContractABI } from '../context/contracts'; // Убедитесь, что путь правильный
import { cleanMessage } from '../context/filterWords'; // Импортируем функцию для фильтрации

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [nftBalance, setNftBalance] = useState(0);
  const [contracts, setContracts] = useState({});

  const loadABI = async (path) => {
    const response = await fetch(path);
    return await response.json();
  };

  const initContracts = async (signer) => {
    const [cardGameABI, nftABI, usdABI] = await Promise.all([
      loadABI(`${process.env.PUBLIC_URL}/CardGame.json`),
      loadABI(`${process.env.PUBLIC_URL}/NFT.json`),
      loadABI(`${process.env.PUBLIC_URL}/USDCard.json`),
    ]);

    setContracts({
      cardGameContract: new ethers.Contract(CONTRACT_ADDRESSES.game, cardGameABI, signer),
      nftContract: new ethers.Contract(CONTRACT_ADDRESSES.nft, nftABI, signer),
      usdcardContract: new ethers.Contract(CONTRACT_ADDRESSES.usdcard, usdABI, signer),
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;

    const newProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await newProvider.getSigner();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    setProvider(newProvider);
    setAccount(accounts[0]);
    await initContracts(signer);
  };

  const updateBalances = async () => {
    if (!contracts.nftContract || !account) return;
    const balance = await contracts.nftContract.balanceOf(account);
    setNftBalance(Number(balance));
  };

  useEffect(() => {
    if (account && contracts.nftContract) {
      updateBalances();
    }
  }, [account, contracts]);

  const handleMessageSend = (message) => {
    const cleanedMessage = cleanMessage(message); // Применяем фильтрацию
    // Далее логика отправки сообщения
    sendMessage(cleanedMessage);
  };

  return (
    <Web3Context.Provider value={{ account, connectWallet, nftBalance, contracts, updateBalances, handleMessageSend }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
