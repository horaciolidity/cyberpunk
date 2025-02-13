document.addEventListener("DOMContentLoaded", function () {
    const mascota = document.getElementById("mascota");
    const mensaje = document.getElementById("mensaje");

    mascota.addEventListener("click", () => {
        mensaje.style.display = mensaje.style.display === "none" ? "block" : "none";
    });

    // Mensajes de bienvenida
    setTimeout(() => {
        mensaje.style.display = "block";
        setTimeout(() => {
            mensaje.style.display = "none";
        }, 5000);
    }, 1000);

    // Función para verificar la red en Web3 (requiere MetaMask)
    async function verificarRed() {
        if (window.ethereum) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== "0xa") { // 0xa es Optimism
                mensaje.innerHTML = "⚠️ ¡Estás en la red equivocada! Cambia a Optimism.";
                mensaje.style.display = "block";
            }
        } else {
            mensaje.innerHTML = "🔴 MetaMask no detectado. Instálalo para continuar.";
            mensaje.style.display = "block";
        }
    }

    setTimeout(verificarRed, 3000);
});
