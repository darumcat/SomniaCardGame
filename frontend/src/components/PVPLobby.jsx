import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import GameTable from './GameTable';

const PVPLobby = () => {
  const { account, contracts, usdBalance } = useWeb3();
  const [gameId, setGameId] = useState(null);
  const [opponent, setOpponent] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const payEntryFee = async () => {
    if (usdBalance < 10) {
      alert("Not enough USDC! Mint more tokens.");
      return;
    }
    const tx = await contracts.usdcardContract.approve(
      contracts.gameContract.address,
      10
    );
    await tx.wait();
    setIsPaid(true);
  };

  const startGame = async () => {
    const tx = await contracts.gameContract.startGame(opponent, 0); // 0 = PVP
    await tx.wait();
    
    contracts.gameContract.on("GameStarted", (id, player1, player2) => {
      if ([player1, player2].includes(account)) {
        setGameId(id.toString());
      }
    });
  };

  return gameId ? (
    <GameTable gameId={gameId} mode="PVP" />
  ) : (
    <div className="pvp-lobby">
      {!isPaid ? (
        <div className="payment-modal">
          <h3>Pay 10 USDC Entry Fee</h3>
          <button onClick={payEntryFee}>Pay Now</button>
        </div>
      ) : (
        <>
          <h2>Enter Opponent Address</h2>
          <input 
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="0x..."
          />
          <button onClick={startGame}>Start Game</button>
        </>
      )}
    </div>
  );
};

export default PVPLobby;
