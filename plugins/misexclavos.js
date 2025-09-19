const { getUser } = require("../libs/economy");

module.exports = {
  name: "misexclavos",
  alias: [".misexclavos"],
  async run(m, { sock }) {
    const user = m.sender;
    const data = getUser(user);

    if (!data.slaves || data.slaves.length === 0) {
      return sock.sendMessage(m.chat, { text: "😢 No tienes esclavos aún. Usa *.exclavisar* para atrapar uno." }, { quoted: m });
    }

    let msg = `👥 Lista de esclavos de @${user.split("@")[0]}:\n\n`;
    data.slaves.forEach((s, i) => {
      msg += `${i + 1}. @${s.split("@")[0]}\n`;
    });

    await sock.sendMessage(m.chat, {
      text: msg,
      mentions: [user, ...data.slaves]
    }, { quoted: m });
  }
};