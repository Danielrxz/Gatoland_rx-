// plugins/fb.js
const axios = require('axios');

const API_KEY = ""; // 🔑 Pega aquí tu API key de tu servicio de descargas de Facebook
const API_URL = "https://tu-api-facebook.com/download"; // 🔗 Cambia esto por el endpoint real de tu API

module.exports = {
  commands: [
    {
      name: 'fb',
      aliases: ['facebook'],
      run: async ({ msg, conn, args, from }) => {
        if (!args[0]) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.fb <link del video>*" });
        }

        if (!API_KEY) {
          return await conn.sendMessage(from, { text: "⚠️ Debes configurar tu API_KEY en `fb.js` antes de usar este comando." });
        }

        try {
          const url = args[0];
          await conn.sendMessage(from, { text: `🔎 Descargando video de Facebook...\n${url}` });

          // Ejemplo de request (ajusta según tu API real)
          const res = await axios.get(`${API_URL}`, {
            params: { url, apikey: API_KEY }
          });

          if (!res.data || !res.data.video) {
            return await conn.sendMessage(from, { text: "❌ No se pudo obtener el video. Verifica el link o tu API." });
          }

          const videoUrl = res.data.video;
          await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: "🎥 Aquí está tu video de Facebook"
          });

        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error descargando el video. Revisa la API o inténtalo de nuevo." });
        }
      }
    }
  ]
};