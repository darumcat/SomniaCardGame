import { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../utils/contracts';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [nftBalance, setNftBalance] = useState(0);
  const [usdBalance, setUsdBalance] = useState(0);

  const initContracts = async (provider) => {
    const signer = await provider.getSigner();

    const [nftAbi, usdAbi, gameAbi] = await Promise.all([
      fetch('/NFT.json').then(res => res.json()),
      fetch('/USDCard.json').then(res => res.json()),
      fetch('/CardGame.json').then(res => res.json())
    ]);

    const nftContract = new ethers.Contract(CONTRACT_ADDRESSES.nft, nftAbi, signer);
    const usdcardContract = new ethers.Contract(CONTRACT_ADDRESSES.usdcard, usdAbi, signer);
    const gameContract = new ethers.Contract(CONTRACT_ADDRESSES.game, gameAbi, signer);

    return { nftContract, usdcardContract, gameContract };
  };

  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("Install MetaMask!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const contracts = await initContracts(provider);

    setAccount(accounts[0]);
    setContracts(contracts);
    updateBalances(contracts, accounts[0]);

    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
  };

  const updateBalances = async (contracts, account) => {
    setNftBalance(await contracts.nftContract.balanceOf(account));
    setUsdBalance(await contracts.usdcardContract.balanceOf(account));
  };

  return (
    <Web3Context.Provider value={{
      account,
      contracts,
      nftBalance,
      usdBalance,
      connectWallet,
      updateBalances
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
