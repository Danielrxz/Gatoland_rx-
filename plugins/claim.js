const { getDB } = require("../libs/db");

module.exports = {
  name: "claim",
  alias: [".c/claim"],
  async run(m, { sock }) {
    const user = m.sender;
    const gachaDB = getDB("gacha");
    const data = gachaDB.load();

    // Validar si hay personaje disponible para reclamar
    if (!data.last) {
      return sock.sendMessage(m.chat, {
        text: "❌ No hay ningún personaje disponible.\nUsa *.rw* primero para tirar un personaje."
      }, { quoted: m });
    }

    // Verificar que solo lo reclame el mismo que tiró
    if (data.last.by !== user) {
      return sock.sendMessage(m.chat, {
        text: "🚫 Solo el usuario que hizo la tirada puede reclamar este personaje."
      }, { quoted: m });
    }

    // Inicializar inventario si no existe
    if (!data.inventory) data.inventory = {};
    if (!data.inventory[user]) data.inventory[user] = [];

    // Agregar el personaje al inventario
    data.inventory[user].push(data.last.character);
    const claimed = data.last.character;

    // Limpiar el último personaje reclamado
    delete data.last;

    // Guardar cambios
    gachaDB.save(data);

    await sock.sendMessage(m.chat, {
      text: `✅ Reclamas a *${claimed}* y ahora está en tu inventario 🎴.\n\nUsa *.mispersonajes* para verlos.`
    }, { quoted: m });
  }
};