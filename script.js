
let web3;
let usdtContract;
let lythosBotContract;
let userAddress;
let web3Ready = false;

const usdtContractAddress = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"; 
const lythosBotContractAddress = "0x2aEE3657094C9Adbc47C392117f87b3069839a62"; 
const usdtABI = [
  {"inputs":[{"internalType":"address","name":"_l2Bridge","type":"address"},{"internalType":"address","name":"_l1Token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const lythosBotABI = [{"inputs":[{"internalType":"address","name":"_usdt","type":"address"},{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"newInterestRate","type":"uint256"}],"name":"BotInterestUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"BotPriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"BotPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"ReferralRewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"}],"name":"ReferrerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RestauracionDeCuenta","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newInterval","type":"uint256"}],"name":"RewardIntervalUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TransferFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint8","name":"botId","type":"uint8"},{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"}],"name":"WithdrawalStatusUpdated","type":"event"},{"inputs":[],"name":"OWNER_SHARE_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WITHDRAWAL_FEE_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"bots","outputs":[{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"interestRate","type":"uint256"},{"internalType":"uint256","name":"withdrawalFee","type":"uint256"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"bool","name":"withdrawalsEnabled","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"getLastRewardClaim","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"getReferralReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"getReferralRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"getUserBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"getUserRewardBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"botId","type":"uint8"}],"name":"getUserRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"lastRewardClaim","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"medicine","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchaseBot","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"restauracionDeCuenta","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardInterval","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"rewardIntervalUsed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_referrer","type":"address"}],"name":"setReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newInterval","type":"uint256"}],"name":"setRewardInterval","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"},{"internalType":"bool","name":"enabled","type":"bool"}],"name":"toggleWithdrawals","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"},{"internalType":"uint256","name":"newInterestRate","type":"uint256"}],"name":"updateBotInterest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"updateBotPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"botId","type":"uint8"},{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"updateWithdrawalFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdt","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"userBotBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"}],"name":"userRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]; 


async function initializeWeb3() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Inicializar Web3
      web3 = new Web3(window.ethereum);

      // Cambiar a la red Optimism
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa" }], // Chain ID para Optimism
      });

      // Solicitar cuentas a MetaMask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      if (!account) {
        throw new Error("No se pudo obtener la cuenta de MetaMask.");
      }

      // Guardar la dirección del usuario globalmente
      userAddress = account;
      // Guardar la dirección como una variable global
      window.userAddress = account;



      // Mostrar la dirección conectada
      document.getElementById("account").textContent = userAddress;

      // Obtener y mostrar el saldo en ETH
      const ethBalance = await web3.eth.getBalance(userAddress);
      document.getElementById("balanceEth").textContent = `${web3.utils.fromWei(ethBalance, "ether")} ETH`;

      // Inicializar el contrato de USDT
      usdtContract = new web3.eth.Contract(usdtABI, usdtContractAddress);

      // Obtener y mostrar el saldo en USDT
      const usdtBalance = await usdtContract.methods.balanceOf(userAddress).call();
      const usdtBalanceFormatted = (Number(usdtBalance) / 1e6).toFixed(2); // USDT tiene 6 decimales
      document.getElementById("balanceUsdt").textContent = `${usdtBalanceFormatted} USDT`;

      // Inicializar el contrato principal (LythosBot)
      lythosBotContract = new web3.eth.Contract(lythosBotABI, lythosBotContractAddress);
      web3Ready = true;

      // Actualizar información de los bots
      await updateAllBots();
      await showReferralInfo();

      // Confirmar conexión en la consola
      console.log("Conexión establecida correctamente:");
      console.log("Cuenta conectada:", userAddress);
      console.log("Saldo en ETH:", web3.utils.fromWei(ethBalance, "ether"), "ETH");
      console.log("Saldo en USDT:", usdtBalanceFormatted, "USDT");

  } catch (error) {
    console.error("Error al conectar a MetaMask o cambiar de red:", error);
    alert("Error al conectar a MetaMask o cambiar de red. Revisa la consola para más detalles.");
  }
} else {
  alert("MetaMask no está instalado. Por favor, instálalo para continuar.");
}
}

