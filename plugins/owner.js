module.exports = {
  name: "owner",
  alias: [".owner", ".creador"],
  async run(m, { sock }) {
    const number = "526242262017"; // Tu número sin el "+"
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:;Danielrxz;;;
FN:Danielrxz
item1.TEL;waid=${number}:+52 624 226 2017
item1.X-ABLabel:📱 Dueño
END:VCARD`;

    await sock.sendMessage(m.chat, {
      contacts: {
        displayName: "Danielrxz - Creador",
        contacts: [{ vcard }]
      }
    }, { quoted: m });

    await sock.sendMessage(m.chat, {
      text: "👑 *Creador del Bot: Danielrxz*\n📱 Número: +52 624 226 2017\n⚔️ Bot: *Gatoland-MD* 🚀"
    }, { quoted: m });
  }
};