import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import GameTable from './GameTable';
import ethers from '../ethers-resolver'; // Измененный импорт

const PVPLobby = () => {
  const { contracts } = useWeb3();
  const [gameId, setGameId] = useState(null);
  const [opponent, setOpponent] = useState('');

  const startGame = async () => {
    try {
      const tx = await contracts.gameContract.startGame(opponent, 0); // 0 = PVP
      await tx.wait();
      
      contracts.gameContract.on('GameStarted', (id, player1, player2) => {
        if (player1 === contracts.account || player2 === contracts.account) {
          setGameId(id.toNumber());
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return gameId ? (
    <GameTable gameId={gameId} mode="PVP" />
  ) : (
    <div className="pvp-lobby">
      <h2>PVP Лобби</h2>
      <input 
        type="text" 
        placeholder="Адрес соперника" 
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
      />
      <button onClick={startGame}>Начать игру (10 USDCard)</button>
    </div>
  );
};

export default PVPLobby;
