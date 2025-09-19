const { getDB } = require("../libs/db");

// Lista gigante de personajes (puedes seguir agregando más)
const personajes = [
  "Naruto Uzumaki 🍜", "Sasuke Uchiha 🔥", "Sakura Haruno 🌸", "Kakashi Hatake 📚", "Itachi Uchiha 🌑",
  "Hinata Hyuga 💜", "Shikamaru Nara 💤", "Gaara 🌪️", "Rock Lee 🥋", "Neji Hyuga 👁️",
  "Goku 🐉", "Vegeta 👑", "Bulma 🔧", "Piccolo 🟢", "Freezer ❄️", "Cell 🦠", "Majin Buu 🍭",
  "Tanjiro Kamado 🌊", "Nezuko Kamado 🎋", "Zenitsu Agatsuma ⚡", "Inosuke Hashibira 🐗", "Rengoku 🔥", "Muzan Kibutsuji 🦇",
  "Eren Yeager 🐺", "Mikasa Ackerman ⚔️", "Levi Ackerman ☄️", "Armin Arlert 📖", "Historia Reiss 👑", "Reiner Braun 🛡️",
  "Gojo Satoru 👓", "Megumi Fushiguro 🐺", "Nobara Kugisaki 🌹", "Sukuna 👹", "Yuta Okkotsu ⚡",
  "Yugi Muto 🎴", "Seto Kaiba 🐉", "Dark Magician 🧙‍♂️", "Blue Eyes White Dragon 🐲",
  "Light Yagami 📓", "L Lawliet 🍩", "Near 🧸", "Mello 🍫",
  "Edward Elric ⚙️", "Alphonse Elric 🐱", "Roy Mustang 🔥", "Riza Hawkeye 🎯",
  "Ichigo Kurosaki 🍓", "Rukia Kuchiki ❄️", "Orihime Inoue 🌼", "Uryu Ishida 🎯", "Aizen Sosuke 🕶️",
  "Saitama 👊", "Genos 🔥", "Tatsumaki 🌪️", "Fubuki ❄️",
  "Killua Zoldyck ⚡", "Gon Freecss 🐟", "Hisoka Morow 🎪", "Kurapika 🔗", "Chrollo Lucilfer 🕷️",
  "Rem 💙", "Ram 💖", "Emilia ❄️", "Subaru Natsuki 🌀",
  "Ainz Ooal Gown ☠️", "Shalltear Bloodfallen 🦇", "Albedo 🖤",
  "Aqua 💧", "Megumin 💥", "Darkness ⚔️",
  "Natsu Dragneel 🔥", "Lucy Heartfilia ✨", "Erza Scarlet 🛡️", "Gray Fullbuster ❄️", "Happy 🐱",
  "Luffy ☠️", "Zoro ⚔️", "Nami 🗺️", "Usopp 🎯", "Sanji 👨‍🍳", "Chopper 🐾", "Robin 📚", "Franky 🤖", "Brook 🎸", "Jinbe 🦈"
];

module.exports = {
  name: "rw",
  alias: [".rw"],
  async run(m, { sock }) {
    const personaje = personajes[Math.floor(Math.random() * personajes.length)];

    const gachaDB = getDB("gacha");
    const data = gachaDB.load();
    data.last = { character: personaje, by: m.sender };
    gachaDB.save(data);

    await sock.sendMessage(m.chat, {
      text: `🎲 *Tirada Gacha en Gatoland ⚔️*\n\n✨ Personaje obtenido: *${personaje}*\n\n👉 Usa *.c/claim* para reclamarlo.`
    }, { quoted: m });
  }
};