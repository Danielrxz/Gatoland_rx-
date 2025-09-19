const { addSlave, getUser } = require("../libs/economy");

module.exports = {
  name: "exclavisar",
  alias: [".exclavisar"],
  async run(m, { sock, args }) {
    const user = m.sender;

    if (!m.quoted && !args[0]) {
      return sock.sendMessage(m.chat, { text: "❌ Menciona o responde al mensaje de alguien para esclavizarlo." }, { quoted: m });
    }

    const target = m.quoted ? m.quoted.sender : (args[0].replace(/[@+ ]/g, "") + "@s.whatsapp.net");

    if (target === user) {
      return sock.sendMessage(m.chat, { text: "😂 No puedes esclavizarte a ti mismo crack." }, { quoted: m });
    }

    const data = addSlave(user, target);

    await sock.sendMessage(m.chat, {
      text: `⚔️ @${m.sender.split("@")[0]} ha esclavizado a @${target.split("@")[0]}.\n\n👥 Ahora tienes *${data.slaves.length} esclavos*.`,
      mentions: [user, target]
    }, { quoted: m });
  }
};