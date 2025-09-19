const { getDB } = require("../libs/db");

module.exports = {
  name: "mispersonajes",
  alias: [".mispersonajes", ".mp"],
  async run(m, { sock }) {
    const user = m.sender;
    const gachaDB = getDB("gacha");
    const data = gachaDB.load();

    if (!data.inventory || !data.inventory[user] || data.inventory[user].length === 0) {
      return sock.sendMessage(m.chat, {
        text: "😢 No tienes personajes en tu inventario.\n\nUsa *.rw* para obtener uno y *.c/claim* para guardarlo."
      }, { quoted: m });
    }

    let personajes = data.inventory[user];
    let msg = `🎴 *INVENTARIO DE PERSONAJES DE GATOLAND ⚔️*\n\n👤 Usuario: @${user.split("@")[0]}\n📦 Total: *${personajes.length} personajes*\n\n`;

    personajes.forEach((p, i) => {
      msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🔢 Número: *${i + 1}*\n`;
      msg += `✨ Personaje: *${p}*\n`;
      msg += `💎 Rareza: ${["⭐ Común", "⭐⭐ Poco Común", "⭐⭐⭐ Raro", "⭐⭐⭐⭐ Épico", "⭐⭐⭐⭐⭐ Legendario"][Math.floor(Math.random() * 5)]}\n`;
      msg += `💰 Valor estimado: ${Math.floor(Math.random() * 800) + 200} monedas 🪙\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━