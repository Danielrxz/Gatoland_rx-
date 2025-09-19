const { addCoins } = require("../libs/economy");

let cooldown = {};

module.exports = {
  name: "cazar",
  alias: [".cazar"],
  async run(m, { sock }) {
    const user = m.sender;
    const now = Date.now();

    if (cooldown[user] && (now - cooldown[user]) < 5 * 60 * 1000) {
      return sock.sendMessage(m.chat, { text: "⏳ Ya cazaste, espera 5 minutos para volver a intentarlo." }, { quoted: m });
    }

    const animals = ["🐇 Conejo", "🦌 Venado", "🐗 Jabalí", "🐿️ Ardilla", "🦆 Pato"];
    const hunt = animals[Math.floor(Math.random() * animals.length)];
    const reward = Math.floor(Math.random() * 300) + 100; // 100 - 400

    const data = addCoins(user, reward);
    cooldown[user] = now;

    await sock.sendMessage(m.chat, {
      text: `🏹 Fuiste de caza y atrapaste un *${hunt}*.\n💰 Ganaste: *${reward} monedas*.\n\nAhora tienes: *${data.coins} monedas*.`
    }, { quoted: m });
  }
};