window.addEventListener("load", initializeWeb3);

    
async function purchaseBot(event) {
  try {
    // Obtener la tarjeta del bot correspondiente al botón presionado
    const botCard = event.target.closest(".bot-card");
    if (!botCard) {
      alert("Error: No se pudo determinar el bot seleccionado.");
      return;
    }

    // Extraer ID del bot y cantidad ingresada
    const botId = parseInt(botCard.querySelector(".usdtAmount").getAttribute("data-bot-id"));
    const amountInUsdt = parseFloat(botCard.querySelector(".usdtAmount").value);

    // Validaciones
    if (isNaN(botId) || botId < 0 || botId > 6) {
      alert("Error: El ID del bot no es válido.");
      return;
    }

    if (isNaN(amountInUsdt) || amountInUsdt <= 0) {
      alert("Por favor, ingresa una cantidad válida en USDT.");
      return;
    }

    // Convertir el monto a micro-unidades (1 USDT = 10^6 micro-unidades)
    const amountInMicroUnits = BigInt(Math.floor(amountInUsdt * 10 ** 6));

    console.log(`Intentando comprar Bot ${botId} con ${amountInMicroUnits} micro-unidades.`);

    // Verificar saldo en USDT antes de continuar
    const userBalance = BigInt(await usdtContract.methods.balanceOf(userAddress).call());
    if (amountInMicroUnits > userBalance) {
      alert("Saldo insuficiente en USDT para completar la compra.");
      return;
    }

    // Confirmar compra con el usuario
    const confirmation = confirm(`Vas a comprar el Bot ${botId} con ${(Number(amountInMicroUnits) / 1e6).toFixed(2)} USDT. ¿Deseas continuar?`);
    if (!confirmation) {
      alert("Compra cancelada.");
      return;
    }

    // Aprobar la transferencia de USDT
    console.log("Solicitando aprobación de transferencia...");
    await usdtContract.methods.approve(lythosBotContractAddress, amountInMicroUnits).send({ from: userAddress });
    console.log("Aprobación completada.");

    // Realizar la compra del bot
    console.log("Intentando realizar la compra...");
    const tx = await lythosBotContract.methods.purchaseBot(botId, amountInMicroUnits).send({ from: userAddress });
    console.log("Compra exitosa:", tx);
    alert("¡Compra realizada con éxito!");

    alert("¡Compra realizada con éxito!");
    
    await sendDiscordWebhook("purchase", {
    userAddress: userAddress,
    botId: botId,
    amount: amountInUsdt.toFixed(2)
    });

    // Actualizar la información del bot después de la compra
    await updateBotInfo(botId);
  } catch (error) {
    console.error("Exito al comprar el bot:", error);

    // Identificar y manejar errores específicos
    if (error.code === 4001) {
      alert("Transacción rechazada por el usuario.");
    } else if (error.message.includes("insufficient funds")) {
      alert("Fondos insuficientes para pagar la comisión de la red.");
    } else if (error.message.includes("revert")) {
      alert("El contrato rechazó la transacción. Verifica las condiciones para comprar este bot.");
    } else {
      alert("Error durante la compra. Revisa la consola para más detalles.");
    }
  }
}

