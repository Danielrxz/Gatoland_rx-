const { addCoins } = require("../libs/economy");

let cooldown = {};

module.exports = {
  name: "minar",
  alias: [".minar"],
  async run(m, { sock }) {
    const user = m.sender;
    const now = Date.now();

    if (cooldown[user] && (now - cooldown[user]) < 5 * 60 * 1000) {
      return sock.sendMessage(m.chat, { text: "⛏️ Ya minaste, espera 5 minutos para volver a intentarlo." }, { quoted: m });
    }

    const minerals = ["⛏️ Diamante", "⛏️ Oro", "⛏️ Hierro", "⛏️ Carbón", "⛏️ Esmeralda"];
    const mine = minerals[Math.floor(Math.random() * minerals.length)];
    const reward = Math.floor(Math.random() * 500) + 200; // 200 - 700

    const data = addCoins(user, reward);
    cooldown[user] = now;

    await sock.sendMessage(m.chat, {
      text: `⚒️ Fuiste a minar y encontraste *${mine}*.\n💰 Ganaste: *${reward} monedas*.\n\nAhora tienes: *${data.coins} monedas*.`
    }, { quoted: m });
  }
};