const { addBank, removeCoins, getUser, addCoins } = require("../libs/economy");

module.exports = {
  name: "banco",
  alias: [".banco"],
  async run(m, { sock, args }) {
    const user = m.sender;
    const data = getUser(user);

    if (!args[0]) {
      return sock.sendMessage(m.chat, {
        text: `🏦 *Banco de Gatoland ⚔️*\n\n` +
              `💰 Monedas: *${data.coins}*\n` +
              `🏦 Banco: *${data.bank}*\n\n` +
              `Usa:\n- *.banco depositar <cantidad>*\n- *.banco retirar <cantidad>*`
      }, { quoted: m });
    }

    const action = args[0].toLowerCase();
    const amount = parseInt(args[1]);

    if (["depositar", "dep"].includes(action)) {
      if (isNaN(amount) || amount <= 0) {
        return sock.sendMessage(m.chat, { text: "❌ Ingresa una cantidad válida para depositar." }, { quoted: m });
      }
      if (data.coins < amount) {
        return sock.sendMessage(m.chat, { text: "❌ No tienes suficientes monedas." }, { quoted: m });
      }

      removeCoins(user, amount);
      const updated = addBank(user, amount);

      return sock.sendMessage(m.chat, {
        text: `✅ Depositaste *${amount}* monedas.\n\n🏦 Banco: *${updated.bank}*\n💰 Monedas: *${updated.coins}*`
      }, { quoted: m });
    }

    if (["retirar", "ret"].includes(action)) {
      if (isNaN(amount) || amount <= 0) {
        return sock.sendMessage(m.chat, { text: "❌ Ingresa una cantidad válida para retirar." }, { quoted: m });
      }
      if (data.bank < amount) {
        return sock.sendMessage(m.chat, { text: "❌ No tienes suficientes monedas en el banco." }, { quoted: m });
      }

      const updatedBank = addBank(user, -amount);
      const updatedCoins = addCoins(user, amount);

      return sock.sendMessage(m.chat, {
        text: `✅ Retiraste *${amount}* monedas.\n\n🏦 Banco: *${updatedBank.bank}*\n💰 Monedas: *${updatedCoins.coins}*`
      }, { quoted: m });
    }

    return sock.sendMessage(m.chat, { text: "❌ Opción no válida.\nUsa *.banco depositar <cantidad>* o *.banco retirar <cantidad>*" }, { quoted: m });
  }
};