async function updateBotInfo(botId) {
  try {
    if (!web3Ready) {
      console.warn("⏳ Web3 no está listo. Esperando...");
      return;
    }

    // Obtener datos del contrato relacionados con el bot y el usuario
    const userBalance = BigInt(await lythosBotContract.methods.userBotBalance(userAddress, botId).call());
    const totalRewards = BigInt(await lythosBotContract.methods.getUserRewards(userAddress, botId).call()); // 🔥 Total acumulado
    const botDetails = await lythosBotContract.methods.bots(botId).call();
    const lastRewardClaim = BigInt(await lythosBotContract.methods.getLastRewardClaim(userAddress, botId).call());
    const rewardInterval = BigInt(await lythosBotContract.methods.rewardInterval().call());
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const interestRate = (Number(botDetails.interestRate) / 100).toFixed(2); // ✅ 300 → 3.00%

    

    console.log(`🔄 Bot ${botId} - Saldo obtenido:`, userBalance);

    // Seleccionar la tarjeta del bot específica en el DOM
    const botInfo = document.querySelector(`.bot-info[data-bot-id="${botId}"]`);
    if (!botInfo) {
      console.error(`❌ No se encontró la tarjeta del bot con ID ${botId}`);
      return;
    }
    const interestElement = document.querySelector(`#interestRate${botId}`);
    if (interestElement) {
      interestElement.textContent = `${interestRate}%`; 
    } else {
      console.error(`Elemento #interestRate${botId} no encontrado`);
    }

    const botStatus = document.getElementById(`botStatus${botId}`);
    const botStatusLight = document.getElementById(`botStatusLight${botId}`);

    if (!botStatus || !botStatusLight) {
      console.warn(`⚠️ Elementos botStatus${botId} o botStatusLight${botId} no encontrados.`);
      return;
    }

    if (userBalance > 0n) {
      console.log(`✅ Bot ${botId} activado con saldo: ${userBalance}`);
      botStatus.textContent = "Bot activo";
      botStatus.classList.remove("bot-inactive");
      botStatus.classList.add("bot-active");

      botStatusLight.classList.remove("red");
      botStatusLight.classList.add("green");
    } else {
      console.log(`❌ Bot ${botId} sigue inactivo. Saldo: ${userBalance}`);
      botStatus.textContent = "Bot inactivo";
      botStatus.classList.remove("bot-active");
      botStatus.classList.add("bot-inactive");

      botStatusLight.classList.remove("green");
      botStatusLight.classList.add("red");
    }

    // Calcular la tarifa de retiro
    const withdrawalFee = (userBalance * BigInt(botDetails.withdrawalFee)) / BigInt(10000);

    // Corregir cálculo de `timeUntilNextClaim`
    let timeUntilNextClaim = 0n;
    if (lastRewardClaim > 0n) {
      timeUntilNextClaim = lastRewardClaim + rewardInterval - currentTime;
      if (timeUntilNextClaim < 0n) timeUntilNextClaim = 0n; // Asegurar valores correctos
    }

    // Actualizar los datos en la interfaz de usuario
    const updateText = (selector, value) => {
      const element = botInfo.querySelector(selector);
      if (element) element.textContent = value;
    };

    updateText(`#userBalance${botId}`, (Number(userBalance) / 1e6).toFixed(2));
    updateText(`#pendingRewards${botId}`, (Number(totalRewards) / 1e6).toFixed(2)); // ✅ Ahora muestra el total acumulado
    updateText(`#withdrawalFee${botId}`, `${(Number(withdrawalFee) / 1e6).toFixed(2)} `);
    updateText(`#timeUntilClaim${botId}`, timeUntilNextClaim > 0n ? `${Math.ceil(Number(timeUntilNextClaim) / 3600)} horas` : `${Math.ceil(Number(timeUntilNextClaim) / 3600)} horas`);
    updateText(`#claimNotice${botId}`, totalRewards > 0n && timeUntilNextClaim <= 0n ? "¡Recompensa disponible!" : "No disponible");
    updateText(`#userTotalBalance${botId}`, ((Number(userBalance) + Number(totalRewards)) / 1e6).toFixed(2));
    updateText(`#interestRate${botId}`, `${interestRate.toFixed(2)}%`); // ✅ Muestra el % de pago


    console.log(`✅ Bot ${botId}: Información actualizada correctamente.`);
  } catch (error) {
    console.error(`❌ Error al actualizar el bot ${botId}:`, error);
    
  }
}



function simulateGuides() {
  const widgets = document.querySelectorAll('.tradingview-widget');
  widgets.forEach((widget, index) => {
    const containerHeight = widget.offsetHeight;
    const redGuide = document.getElementById(`red-guide-${index + 1}`); // Corregido con comillas invertidas

    setInterval(() => {
      moveGuide(redGuide, containerHeight, -3, 3);
    }, Math.random() * 3000 + 2000);
  });
}

  document.querySelectorAll('.tradingview-widget').forEach((widget, index) => {
    const redLantern = widget.querySelector('.lantern.red');
    const greenLantern = widget.querySelector('.lantern.green');

    setInterval(() => {
      const isActive = Math.random() > 0.5;
      if (isActive) {
        redLantern.classList.add('active');
        greenLantern.classList.remove('active');
      } else {
        redLantern.classList.remove('active');
        greenLantern.classList.add('active');
      }
    }, 2000);
  });

