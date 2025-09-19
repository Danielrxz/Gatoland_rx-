const { addCoins } = require("../libs/economy");

let cooldown = {};

module.exports = {
  name: "talar",
  alias: [".talar"],
  async run(m, { sock }) {
    const user = m.sender;
    const now = Date.now();

    if (cooldown[user] && (now - cooldown[user]) < 5 * 60 * 1000) {
      return sock.sendMessage(m.chat, { text: "🌲 Ya talaste, espera 5 minutos para volver a intentarlo." }, { quoted: m });
    }

    const trees = ["🌳 Roble", "🌲 Pino", "🎄 Abeto", "🌴 Palma", "🌿 Arbusto"];
    const cut = trees[Math.floor(Math.random() * trees.length)];
    const reward = Math.floor(Math.random() * 200) + 50; // 50 - 250

    const data = addCoins(user, reward);
    cooldown[user] = now;

    await sock.sendMessage(m.chat, {
      text: `🪓 Fuiste a talar y cortaste un *${cut}*.\n💰 Ganaste: *${reward} monedas*.\n\nAhora tienes: *${data.coins} monedas*.`
    }, { quoted: m });
  }
};