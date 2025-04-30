import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import GameTable from './GameTable';
import ethers from '../ethers-resolver'; // Измененный импорт

const PVEGame = () => {
  const { contracts } = useWeb3();
  const [gameId, setGameId] = useState(null);

  const startGame = async () => {
    try {
      const tx = await contracts.gameContract.startGame(
        ethers.ZeroAddress, // Адрес для PVE
        1 // 1 = PVE
      );
      await tx.wait();
      setGameId(/* Получить ID игры из события */);
    } catch (error) {
      console.error(error);
    }
  };

  return gameId ? (
    <GameTable gameId={gameId} mode="PVE" />
  ) : (
    <div className="pve-game">
      <h2>Режим против ИИ</h2>
      <button onClick={startGame}>Начать игру (10 USDCard)</button>
    </div>
  );
};

export default PVEGame;
