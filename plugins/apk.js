// plugins/apk.js
const axios = require('axios');

const API_KEY = ""; // 🔑 Pega aquí tu API key de tu servicio de APKs
const API_URL = "https://tu-api-apk.com/download"; // 🔗 Cambia esto por el endpoint real

module.exports = {
  commands: [
    {
      name: 'apk',
      aliases: [],
      run: async ({ msg, conn, args, from }) => {
        if (!args[0]) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.apk <nombre del paquete o app>*" });
        }

        if (!API_KEY) {
          return await conn.sendMessage(from, { text: "⚠️ Debes configurar tu API_KEY en `apk.js` antes de usar este comando." });
        }

        try {
          const query = args.join(" ");
          await conn.sendMessage(from, { text: `🔎 Buscando APK para *${query}*...` });

          // Ejemplo de request (ajusta a tu API real)
          const res = await axios.get(`${API_URL}`, {
            params: { q: query, apikey: API_KEY }
          });

          if (!res.data || !res.data.url) {
            return await conn.sendMessage(from, { text: "❌ No se encontró la APK." });
          }

          const apkUrl = res.data.url;
          await conn.sendMessage(from, {
            document: { url: apkUrl },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${query}.apk`
          });

        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error descargando la APK. Verifica tu API o intenta más tarde." });
        }
      }
    }
  ]
};