import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import GameTable from './GameTable';
import { toast } from 'react-toastify';

const PVPLobby = () => {
  const { account, contracts, usdBalance } = useWeb3();
  const [gameId, setGameId] = useState(null);
  const [opponent, setOpponent] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const payEntryFee = async () => {
    try {
      // 1. Проверяем баланс
      const balance = await contracts.usdcardContract.balanceOf(account);
      if (balance < 10) {
        toast.error("Недостаточно USDC! Нужно 10 токенов");
        return;
      }

      // 2. Проверяем allowance
      const allowance = await contracts.usdcardContract.allowance(
        account,
        contracts.gameContract.address
      );
      
      if (allowance < 10) {
        // 3. Делаем approve если нужно
        const txApprove = await contracts.usdcardContract.approve(
          contracts.gameContract.address,
          10
        );
        await txApprove.wait();
      }

      // 4. Вызываем payEntryFee в контракте игры
      const txPay = await contracts.gameContract.payEntryFee();
      await txPay.wait();
      
      setIsPaid(true);
      toast.success("Ставка принята!");

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(`Ошибка: ${error.reason || error.message.split("(")[0]}`);
    }
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
