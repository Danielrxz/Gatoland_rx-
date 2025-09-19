const { writeFileSync } = require("fs");
const path = require("path");

module.exports = {
  name: "toimg",
  alias: [".toimg"],
  async run(m, { sock }) {
    try {
      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || "";

      // Verificar si el mensaje es un sticker
      if (!/webp/.test(mime)) {
        return sock.sendMessage(m.chat, {
          text: "❌ Responde a un *sticker* con el comando *.toimg*"
        }, { quoted: m });
      }

      // Descargar el sticker
      const media = await quoted.download();
      const filePath = path.join(__dirname, `../temp/${Date.now()}.jpg`);
      writeFileSync(filePath, media);

      // Enviar como imagen
      await sock.sendMessage(m.chat, {
        image: { url: filePath },
        caption: "✅ Aquí tienes tu sticker convertido en imagen JPG."
      }, { quoted: m });

    } catch (e) {
      console.error("Error en .toimg:", e);
      await sock.sendMessage(m.chat, {
        text: "⚠️ Hubo un error al convertir el sticker. Intenta de nuevo."
      }, { quoted: m });
    }
  }
};