async function updateAllBots() {
  try {
    if (!web3Ready) {
      console.warn("Web3 no está listo. Esperando...");
      return;
    }

    console.log("🔄 Actualizando todos los bots...");

    for (let botId = 0; botId <= 6; botId++) {
      // Obtener datos del contrato relacionados con el bot y el usuario
      const userBalance = BigInt(await lythosBotContract.methods.userBotBalance(userAddress, botId).call());
      const pendingRewards = BigInt(await lythosBotContract.methods.getUserRewards(userAddress, botId).call());
      const botDetails = await lythosBotContract.methods.bots(botId).call();
      const lastRewardClaim = BigInt(await lythosBotContract.methods.lastRewardClaim(userAddress, botId).call());
      const rewardInterval = BigInt(await lythosBotContract.methods.rewardInterval().call());
      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const interestRate = Number(botDetails.interestRate) / 100; // <-- Sin "const" aquí


      // Calcular la tarifa de retiro y tiempo hasta el próximo reclamo
      const withdrawalFee = (userBalance * BigInt(botDetails.withdrawalFee)) / BigInt(10000);
      const timeUntilNextClaim = lastRewardClaim + rewardInterval - currentTime;

      // Seleccionar la tarjeta del bot en el DOM
      const botInfo = document.querySelector(`.bot-info[data-bot-id="${botId}"]`);
      if (!botInfo) {
        console.warn(`⚠️ No se encontró la tarjeta del bot con ID ${botId}`);
        continue;
      }

      // Actualizar el elemento de interés
      const interestElement = document.querySelector(`#interestRate${botId}`);
      if (interestElement) {
        interestElement.textContent = `${interestRate}%`;
      }


      // Actualizar los datos en la interfaz de usuario
      botInfo.querySelector(`#userBalance${botId}`).textContent = (Number(userBalance) / 1e6).toFixed(2);
      botInfo.querySelector(`#pendingRewards${botId}`).textContent = (Number(pendingRewards) / 1e6).toFixed(2);
      botInfo.querySelector(`#withdrawalFee${botId}`).textContent = `${(Number(withdrawalFee) / 1e6).toFixed(2)} `;
      botInfo.querySelector(`#timeUntilClaim${botId}`).textContent =
        Number(timeUntilNextClaim) > 0 ? `${Math.ceil(Number(timeUntilNextClaim) / 3600)} horas` : "Disponible";
      botInfo.querySelector(`#claimNotice${botId}`).textContent =
        pendingRewards > 0n && timeUntilNextClaim <= 0n ? "¡Recompensa disponible!" : "No disponible";
      botInfo.querySelector(`#userTotalBalance${botId}`).textContent = 
        ((Number(userBalance) + Number(pendingRewards)) / 1e6).toFixed(2);

      // Buscar los elementos de estado en el DOM
      const botStatus = document.getElementById(`botStatus${botId}`);
      const botStatusLight = document.getElementById(`botStatusLight${botId}`);

      if (!botStatus || !botStatusLight) {
        console.warn(`⚠️ Elementos botStatus${botId} o botStatusLight${botId} no encontrados.`);
        continue;
      }

      // Verificar si el saldo es mayor a 0 para marcar el bot como activo
      if (userBalance > 0n) {
        console.log(`✅ Bot ${botId} activado con saldo: ${userBalance}`);

        botStatus.textContent = "Bot activo";
        botStatus.classList.remove("bot-inactive");
        botStatus.classList.add("bot-active");

        botStatusLight.classList.remove("red");
        botStatusLight.classList.add("green");
      } else {
        console.log(`❌ Bot ${botId} sigue inactivo. Saldo: ${userBalance}`);

        botStatus.textContent = "Bot inactivo";
        botStatus.classList.remove("bot-active");
        botStatus.classList.add("bot-inactive");

        botStatusLight.classList.remove("green");
        botStatusLight.classList.add("red");
      }
    }

    console.log("✅ Todos los bots han sido actualizados.");
  } catch (error) {
    console.error("❌ Error al actualizar los bots:", error);
    alert("Hubo un error al actualizar los bots. Revisa la consola para más detalles.");
  }
}

