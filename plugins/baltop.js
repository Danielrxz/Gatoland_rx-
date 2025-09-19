const { getDB } = require("../libs/db");

module.exports = {
  name: "baltop",
  alias: [".baltop", ".top"],
  async run(m, { sock }) {
    const ecoDB = getDB("economy");
    const data = ecoDB.load();

    if (!Object.keys(data).length) {
      return sock.sendMessage(m.chat, { text: "📉 No hay datos en la economía aún." }, { quoted: m });
    }

    // Ordenar por monedas (coins + banco si quieres)
    const ranking = Object.entries(data)
      .map(([user, stats]) => ({
        user,
        coins: stats.coins || 0,
        bank: stats.bank || 0,
        total: (stats.coins || 0) + (stats.bank || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    let msg = "🏆 *TOP 10 RICOS DE GATOLAND ⚔️*\n\n";
    ranking.forEach((u, i) => {
      msg += `${i + 1}. @${u.user.split("@")[0]}\n   💰 Monedas: ${u.coins}\n   🏦 Banco: ${u.bank}\n   📊 Total: ${u.total}\n\n`;
    });

    await sock.sendMessage(m.chat, {
      text: msg,
      mentions: ranking.map(u => u.user)
    }, { quoted: m });
  }
};