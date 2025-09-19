module.exports = {
  name: "menu",
  alias: [".menu", ".help", ".ayuda"],
  async run(m, { sock }) {
    const menuText = `
🌌 *GATOLAND-MD* 🚀⚔️
🤖 Author: Danielrxz

📜 *Menú de Comandos*

─────────────────────
🎮 *GACHA*
• .rw → Tirar personaje
• .c/claim → Reclamar personaje
• .venderpersonaje → Vender personaje

─────────────────────
💰 *ECONOMÍA*
• .work → Trabajar
• .daily → Recompensa diaria
• .banco → Ver tu banco
• .baltop → Top de monedas
• .cazar → Cazar
• .minar → Minar
• .talar → Talar
• .exclavisar → Esclavizar
• .misexclavos → Ver esclavos

─────────────────────
🎶 *MEDIA*
• .play → Buscar música
• .ytmp3 → Descargar audio
• .ytmp4 → Descargar video
• .fb → Descargar Facebook
• .ig → Descargar Instagram
• .pin → Buscar Pinterest
• .apk → Buscar APK

─────────────────────
🛠️ *TOOLS*
• .s → Sticker
• .toimg → Sticker a imagen
• .tourl → Archivo a enlace
• .whatmusic → Detectar canción
• .chatgpt → ChatGPT

─────────────────────
👥 *ADMIN*
• .kick → Expulsar
• .invocar → Mencionar a todos
• .cerrargrupo → Cerrar grupo
• .abrirgrupo → Abrir grupo
• .tag → Etiquetar
• .owner / .creador → Dueño

─────────────────────
🤖 *SUBBOTS*
• .code → Generar código
─────────────────────

🚀 *Gatoland-MD listo para la acción!*
    `;

    await sock.sendMessage(m.chat, {
      image: { url: "https://cdn.russellxz.click/e16ef9dd.jpeg" },
      caption: menuText,
      footer: "⚔️ Gatoland-MD",
      buttons: [
        { buttonId: ".code", buttonText: { displayText: "🤖 Ser Subbot" }, type: 1 },
        { buttonId: ".play despacito", buttonText: { displayText: "🎶 Probar Música" }, type: 1 },
        { buttonId: ".owner", buttonText: { displayText: "👑 Dueño" }, type: 1 },
      ],
      headerType: 4,
    }, { quoted: m });
  }
};