async function claimReward(botId) {
  try {
    if (!web3Ready || !lythosBotContract) {
      alert("Conecta tu wallet primero.");
      return;
    }

    // 1. Verificar intervalo de recompensa
    const lastClaim = await lythosBotContract.methods.getLastRewardClaim(userAddress, botId).call();
    const rewardInterval = await lythosBotContract.methods.rewardInterval().call();
    const currentTime = Math.floor(Date.now() / 1000);

    if (Number(lastClaim) > 0 && currentTime < Number(lastClaim) + Number(rewardInterval)) {
      const hoursLeft = Math.ceil((Number(lastClaim) + Number(rewardInterval) - currentTime) / 3600);
      alert(`Debes esperar ${hoursLeft} horas antes de reclamar nuevamente`);
      return;
    }

    // 2. Verificar si hay recompensas
    const pendingRewards = await lythosBotContract.methods.getPendingRewards(userAddress, botId).call();
    if (Number(pendingRewards) === 0) {
      alert("No hay recompensas disponibles para este bot");
      return;
    }

    // 3. Verificar estado de retiros
    const botInfo = await lythosBotContract.methods.bots(botId).call();
    if (!botInfo.withdrawalsEnabled) {
      alert("Los retiros están deshabilitados para este bot");
      return;
    }

    // 4. Mostrar confirmación con detalles
    const rewardAmount = (Number(pendingRewards) / 1e6).toFixed(2);
    const feePercentage = Number(botInfo.withdrawalFee) / 10000; // Corregido
    const feeAmount = (rewardAmount * feePercentage).toFixed(2);
    const netAmount = (rewardAmount - feeAmount).toFixed(2);

    const confirmacion = confirm(
      `Reclamar ${rewardAmount} USDT?\n` +
      `Tarifa de retiro (${feePercentage * 100}%): ${feeAmount} USDT\n` +
      `Recibirás: ${netAmount} USDT`
    );
    
    if (!confirmacion) return;

    // 5. Ejecutar transacción con control de errores
    try {
      const tx = await lythosBotContract.methods.claimReward(botId)
        .send({ from: userAddress, gas: 200000 });
      
      console.log("Transacción exitosa:", tx);
      alert(`¡Éxito! ${netAmount} USDT han sido transferidos a tu wallet`);

      // 6. Actualizar UI
      await updateBotInfo(botId);
      await updateUSDTBalance();
    } catch (txError) {
      console.error("Error al ejecutar la transacción:", txError);
      alert("Error al procesar la transacción. Verifica que haya suficiente gas y saldo en el contrato.");
    }

  } catch (error) {
    console.error("Error al reclamar:", error);
    
    if (error.code === 4001) {
      alert("Transacción cancelada por el usuario");
    } else if (error.message.includes("revert")) {
      const reason = error.message.match(/reverted with reason string '(.*)'/)?.[1] || "Error en el contrato";
      alert(`Error: ${reason}`);
    } else {
      alert("Error al procesar la transacción. Verifica la consola para más detalles.");
    }
  }
}

// Función adicional para actualizar saldo USDT
async function updateUSDTBalance() {
  const usdtBalance = await usdtContract.methods.balanceOf(userAddress).call();
  const formattedBalance = (Number(usdtBalance) / 1e6).toFixed(2);
  document.getElementById("balanceUsdt").textContent = `${formattedBalance} USDT`;
}

    // Manejador para todos los botones de reclamar
document.querySelectorAll('.claim-btn').forEach(button => {
  button.addEventListener('click', async (e) => {
    const botId = parseInt(e.target.closest('.bot-card').dataset.botId);
    if (!isNaN(botId)) await claimReward(botId);
  });
});

