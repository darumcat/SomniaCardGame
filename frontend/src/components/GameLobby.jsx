import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import PVPLobby from './PVPLobby';
import PVEGame from './PVEGame';
import ChatRulesModal from './ChatRulesModal';

const GameLobby = () => {
  const { nftBalance } = useWeb3();
  const [gameType, setGameType] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const handleGameSelect = (type) => {
    if (nftBalance < 1) {
      alert("You need to mint NFT first!");
      return;
    }
    if (type === 'PVP') setShowRules(true);
    else setGameType(type);
  };

  return (
    <div className="game-lobby">
      {!gameType ? (
        <>
          <h2>Select Game Mode</h2>
          <button onClick={() => handleGameSelect('PVE')}>PVE (vs AI)</button>
          <button onClick={() => handleGameSelect('PVP')}>PVP (vs Player)</button>
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
