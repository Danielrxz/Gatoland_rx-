// plugins/ytmp4.js
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
  commands: [
    {
      name: "ytmp4",
      aliases: ["mp4", "ytmp4dl"],
      run: async ({ msg, conn, args, from }) => {
        if (!args[0]) {
          return await conn.sendMessage(from, { text: "❌ Uso correcto: *.ytmp4 <link de YouTube>*" });
        }

        try {
          const url = args[0];
          if (!ytdl.validateURL(url)) {
            return await conn.sendMessage(from, { text: "❌ URL inválida de YouTube." });
          }

          const info = await ytdl.getInfo(url);
          const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
          const filePath = path.join(__dirname, `${title}.mp4`);

          await conn.sendMessage(from, { text: `🎥 Descargando video de: *${info.videoDetails.title}*` });

          const stream = ytdl(url, { quality: "highest" })
            .pipe(fs.createWriteStream(filePath));

          stream.on("finish", async () => {
            await conn.sendMessage(from, {
              video: { url: filePath },
              caption: `🎬 ${info.videoDetails.title}`
            });
            fs.unlinkSync(filePath); // eliminar archivo temporal
          });
        } catch (e) {
          console.error(e);
          await conn.sendMessage(from, { text: "❌ Error descargando el video." });
        }
      }
    }
  ]
};