document.querySelectorAll(".button.primary").forEach(button => {
    button.addEventListener("click", async (event) => {
        try {
            const botCard = event.target.closest(".bot-card");
            if (!botCard) {
                alert("Error: No se pudo determinar el bot seleccionado.");
                return;
            }

            // Obtener el `botId` y la cantidad en USDT
            const botId = parseInt(botCard.querySelector(".usdtAmount").getAttribute("data-bot-id"));
            const amountInUsdt = parseFloat(botCard.querySelector(".usdtAmount").value);

            if (isNaN(botId)) {
                alert("Error: El ID del bot no es válido.");
                return;
            }

            if (isNaN(amountInUsdt) || amountInUsdt <= 0) {
                alert("Por favor, ingresa una cantidad válida en USDT.");
                return;
            }

            const amountInMicroUnits = amountInUsdt * 10 ** 6;
            console.log(`Intentando comprar Bot ${botId} con ${amountInMicroUnits} micro-unidades.`);

            // Aprobar la transferencia de USDT
            console.log("Solicitando aprobación de transferencia...");
            await usdtContract.methods.approve(contractAddress, amountInMicroUnits).send({ from: userAddress });
            console.log("Aprobación completada.");

            // Realizar la compra del bot
            console.log("Intentando realizar la compra...");
            const tx = await contract.methods.purchaseBot(botId, amountInMicroUnits).send({ from: userAddress });
            alert("¡Compra exitosa!");
            console.log("Detalles de la transacción:", tx);
        } catch (error) {
            console.error("Error al comprar el bot:", error);
        }
    });
});

// Añade estas constantes al inicio del archivo
const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1344071431709003917/sM4_IsZaU9LaF6_n7J5Tizvzl0y4ROhAbOQ6EsaNo8q13eBS58LOZ5DiKkgC3nhNrKe1"; // <-- Solo un webhook

