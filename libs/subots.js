const { getDB } = require("./db");

function linkSubbot(jid, code) {
  const subDB = getDB("subbots");
  const data = subDB.load();

  if (!data.codes) data.codes = [];
  if (!data.active) data.active = [];

  // Verificar el código
  const found = data.codes.find(c => c.code === code);
  if (!found) return { success: false, message: "❌ Código inválido o ya usado." };

  // Vincular subbot
  data.active.push({ jid, linkedTo: found.owner, at: Date.now() });

  // Eliminar el código usado
  data.codes = data.codes.filter(c => c.code !== code);

  subDB.save(data);
  return { success: true, message: "✅ Subbot vinculado con éxito." };
}

function isOfficialHere(jid) {
  const subDB = getDB("subbots");
  const data = subDB.load();
  return data.official === jid;
}

function setOfficial(jid) {
  const subDB = getDB("subbots");
  const data = subDB.load();
  data.official = jid;
  subDB.save(data);
}

module.exports = { linkSubbot, isOfficialHere, setOfficial };