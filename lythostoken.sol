// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILythosBot {
    function getUserBots(address user) external view returns (uint256[] memory);
    function bots(uint8 botId) external view returns (
        uint256 price,
        uint256 interestRate,
        uint256 withdrawalFee,
        uint256 totalRewards,
        bool withdrawalsEnabled
    );
}

contract LYTHOSToken {
    string public name = "LYTHOS";
    string public symbol = "LYTH";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public ethPriceInLYTH = 20000; // 1 ETH = 20,000 LYTH
    address public owner;
    
    ILythosBot public lythosBot; // Instanciamos la interfaz del contrato LythosBot

    mapping(address => uint256) public balanceOf;
    mapping(address => address) public referrer;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event TokensRewarded(address indexed user, uint256 amount);
    event EthWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _lythosBotAddress) {
        owner = msg.sender;
        lythosBot = ILythosBot(_lythosBotAddress); // Asignamos la dirección del contrato LythosBot
        
        // Mint inicial de 1 millón de tokens (1,000,000 * 1e18)
        uint256 initialSupply = 1_000_000 * 1e18;
        totalSupply = initialSupply;
        balanceOf[owner] = initialSupply;
        emit Mint(owner, initialSupply);
        emit Transfer(address(0), owner, initialSupply);
    }

    // Mint tokens for a specified address
    function mint(address _to, uint256 _amount) external onlyOwner {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }

    // Burn tokens from a specified address
    function burn(address _from, uint256 _amount) external onlyOwner {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        totalSupply -= _amount;
        balanceOf[_from] -= _amount;
        emit Burn(_from, _amount);
        emit Transfer(_from, address(0), _amount);
    }

    // Set referrer for the user
    function setReferrer(address _referrer) external {
        require(referrer[msg.sender] == address(0), "Referrer already set");
        require(_referrer != msg.sender, "Cannot refer yourself");
        referrer[msg.sender] = _referrer;
    }

    // Reward tokens to user and referrer after bot purchase
    function rewardTokens(address user) external {
        require(user != address(0), "Invalid user");

        uint256 totalMint = 0;
        uint256 userReward = 0;
        uint256 refReward = 0;

        // Obtenemos los bots comprados por el usuario desde LythosBot
        uint256[] memory purchasedBots = lythosBot.getUserBots(user);
        
        for (uint256 i = 0; i < purchasedBots.length; i++) {
            uint256 botId = purchasedBots[i];
            (uint256 price, , , , ) = lythosBot.bots(uint8(botId)); // Obtenemos el precio del bot
            require(price > 0, "Invalid bot");

            // Calculamos la recompensa para este bot
            uint256 rewardForBot = (price * 100) / 40; // Un porcentaje del precio
            totalMint += rewardForBot;
            userReward += (rewardForBot * 40) / 100; // 40% al usuario
            refReward += (rewardForBot * 40) / 100;  // 40% al referidor
        }

        // Mint y recompensamos al usuario y al referidor
        mintTokens(address(this), totalMint); // Mintamos los tokens en el contrato
        balanceOf[user] += userReward;

        address ref = referrer[user];
        if (ref != address(0)) {
            balanceOf[ref] += refReward;
            emit TokensRewarded(ref, refReward);
        }

        emit TokensRewarded(user, userReward);
    }

    // Custom mint function to avoid naming conflicts
    function mintTokens(address _to, uint256 _amount) internal {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }

    // Buy tokens with ETH
    function buyTokens() external payable {
        uint256 amountToBuy = msg.value * ethPriceInLYTH; // 1 ETH = 20,000 LYTH
        require(balanceOf[address(this)] >= amountToBuy, "Insufficient contract balance");

        balanceOf[msg.sender] += amountToBuy;
        emit Transfer(address(this), msg.sender, amountToBuy);
    }

    // Withdraw ETH by the owner
    function withdrawETH(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        payable(owner).transfer(_amount);
        emit EthWithdrawn(owner, _amount);
    }

    // Withdraw tokens by the owner
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(balanceOf[address(this)] >= _amount, "Insufficient token balance");
        balanceOf[owner] += _amount;
        emit Transfer(address(this), owner, _amount);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
