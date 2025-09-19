const ytdl = require("ytdl-core");
const axios = require("axios");

async function youtubeDownload(url, type = "audio") {
  if (!ytdl.validateURL(url)) throw new Error("❌ URL de YouTube inválida.");

  const info = await ytdl.getInfo(url);
  const format = type === "audio"
    ? ytdl.filterFormats(info.formats, "audioonly")[0]
    : ytdl.filterFormats(info.formats, "videoandaudio")[0];

  return {
    title: info.videoDetails.title,
    url: format.url,
    duration: info.videoDetails.lengthSeconds,
    views: info.videoDetails.viewCount,
    channel: info.videoDetails.author.name,
    description: info.videoDetails.description
  };
}

async function fetchFile(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return res.data;
}

module.exports = { youtubeDownload, fetchFile };