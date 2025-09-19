const { addCoins, getUser } = require("../libs/economy");

let cooldown = {};

module.exports = {
  name: "work",
  alias: [".work"],
  async run(m, { sock }) {
    const user = m.sender;
    const now = Date.now();

    if (cooldown[user] && (now - cooldown[user]) < 60 * 60 * 1000) {
      const timeLeft = Math.ceil((60 * 60 * 1000 - (now - cooldown[user])) / 60000);
      return sock.sendMessage(m.chat, { text: `⏳ Ya trabajaste crack, espera *${timeLeft} min* para volver a trabajar.` }, { quoted: m });
    }

    const reward = Math.floor(Math.random() * 500) + 100; // Entre 100 y 600
    const data = addCoins(user, reward);

    cooldown[user] = now;

    await sock.sendMessage(m.chat, {
      text: `💼 Trabajaste duro y ganaste *${reward} monedas* 🪙\n\n💰 Ahora tienes: *${data.coins} monedas*`,
    }, { quoted: m });
  }
};