// plugins/ytmp3.js
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
  commands: [
    {
      name: "ytmp3",
      aliases: ["mp3", "ytmp3dl"],
      run: async ({ msg, conn, args, from }) => {
        if (!args[0]) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.ytmp3 <link de YouTube>*" });
        }

        try {
          const url = args[0];
          if (!ytdl.validateURL(url)) {
            return await conn.sendMessage(from, { text: "❌ URL inválida de YouTube." });
          }

          const info = await ytdl.getInfo(url);
          const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
          const filePath = path.join(__dirname, `${title}.mp3`);

          await conn.sendMessage(from, { text: `🎶 Descargando audio de: *${info.videoDetails.title}*` });

          const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(filePath));

          stream.on("finish", async () => {
            await conn.sendMessage(from, {
              audio: { url: filePath },
              mimetype: "audio/mpeg",
              fileName: `${title}.mp3`,
              ptt: false
            });
            fs.unlinkSync(filePath); // eliminar archivo temporal
          });
        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error descargando el audio." });
        }
      }
    }
  ]
};