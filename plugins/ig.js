// plugins/ig.js
const axios = require('axios');

const API_KEY = ""; // 🔑 Pega aquí tu API key de tu servicio de descargas de Instagram
const API_URL = "https://tu-api-instagram.com/download"; // 🔗 Cambia esto por el endpoint real de tu API

module.exports = {
  commands: [
    {
      name: 'ig',
      aliases: ['instagram'],
      run: async ({ msg, conn, args, from }) => {
        if (!args[0]) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.ig <link del post/reel>*" });
        }

        if (!API_KEY) {
          return await conn.sendMessage(from, { text: "⚠️ Debes configurar tu API_KEY en `ig.js` antes de usar este comando." });
        }

        try {
          const url = args[0];
          await conn.sendMessage(from, { text: `🔎 Descargando contenido de Instagram...\n${url}` });

          // Ejemplo de request (ajusta según tu API real)
          const res = await axios.get(`${API_URL}`, {
            params: { url, apikey: API_KEY }
          });

          if (!res.data || !res.data.media) {
            return await conn.sendMessage(from, { text: "❌ No se pudo obtener el contenido. Verifica el link o tu API." });
          }

          const media = res.data.media;

          // Si es video
          if (media.endsWith(".mp4")) {
            await conn.sendMessage(from, {
              video: { url: media },
              caption: "🎥 Aquí está tu video de Instagram"
            });
          } else {
            // Si es imagen
            await conn.sendMessage(from, {
              image: { url: media },
              caption: "🖼️ Aquí está tu imagen de Instagram"
            });
          }

        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error descargando de Instagram. Revisa la API o inténtalo de nuevo." });
        }
      }
    }
  ]
};