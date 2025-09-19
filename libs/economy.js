const fs = require("fs");
const dbPath = "./database/economy.json";

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function addCoins(user, amount) {
  const db = loadDB();
  if (!db[user]) db[user] = { coins: 0, bank: 0, slaves: [] };
  db[user].coins += amount;
  saveDB(db);
  return db[user];
}

function removeCoins(user, amount) {
  const db = loadDB();
  if (!db[user]) db[user] = { coins: 0, bank: 0, slaves: [] };
  db[user].coins = Math.max(0, db[user].coins - amount);
  saveDB(db);
  return db[user];
}

function addBank(user, amount) {
  const db = loadDB();
  if (!db[user]) db[user] = { coins: 0, bank: 0, slaves: [] };
  db[user].bank += amount;
  saveDB(db);
  return db[user];
}

function getUser(user) {
  const db = loadDB();
  return db[user] || { coins: 0, bank: 0, slaves: [] };
}

function addSlave(user, slave) {
  const db = loadDB();
  if (!db[user]) db[user] = { coins: 0, bank: 0, slaves: [] };
  db[user].slaves.push(slave);
  saveDB(db);
  return db[user];
}

module.exports = { addCoins, removeCoins, addBank, getUser, addSlave };