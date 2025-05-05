import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import ethers from '../ethers-resolver';
import { cleanMessage } from '../../utils/filterWords'
// import { motion, AnimatePresence } from 'framer-motion'; // Закомментировано для теста CSP
import './GameTable.css';

// ... (остальные импорты и константы остаются без изменений)

const GameTable = ({ gameId, mode }) => {
  // ... (все хуки и логика остаются без изменений)

  return (
    <div className="game-table">
      {/* ... (остальной JSX до первого motion.div) */}

      {/* Карты противника - заменяем motion.div на div */}
      <div className="opponent-area">
        {/* Заменяем AnimatePresence на обычный фрагмент */}
        <>
          {gameState.opponentHand.map((_, index) => (
            <div
              key={`opponent-${index}`}
              className="card back"
            >
              ?
            </div>
          ))}
        </>
      </div>

      {/* Игровой стол - заменяем motion.div на div */}
      <div className="table-area">
        <>
          {gameState.tableCards.map((card, index) => (
            <div
              key={`table-${card.id}`}
              className={`card ${card.suit} ${card.suit === gameState.trumpSuit ? 'trump' : ''}`}
            >
              {card.rank}
            </div>
          ))}
        </>
      </div>

      {/* Карты игрока - заменяем motion.div на div */}
      <div className="player-area">
        <>
          {gameState.playerHand.map((card, index) => (
            <div
              key={`player-${card.id}`}
              className={`card ${card.suit} ${card.suit === gameState.trumpSuit ? 'trump' : ''}`}
              onClick={() => playCard(index)}
            >
              {card.rank}
            </div>
          ))}
        </>
      </div>

      {/* ... (чат остается без изменений) */}

      {/* Модальное окно окончания игры - заменяем motion на div */}
      {gameState.gameOver && (
        <div className="game-overlay">
          <div className="game-over-modal">
            <h3>{gameState.winner === account ? '🎉 Вы выиграли!' : '😢 Вы проиграли'}</h3>
            <p>
              {gameState.winner === account 
                ? 'Отличная игра! Ваш рейтинг увеличен.' 
                : 'Не расстраивайтесь! Попробуйте еще раз.'}
            </p>
            <button onClick={() => window.location.reload()}>
              В главное меню
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable;
