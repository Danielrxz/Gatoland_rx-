const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "sticker",
  alias: [".s", ".sticker"],
  async run(m, { sock }) {
    try {
      // Verifica si hay mensaje con imagen o video
      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || "";

      if (!mime || (!mime.includes("image") && !mime.includes("video"))) {
        return sock.sendMessage(m.chat, {
          text: "❌ Debes responder a una *imagen* o *video corto* (máx. 10s) con el comando *.s*"
        }, { quoted: m });
      }

      // Descargar el archivo multimedia
      const media = await quoted.download();

      // Crear sticker con metadatos
      const sticker = new Sticker(media, {
        pack: "Bot Gatoland 🚀",   // Nombre del pack
        author: "Danielrxz",       // Autor
        type: StickerTypes.FULL,   // Sticker completo
        quality: 80,               // Calidad del sticker
      });

      // Enviar el sticker generado
      await sock.sendMessage(m.chat, await sticker.toMessage(), { quoted: m });

    } catch (e) {
      console.error("Error en .s:", e);
      await sock.sendMessage(m.chat, {
        text: "⚠️ Hubo un error al crear el sticker. Intenta de nuevo."
      }, { quoted: m });
    }
  }
};