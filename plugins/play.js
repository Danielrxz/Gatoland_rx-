// plugins/play.js
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  commands: [
    {
      name: "play",
      aliases: ["ytplay", "song"],
      run: async ({ msg, conn, args, from }) => {
        if (!args.length) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.play <nombre de la canción>*" });
        }

        try {
          const query = args.join(" ");
          const search = await yts(query);

          if (!search.videos || search.videos.length === 0) {
            return await conn.sendMessage(from, { text: "❌ No se encontraron resultados." });
          }

          const video = search.videos[0]; // el más relevante
          const ytUrl = video.url;
          const info = await ytdl.getInfo(ytUrl);

          const details = info.videoDetails;
          const title = details.title;
          const channel = details.author.name;
          const views = details.viewCount;
          const duration = details.lengthSeconds;
          const description = details.description ? details.description.substring(0, 150) + "..." : "Sin descripción";

          const caption = `
🎶 *${title}*
👤 Canal: ${channel}
⏳ Duración: ${Math.floor(duration / 60)}:${duration % 60}
👁️‍🗨️ Visitas: ${views}
📝 Descripción: ${description}

⚔️ Descargas Gatoland ⚔️
          `.trim();

          // Enviar con botones (audio y video)
          await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption,
            buttons: [
              { buttonId: `.ytmp3 ${ytUrl}`, buttonText: { displayText: "🎵 Descargar MP3" }, type: 1 },
              { buttonId: `.ytmp4 ${ytUrl}`, buttonText: { displayText: "🎥 Descargar MP4" }, type: 1 }
            ],
            headerType: 4
          });

        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error buscando o procesando el video." });
        }
      }
    }
  ]
};