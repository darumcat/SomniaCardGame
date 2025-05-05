// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DurakGame is Ownable {
    IERC20 public usdcard;
    IERC721 public nftContract;
    uint256 public constant ENTRY_FEE = 10 * 10**18; // 10 USDCard
    uint256 public constant GAME_TIMEOUT = 30 minutes;

    enum GameType { PVP, PVE }
    enum GameStatus { Waiting, Active, Finished, Disconnected }

    struct Game {
        address player1;
        address player2;
        uint256 startTime;
        GameType gameType;
        GameStatus status;
        uint256 prizePool;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public currentGameId;
    uint256 public nextGameId;

    // Чат
    struct Message {
        address sender;
        string text;
        uint256 timestamp;
    }
    mapping(uint256 => Message[]) public gameChats;

    // Арбитраж (commit-reveal)
    mapping(uint256 => bytes32) public player1Commit;
    mapping(uint256 => bytes32) public player2Commit;
    mapping(uint256 => address) public gameWinner;

    event GameStarted(uint256 gameId, address player1, address player2, GameType gameType);
    event GameEnded(uint256 gameId, address winner, address loser, uint256 prize);
    event MessageSent(uint256 gameId, address sender, string text);
    event PlayerDisconnected(uint256 gameId, address player);

    constructor(address _usdcard, address _nftContract) Ownable(msg.sender) {
        usdcard = IERC20(_usdcard);
        nftContract = IERC721(_nftContract);
    }

    // Начать игру (PVP или PVE)
    function startGame(address _opponent, GameType _gameType) external {
        require(nftContract.balanceOf(msg.sender) > 0, "Need NFT");
        require(usdcard.balanceOf(msg.sender) >= ENTRY_FEE, "Insufficient USDCard");
        
        if (_gameType == GameType.PVP) {
            require(_opponent != address(0), "Invalid opponent");
            require(nftContract.balanceOf(_opponent) > 0, "Opponent needs NFT");
            require(usdcard.balanceOf(_opponent) >= ENTRY_FEE, "Opponent needs 10 USDCard");
            usdcard.transferFrom(_opponent, address(this), ENTRY_FEE);
        }

        usdcard.transferFrom(msg.sender, address(this), ENTRY_FEE);

        uint256 gameId = nextGameId++;
        games[gameId] = Game({
            player1: msg.sender,
            player2: _opponent,
            startTime: block.timestamp,
            gameType: _gameType,
            status: GameStatus.Active,
            prizePool: ENTRY_FEE * (_gameType == GameType.PVP ? 2 : 1)
        });
        currentGameId[msg.sender] = gameId;
        if (_gameType == GameType.PVP) currentGameId[_opponent] = gameId;

        emit GameStarted(gameId, msg.sender, _opponent, _gameType);
    }

    // Чат
    function sendMessage(uint256 _gameId, string memory _text) external {
        require(games[_gameId].status == GameStatus.Active, "Game not active");
        require(
            msg.sender == games[_gameId].player1 || msg.sender == games[_gameId].player2,
            "Not a player"
        );
        gameChats[_gameId].push(Message(msg.sender, _text, block.timestamp));
        emit MessageSent(_gameId, msg.sender, _text);
    }

    // Арбитраж (игроки отправляют хэш выбора)
    function commitChoice(uint256 _gameId, bytes32 _hash) external {
        require(games[_gameId].status == GameStatus.Active, "Game not active");
        if (msg.sender == games[_gameId].player1) {
            player1Commit[_gameId] = _hash;
        } else {
            player2Commit[_gameId] = _hash;
        }
    }

    // Раскрытие выбора (определение победителя)
    function revealChoice(uint256 _gameId, address _winner, bytes32 _salt) external {
        require(games[_gameId].status == GameStatus.Active, "Game not active");
        bytes32 hash = keccak256(abi.encodePacked(_winner, _salt));
        require(
            hash == player1Commit[_gameId] || hash == player2Commit[_gameId],
            "Invalid reveal"
        );
        gameWinner[_gameId] = _winner;
        _endGame(_gameId, _winner);
    }

    // Возврат ставок при дисконнекте
    function refundDisconnected(uint256 _gameId) external {
        require(games[_gameId].status == GameStatus.Active, "Game not active");
        require(
            block.timestamp > games[_gameId].startTime + GAME_TIMEOUT,
            "Game not expired"
        );
        
        Game storage game = games[_gameId];
        game.status = GameStatus.Disconnected;
        
        usdcard.transfer(game.player1, ENTRY_FEE);
        if (game.gameType == GameType.PVP) {
            usdcard.transfer(game.player2, ENTRY_FEE);
        }

        emit PlayerDisconnected(_gameId, msg.sender);
    }

    // Завершение игры (внутренняя функция)
    function _endGame(uint256 _gameId, address _winner) private {
        Game storage game = games[_gameId];
        game.status = GameStatus.Finished;
        
        address loser = (_winner == game.player1) ? game.player2 : game.player1;
        usdcard.transfer(_winner, game.prizePool);

        emit GameEnded(_gameId, _winner, loser, game.prizePool);
    }
}
