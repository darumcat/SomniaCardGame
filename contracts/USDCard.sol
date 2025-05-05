// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDCard is ERC20, Ownable {
    uint256 public constant MAX_USER_BALANCE = 10000 * 10**18; // Лимит 10,000 токенов
    uint256 public constant GAME_ENTRY_FEE = 10 * 10**18; // Фиксированная ставка 10 токенов
    
    mapping(address => bool) private _hasMinted;
    mapping(address => uint256) public playerScores; // Рейтинг игроков
    
    event TokensMinted(address indexed user, uint256 amount);
    event GameEntryPaid(address indexed player, uint256 fee);
    event GameResult(address indexed winner, address indexed loser, uint256 prize);

    constructor() ERC20("USDCard", "USDCD") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Стартовый запас для владельца
    }

    // Минт для обычных пользователей (только один раз)
    function mint() external {
        require(!_hasMinted[msg.sender], "USDCard: Already minted");
        _mint(msg.sender, MAX_USER_BALANCE);
        _hasMinted[msg.sender] = true;
        playerScores[msg.sender] = MAX_USER_BALANCE; // Начальный рейтинг
        emit TokensMinted(msg.sender, MAX_USER_BALANCE);
    }

    // Минт для владельца (без ограничений)
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        if (!_hasMinted[to]) {
            _hasMinted[to] = true;
            playerScores[to] = amount;
        } else {
            playerScores[to] += amount;
        }
        emit TokensMinted(to, amount);
    }

    // Оплата входа в игру (вызывается игровым контрактом)
    function payGameEntryFee() external {
        require(balanceOf(msg.sender) >= GAME_ENTRY_FEE, "USDCard: Insufficient balance");
        _transfer(msg.sender, address(this), GAME_ENTRY_FEE);
        emit GameEntryPaid(msg.sender, GAME_ENTRY_FEE);
    }

    // Распределение ставок после игры (вызывается игровым контрактом)
    function distributePrize(address winner, address loser) external onlyOwner {
        uint256 prize = GAME_ENTRY_FEE * 2; // 10 от победителя + 10 от проигравшего
        
        // Возвращаем ставку победителю + выигрыш
        _transfer(address(this), winner, prize);
        
        // Обновляем рейтинги
        playerScores[winner] += GAME_ENTRY_FEE;
        playerScores[loser] = (playerScores[loser] > GAME_ENTRY_FEE) ? 
            playerScores[loser] - GAME_ENTRY_FEE : 0;
        
        emit GameResult(winner, loser, prize);
    }

    // Проверка, минтил ли адрес токены
    function hasMinted(address account) external view returns (bool) {
        return _hasMinted[account];
    }

    // Получить текущий рейтинг игрока
    function getPlayerScore(address player) external view returns (uint256) {
        return playerScores[player];
    }
}
