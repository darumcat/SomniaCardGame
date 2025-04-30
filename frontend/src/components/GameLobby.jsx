import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import PVPLobby from './PVPLobby';
import PVEGame from './PVEGame';
import ChatRulesModal from './ChatRulesModal';

const GameLobby = () => {
  const [gameType, setGameType] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const handleGameSelect = (type) => {
    if (type === 'PVP') {
      setShowRules(true);
    } else {
      setGameType(type);
    }
  };

  return (
    <div className="game-lobby">
      {!gameType ? (
        <>
          <h2>Выберите режим игры</h2>
          <button onClick={() => handleGameSelect('PVE')}>PVE (против ИИ)</button>
          <button onClick={() => handleGameSelect('PVP')}>PVP (против игрока)</button>
        </>
      ) : gameType === 'PVP' ? (
        <PVPLobby />
      ) : (
        <PVEGame />
      )}

      {showRules && (
        <ChatRulesModal 
          onAccept={() => {
            setGameType('PVP');
            setShowRules(false);
          }}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  );
};

export default GameLobby;