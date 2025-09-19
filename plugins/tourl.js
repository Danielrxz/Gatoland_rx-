const uploadImage = require("../libs/uploadImage");
const uploadVideo = require("../libs/uploadVideo");

module.exports = {
  name: "tourl",
  alias: [".tourl"],
  async run(m, { sock }) {
    try {
      // Detectar si es respuesta a un archivo multimedia
      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || "";

      if (!mime) {
        return sock.sendMessage(m.chat, {
          text: "❌ Responde a una *imagen* o *video* con el comando *.tourl*"
        }, { quoted: m });
      }

      const media = await quoted.download();
      let url;

      if (/image/.test(mime)) {
        url = await uploadImage(media);
      } else if (/video/.test(mime)) {
        url = await uploadVideo(media);
      } else {
        return sock.sendMessage(m.chat, { text: "⚠️ Solo se admite imagen o video." }, { quoted: m });
      }

      await sock.sendMessage(m.chat, {
        text: `✅ Archivo subido con éxito.\n\n🌐 Enlace: ${url}`
      }, { quoted: m });

    } catch (e) {
      console.error("Error en .tourl:", e);
      await sock.sendMessage(m.chat, {
        text: "⚠️ Hubo un error al subir el archivo. Intenta de nuevo."
      }, { quoted: m });
    }
  }
};