import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import ethers from '../ethers-resolver'; // Новый импорт
import { cleanMessage } from '../../utils/filterWords'
import './GameTable.css';

// Константы игры
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_VALUES = {
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// Анимации
const cardAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: { scale: 1.05, zIndex: 10 },
  tap: { scale: 0.95 }
};

const tableAnimation = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const GameTable = ({ gameId, mode }) => {
  const { account, contracts } = useWeb3();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [gameState, setGameState] = useState({
    deck: [],
    playerHand: [],
    opponentHand: [],
    tableCards: [],
    trumpSuit: null,
    currentPlayer: 'player',
    gameOver: false,
    winner: null,
    attackCards: [],
    defendCards: [],
    discardPile: []
  });

  // Инициализация колоды
  const initializeDeck = useCallback(() => {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ 
          id: `${suit}-${rank}`,
          suit, 
          rank, 
          value: CARD_VALUES[rank] 
        });
      }
    }
    return deck;
  }, []);

  // Тасовка колоды
  const shuffleDeck = useCallback((deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }, []);

  // Раздача карт
  const dealCards = useCallback(() => {
    const newDeck = [...gameState.deck];
    const playerHand = [];
    const opponentHand = [];

    for (let i = 0; i < 6; i++) {
      if (newDeck.length > 0) playerHand.push(newDeck.pop());
      if (newDeck.length > 0) opponentHand.push(newDeck.pop());
    }

    const trumpCard = newDeck[newDeck.length - 1];
    const trumpSuit = trumpCard?.suit || 'hearts';

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand,
      opponentHand,
      trumpSuit,
      currentPlayer: 'player'
    }));
  }, [gameState.deck]);

  // Начало игры
  useEffect(() => {
    const deck = shuffleDeck(initializeDeck());
    setGameState(prev => ({ ...prev, deck }));
  }, [initializeDeck, shuffleDeck]);

  useEffect(() => {
    if (gameState.deck.length > 0 && gameState.playerHand.length === 0) {
      dealCards();
    }
  }, [gameState.deck, dealCards]);

  // Логика хода игрока
  const playCard = (cardIndex) => {
    if (gameState.currentPlayer !== 'player' || gameState.gameOver) return;

    const selectedCard = gameState.playerHand[cardIndex];
    const newPlayerHand = [...gameState.playerHand];
    newPlayerHand.splice(cardIndex, 1);

    if (gameState.tableCards.length === 0) {
      // Первый ход (атака)
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        tableCards: [selectedCard],
        currentPlayer: mode === 'PVE' ? 'ai' : 'opponent',
        attackCards: [selectedCard]
      }));
    } else {
      if (gameState.currentPlayer === 'player') {
        // Защита
        const lastCard = gameState.tableCards[gameState.tableCards.length - 1];
        if (canDefend(selectedCard, lastCard)) {
          setGameState(prev => ({
            ...prev,
            playerHand: newPlayerHand,
            tableCards: [...prev.tableCards, selectedCard],
            currentPlayer: mode === 'PVE' ? 'ai' : 'opponent',
            defendCards: [...prev.defendCards, selectedCard]
          }));
        }
      } else {
        // Подкидывание карт
        if (canAttack(selectedCard)) {
          setGameState(prev => ({
            ...prev,
            playerHand: newPlayerHand,
            tableCards: [...prev.tableCards, selectedCard],
            attackCards: [...prev.attackCards, selectedCard]
          }));
        }
      }
    }
    checkRoundEnd();
  };

  // Улучшенный ИИ для PVE
  const aiTurn = useCallback(() => {
    if (mode !== 'PVE' || gameState.currentPlayer !== 'ai' || gameState.gameOver) return;

    setTimeout(() => {
      const aiHand = [...gameState.opponentHand];
      let playedCard = null;
      let cardIndex = -1;

      if (gameState.tableCards.length === 0) {
        // Атака - выбираем самую сильную карту
        cardIndex = aiHand.reduce((bestIndex, card, index) => 
          CARD_VALUES[card.rank] > CARD_VALUES[aiHand[bestIndex]?.rank] ? index : bestIndex, 0
        );
        playedCard = aiHand[cardIndex];
      } else {
        // Защита - выбираем самую подходящую карту
        const lastCard = gameState.tableCards[gameState.tableCards.length - 1];
        const possibleCards = aiHand.filter(card => canDefend(card, lastCard));

        if (possibleCards.length > 0) {
          // Защищаемся с самой сильной картой
          playedCard = possibleCards.reduce((bestCard, card) => 
            CARD_VALUES[card.rank] > CARD_VALUES[bestCard.rank] ? card : bestCard
          );
          cardIndex = aiHand.findIndex(c => c.id === playedCard.id);
        }
      }

      if (playedCard) {
        aiHand.splice(cardIndex, 1);
        setGameState(prev => ({
          ...prev,
          opponentHand: aiHand,
          tableCards: [...prev.tableCards, playedCard],
          currentPlayer: 'player',
          defendCards: cardIndex !== -1 ? [...prev.defendCards, playedCard] : prev.defendCards
        }));
      } else {
        // Забираем карты, если нет защиты
        setGameState(prev => ({
          ...prev,
          opponentHand: [...prev.opponentHand, ...prev.tableCards],
          tableCards: [],
          currentPlayer: 'player',
          discardPile: [...prev.discardPile, ...prev.tableCards]
        }));
      }

      checkRoundEnd();
    }, 800);
  }, [gameState, mode]);

  // Проверка конца раунда
  const checkRoundEnd = useCallback(() => {
    if (gameState.playerHand.length === 0 && gameState.tableCards.length === 0) {
      endGame('player');
    } else if (gameState.opponentHand.length === 0 && gameState.tableCards.length === 0) {
      endGame(mode === 'PVE' ? 'ai' : 'opponent');
    } else if (gameState.tableCards.length === 0 && gameState.deck.length > 0) {
      setTimeout(() => dealCards(), 500);
    }
  }, [gameState, mode, dealCards]);

  // Окончание игры
  const endGame = useCallback((winner) => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: winner === 'player' ? account : (mode === 'PVE' ? 'ai' : 'opponent')
    }));

    if (mode === 'PVP' && contracts?.gameContract) {
      contracts.gameContract.distributePrize(
        winner === 'player' ? account : '0x...',
        winner === 'player' ? '0x...' : account
      );
    }
  }, [account, contracts, mode]);

  // Эффект для хода ИИ
  useEffect(() => {
    if (mode === 'PVE' && gameState.currentPlayer === 'ai') {
      aiTurn();
    }
  }, [gameState.currentPlayer, aiTurn, mode]);

  // Отправка сообщения в чат
  const sendMessage = async () => {
    if (!message.trim() || mode !== 'PVP') return;
    
    const filtered = cleanMessage(message);
    try {
      const tx = await contracts.gameContract.sendMessage(gameId, filtered);
      await tx.wait();
      setChatMessages(prev => [...prev, {
        sender: account,
        text: filtered,
        timestamp: Date.now()
      }]);
      setMessage('');
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  // Проверка возможности атаки
  const canAttack = (card) => {
    return gameState.attackCards.some(c => c.rank === card.rank) ||
           gameState.tableCards.some(c => c.rank === card.rank);
  };

  // Проверка возможности защиты
  const canDefend = (card, attackCard) => {
    if (card.suit === gameState.trumpSuit && attackCard.suit !== gameState.trumpSuit) {
      return true;
    }
    if (card.suit === attackCard.suit && card.value > attackCard.value) {
      return true;
    }
    return false;
  };

  return (
    <div className="game-table">
      <h2>{mode === 'PVP' ? 'PVP Режим' : 'PVE Режим'}</h2>
      
      <div className="game-info">
        <p>Козырь: <span className={`suit-${gameState.trumpSuit}`}>{gameState.trumpSuit}</span></p>
        <p>Ход: {gameState.currentPlayer === 'player' ? 'Ваш ход' : 'Ход противника'}</p>
        <p>Осталось карт: {gameState.deck.length}</p>
      </div>

      {/* Карты противника */}
      <div className="opponent-area">
        {gameState.opponentHand.map((_, index) => (
          <div
            key={`opponent-${index}`}
            className="card back fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            ?
          </div>
        ))}
      </div>

      {/* Игровой стол */}
      <div className="table-area">
        {gameState.tableCards.map((card) => (
          <div
            key={`table-${card.id}`}
            className={`card ${card.suit} ${card.suit === gameState.trumpSuit ? 'trump' : ''} fade-in`}
          >
            {card.rank}
          </div>
        ))}
      </div>

      {/* Карты игрока */}
      <div className="player-area">
        {gameState.playerHand.map((card, index) => (
          <div
            key={`player-${card.id}`}
            className={`card ${card.suit} ${card.suit === gameState.trumpSuit ? 'trump' : ''} fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => playCard(index)}
          >
            {card.rank}
          </div>
        ))}
      </div>

      {/* Модальное окно окончания игры */}
      {gameState.gameOver && (
        <div className="game-overlay">
          <div className="game-over-modal">
            <h3>{gameState.winner === account ? '🎉 Вы выиграли!' : '😢 Вы проиграли'}</h3>
            <p>{gameState.winner === account 
              ? 'Отличная игра! Ваш рейтинг увеличен.' 
              : 'Не расстраивайтесь! Попробуйте еще раз.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="connect-button"
            >
              В главное меню
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable;
