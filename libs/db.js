const fs = require("fs");
const path = require("path");

function loadJSON(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getDB(name) {
  const dir = "./database";
  ensureDir(dir);
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return { file, load: () => loadJSON(file), save: (data) => saveJSON(file, data) };
}

module.exports = { loadJSON, saveJSON, ensureDir, getDB };