const { getDB } = require("../libs/db");
const crypto = require("crypto");

module.exports = {
  name: "code",
  alias: [".code"],
  async run(m, { sock }) {
    const subDB = getDB("subbots");
    const data = subDB.load();

    // Inicializar estructura
    if (!data.codes) data.codes = [];
    if (!data.active) data.active = [];

    // Revisar si ya hay 30 subbots activos
    if (data.active.length >= 30) {
      return sock.sendMessage(m.chat, {
        text: "🚫 Se alcanzó el límite de *30 subbots* vinculados."
      }, { quoted: m });
    }

    // Generar un código aleatorio único
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Guardar el código válido en DB
    data.codes.push({
      code,
      owner: m.sender,
      created: Date.now(),
    });
    subDB.save(data);

    await sock.sendMessage(m.chat, {
      text: `🔑 *Código de vinculación creado*\n\n👉 Usa este código para vincular un subbot:\n\n*${code}*\n\n⚠️ Solo válido una vez.\n📦 Subbots activos: ${data.active.length}/30`
    }, { quoted: m });
  }
};