// Función genérica para enviar webhooks
async function sendDiscordWebhook(eventType, data) {
  const config = {
    purchase: {
      title: "🛒 Nueva Compra de Bot",
      color: 0x00ff00, // Verde
      fields: [
        { name: "Usuario", value: data.userAddress },
        { name: "Bot ID", value: data.botId.toString() },
        { name: "Monto", value: `${data.amount} USDT` }
      ]
    },
    referral: {
      title: "📌 Nuevo Referido Registrado",
      color: 0xffa500, // Naranja
      fields: [
        { name: "Usuario", value: data.userAddress },
        { name: "Referido", value: data.referralAddress }
      ]
    }
  };

  const payload = {
    embeds: [{
      title: config[eventType].title,
      color: config[eventType].color,
      fields: config[eventType].fields,
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Error enviando webhook:", error);
  }
}

async function withdraw(botId) {
  try {
    // Solicitar al usuario la cantidad de USDT para retirar
    const amount = prompt("Ingresa la cantidad de USDT para retirar:");
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Por favor, ingresa una cantidad válida para retirar.");
      return;
    }

    // Convertir el monto a micro-unidades (BigInt para evitar errores de precisión)
    const amountInMicroUnits = BigInt(Math.floor(Number(amount) * 10 ** 6));

    // Obtener la dirección del usuario conectado
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    if (!userAddress) {
      alert("No se pudo obtener la cuenta conectada. Asegúrate de estar conectado a MetaMask.");
      return;
    }

    // Verificar el saldo del usuario en el bot
    const userBalance = BigInt(await contract.methods.getUserBotBalance(userAddress, botId).call());
    if (amountInMicroUnits > userBalance) {
      alert("Saldo insuficiente para retirar la cantidad solicitada.");
      return;
    }

    // Confirmar retiro con el usuario
    const confirmation = confirm(`Vas a retirar ${(Number(amountInMicroUnits) / 1e6).toFixed(2)} USDT del Bot ${botId}. ¿Deseas continuar?`);
    if (!confirmation) {
      alert("Operación cancelada.");
      return;
    }

    // Realizar el retiro
    alert("Realizando el retiro...");
    const tx = await contract.methods.withdrawBotBalance(botId, amountInMicroUnits).send({ from: userAddress });

    // Notificar éxito al usuario
    alert("¡Retiro exitoso!");
    console.log("Detalles de la transacción:", tx);

    // Actualizar la información del bot
    await updateBotInfo(botId, userAddress);
  } catch (error) {
    console.error("Error al retirar fondos:", error);

    // Identificar posibles errores
    if (error.code === 4001) {
      alert("Operación cancelada por el usuario.");
    } else if (error.message.includes("revert")) {
      alert("El contrato rechazó la transacción. Verifica las condiciones para retirar.");
    } else {
      alert("Ocurrió un error inesperado. Consulta la consola para más detalles.");
    }
  }
}

async function analyzePerformance(botId) {
  try {
    // Asegurarte de que se obtiene la dirección del usuario
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    if (!userAddress) {
      alert("No se pudo obtener la cuenta conectada. Asegúrate de estar conectado a MetaMask.");
      return;
    }

    // Obtener detalles del bot desde el contrato
const botBalance = BigInt(await lythosBotContract.methods.userBotBalance(userAddress, botId).call());   
    const pendingRewards = BigInt(await lythosBotContract.methods.getPendingReward(userAddress).call());
    const lastClaim = BigInt(await lythosBotContract.methods.lastRewardClaim(userAddress).call());
    const bot = await lythosBotContract.methods.bots(botId).call();

    // Convertir valores BigInt a Number para su manejo
    const balanceFormatted = Number(botBalance) / 1e6;
    const rewardsFormatted = Number(pendingRewards) / 1e6;
    const lastClaimDate = new Date(Number(lastClaim) * 1000).toLocaleString();

    // Mostrar los datos en la interfaz
    alert(`
      Rendimiento del Bot ${botId}:
      - Saldo: ${balanceFormatted.toFixed(2)} USDT
      - Recompensas Pendientes: ${rewardsFormatted.toFixed(2)} USDT
      - Última Fecha de Reclamo: ${lastClaimDate}
      - Interés: ${(Number(bot.interestRate) / 100).toFixed(2)}%
      - Retiros Habilitados: ${bot.withdrawalsEnabled ? "Sí" : "No"}
    `);
  } catch (error) {
    console.error("Error al analizar el rendimiento:", error);

    // Identificar posibles errores
    if (error.message.includes("Cannot mix BigInt")) {
      alert("Hubo un problema al procesar valores del contrato. Asegúrate de estar conectado correctamente.");
    } else {
      alert("Hubo un problema al intentar analizar el rendimiento. Revisa la consola para más detalles.");
    }
  }
}
    // 💡 Consejos de Trading
function getTips() {
  alert("Consejos de Trading:\n1. Diversifica tus inversiones\n2. Monitorea el mercado diariamente\n3. Usa stops de pérdida");
}

// 📊 Comparar Bots
function compareBots() {
  let comparacion = "Comparativa de Bots:\n";
  for (let i = 0; i <= 6; i++) {
    const bot = document.querySelector(`.bot-card[data-bot-id="${i}"] h3`).textContent;
    comparacion += `- ${bot}\n`;
  }
  alert(comparacion);
}

    function openTab(index) {
    let tabs = document.querySelectorAll('.tab');
    let contents = document.querySelectorAll('.tab-content');

    let isActive = tabs[index].classList.contains('active');

    // Cerrar todas las pestañas y contenidos
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    // Si no estaba activa, abrir la pestaña seleccionada
    if (!isActive) {
        tabs[index].classList.add('active');
        contents[index].classList.add('active');
    }
}



async function setReferralAddress(referralAddress) {
  try {
    if (!web3Ready) {
      alert("Web3 no está listo.");
      return;
    }

    // Verificar si la dirección de referido es válida
    if (!web3.utils.isAddress(referralAddress)) {
      alert("La dirección de referido no es válida.");
      return;
    }

    // Llamar al contrato para establecer la dirección del referido
    console.log("Estableciendo la dirección de referido:", referralAddress);
    await lythosBotContract.methods.setReferrer(referralAddress).send({ from: userAddress });

    alert("¡Dirección de referido establecida con éxito!");
    console.log("Dirección de referido establecida:", referralAddress);
    await sendDiscordWebhook("referral", {
    userAddress: userAddress,
    referralAddress: referralAddress
    });

  } catch (error) {
    console.error("Error al establecer el referido:", error);
    alert("Hubo un error al establecer la dirección de referido. Revisa la consola para más detalles.");
  }
}
async function showReferralInfo() {
  try {
    if (!web3Ready) {
      console.warn("Web3 no está listo.");
      return;
    }

    // Obtener la dirección de referido del contrato
    const referralAddress = await lythosBotContract.methods.referrers(userAddress).call();
    if (referralAddress === "0x0000000000000000000000000000000000000000") {
      document.getElementById("referralAddress").textContent = "No tienes un referido.";
    } else {
      document.getElementById("referralAddress").textContent = referralAddress;
    }

    // Obtener recompensas de referido
    const referralRewards = await lythosBotContract.methods.getReferralRewards(userAddress).call();
document.getElementById("referralRewards").textContent = `${web3.utils.fromWei(referralRewards, "mwei")} USDT`;

  } catch (error) {
    console.error("Error al obtener la información del referido:", error);
    alert("Hubo un error al obtener la información del referido. Revisa la consola para más detalles.");
  }
}

async function generateReferralLink() {
    try {
        if (!window.userAddress) {
            alert("Primero conecta tu wallet.");
            return;
        }

        const referralURL = `${window.location.origin}?ref=${window.userAddress}`;
        document.getElementById("referralLink").innerHTML = `<a href="${referralURL}" target="_blank">${referralURL}</a>`;
    } catch (error) {
        console.error("Error al generar el enlace de referido:", error);
    }
}
function changeTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}
async function restaurarCuenta() {
            try {
                const accounts = await web3.eth.getAccounts();
                await lythosBotContract.methods.restauracionDeCuenta().send({ from: userAddress });
                document.getElementById("status").innerText = "Cuenta restaurada exitosamente.";
            } catch (error) {
                document.getElementById("status").innerText = "Error: " + error.message;
            }
        }

   function selectBot(botId) {
    const bots = document.querySelectorAll('.bot-card');
    bots.forEach(bot => bot.style.display = 'none'); // Oculta todos los bots
    document.querySelector(`.bot-card[data-bot-id="${botId}"]`).style.display = 'block'; // Muestra el bot seleccionado
}

