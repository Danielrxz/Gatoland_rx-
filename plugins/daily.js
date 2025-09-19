const { addCoins, getUser } = require("../libs/economy");

let cooldown = {};

module.exports = {
  name: "daily",
  alias: [".daily"],
  async run(m, { sock }) {
    const user = m.sender;
    const now = Date.now();

    // 24 horas = 86400000 ms
    if (cooldown[user] && (now - cooldown[user]) < 24 * 60 * 60 * 1000) {
      const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - cooldown[user])) / (1000 * 60 * 60));
      return sock.sendMessage(m.chat, { text: `⏳ Ya reclamaste tu recompensa diaria.\n\nVuelve en *${timeLeft} horas*.` }, { quoted: m });
    }

    const reward = Math.floor(Math.random() * 1000) + 500; // Entre 500 y 1500 monedas
    const data = addCoins(user, reward);

    cooldown[user] = now;

    await sock.sendMessage(m.chat, {
      text: `🎁 Has reclamado tu recompensa diaria.\n\n💰 Ganaste: *${reward} monedas* 🪙\n💼 Ahora tienes: *${data.coins} monedas*`,
    }, { quoted: m });
  }
};