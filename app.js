const { useState, useEffect } = React;

function App() {
  const [account, setAccount] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [hasUSDCard, setHasUSDCard] = useState(false);
  const [checking, setChecking] = useState({ nft: false, usd: false });

  const NFT_ADDRESS = "0x6C6506d9587e3EA5bbfD8278bF0c237dd64eD641";
  const USDCARD_ADDRESS = "0x14A21748e5E9Da6B0d413256E3ae80ABEBd8CC80";

  async function getContracts() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftAbi = await fetch('./ABI/NFT.json').then(res => res.json());
    const usdAbi = await fetch('./ABI/USDCard.json').then(res => res.json());

    return {
      signer,
      nft: new ethers.Contract(NFT_ADDRESS, nftAbi.abi, signer),
      usd: new ethers.Contract(USDCARD_ADDRESS, usdAbi.abi, signer)
    };
  }

  async function connectWallet() {
    try {
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(address);
      await verifyWallet(address);
      await checkBalances(address);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  }

  async function verifyWallet(address) {
    const msg = `Verify wallet: ${address}`;
    try {
      await window.ethereum.request({
        method: "personal_sign",
        params: [msg, address]
      });
      setIsVerified(true);
    } catch (err) {
      alert("Verification rejected");
    }
  }

  async function checkBalances(address) {
    try {
      const { nft, usd } = await getContracts();

      const nftBalance = await nft.balanceOf(address);
      const usdMinted = await usd.hasMinted(address);

      setHasNFT(nftBalance.gt(0));
      setHasUSDCard(usdMinted);
    } catch (err) {
      console.error("Error checking balances:", err);
    }
  }

  async function handleMint(type) {
    setChecking(prev => ({ ...prev, [type]: true }));

    try {
      const { signer, nft, usd } = await getContracts();
      const address = await signer.getAddress();

      if (type === "nft") {
        const balance = await nft.balanceOf(address);
        if (balance.gt(0)) {
          alert("You already have an NFT!");
          setHasNFT(true);
        } else {
          const tx = await nft.mint();
          await tx.wait();
          alert("NFT minted!");
          setHasNFT(true);
        }
      }

      if (type === "usd") {
        const minted = await usd.hasMinted(address);
        if (minted) {
          alert("USDCard already minted!");
          setHasUSDCard(true);
        } else {
          const tx = await usd.mint();
          await tx.wait();
          alert("USDCard minted!");
          setHasUSDCard(true);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setChecking(prev => ({ ...prev, [type]: false }));
    }
  }

  return (
    <div className="app">
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : !isVerified ? (
        <p>Waiting for verification...</p>
      ) : (
        <>
          <p>Wallet: {account.slice(0, 6)}...{account.slice(-4)}</p>

          <button
            onClick={() => handleMint("nft")}
            disabled={hasNFT || checking.nft}
          >
            {hasNFT ? "NFT Already Minted" : (checking.nft ? "Checking NFT..." : "Mint NFT")}
          </button>

          <button
            onClick={() => handleMint("usd")}
            disabled={hasUSDCard || checking.usd}
          >
            {hasUSDCard ? "USDCard Already Minted" : (checking.usd ? "Checking USDCard..." : "Mint 10000 USDCard")}
          </button>
        </>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