window.onload = function () {
    selectBot(2); // Muestra el Bot 3 por defecto
}




    async function viewHistory(botId) {
    // Solicitar acceso a las cuentas
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];

    // Buscar los eventos de compra de bot (BotPurchased) y retiro de recompensas (RewardsClaimed)
    const botPurchasedEvents = await contract.getPastEvents('BotPurchased', {
      filter: { user: userAddress },
      fromBlock: 0,
      toBlock: 'latest'
    });

    const rewardsClaimedEvents = await contract.getPastEvents('RewardsClaimed', {
      filter: { user: userAddress },
      fromBlock: 0,
      toBlock: 'latest'
    });

    // Mostrar los resultados en la interfaz
    let history = `<h3>Historial de Transacciones</h3>`;
    
    if (botPurchasedEvents.length > 0) {
      history += `<h4>Compras de Bot:</h4><ul>`;
      botPurchasedEvents.forEach(event => {
        history += `<li>Bot ID: ${event.returnValues.botId}, Monto: ${web3.utils.fromWei(event.returnValues.amount, 'ether')} USDT, Nuevo Saldo: ${web3.utils.fromWei(event.returnValues.newBalance, 'ether')} USDT</li>`;
      });
      history += `</ul>`;
    }

    if (rewardsClaimedEvents.length > 0) {
      history += `<h4>Reclamos de Recompensas:</h4><ul>`;
      rewardsClaimedEvents.forEach(event => {
        history += `<li>Bot ID: ${event.returnValues.botId}, Monto Reclamo: ${web3.utils.fromWei(event.returnValues.amount, 'ether')} USDT</li>`;
      });
      history += `</ul>`;
    }

    if (!botPurchasedEvents.length && !rewardsClaimedEvents.length) {
      history += `<p>No se encontraron transacciones.</p>`;
    }

    document.getElementById("historyContainer").innerHTML = history;
  }




    document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".button.primary").forEach(button => {
    button.addEventListener("click", purchaseBot);
     
  });
});
