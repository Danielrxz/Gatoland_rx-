// ./plugins/economia.js
const fs = require('fs');
const DB = './plugins/db.json';
function load() { try { return JSON.parse(fs.readFileSync(DB)); } catch (e) { return { users: {} }; } }
function save(d){ fs.writeFileSync(DB, JSON.stringify(d, null, 2)); }
module.exports = {
  commands: [
    {
      name: 'economia',
      aliases: ['eco'],
      run: async ({ msg, conn, from, pushName }) => {
        const db = load();
        const u = db.users[from] || { money: 0, bank: 0, chars: [] };
        await conn.sendMessage(from, { text: `Economía de ${pushName}:\nDinero: ${u.money}\nBanco: ${u.bank}\nPersonajes: ${u.chars.length}` });
      }
    },
    {
      name: 'work',
      aliases: ['trabajar'],
      run: async ({ msg, conn, from, pushName }) => {
        const d = load(); d.users[from] = d.users[from] || { money:0, bank:0, chars:[] };
        const earned = Math.floor(Math.random()*100)+10;
        d.users[from].money += earned; save(d);
        await conn.sendMessage(from, { text: `${pushName} trabajó y ganó ${earned} monedas.` });
      }
    },
    {
      name: 'daily',
      aliases: ['diario'],
      run: async ({ msg, conn, from, pushName }) => {
        const d = load(); d.users[from] = d.users[from] || { money:0, bank:0, chars:[], lastDaily:0 };
        const now = Date.now();
        if (d.users[from].lastDaily && now - d.users[from].lastDaily < 24*3600*1000) return conn.sendMessage(from, { text: 'Ya reclamaste tu daily hoy.' });
        const reward = 200;
        d.users[from].money += reward; d.users[from].lastDaily = now; save(d);
        await conn.sendMessage(from, { text: `Daily reclamado: ${reward} monedas.` });
      }
    },
    {
      name: 'baltop',
      aliases: ['balancetop'],
      run: async ({ msg, conn, from }) => {
        const d = load(); const arr = Object.entries(d.users).map(([k,v])=>({k, money:v.money||0})).sort((a,b)=>b.money-a.money).slice(0,10);
        let txt = 'Baltop:\n' + arr.map((x,i)=>`${i+1}. ${x.k} — ${x.money}`).join('\n');
        await conn.sendMessage(from, { text: txt });
      }
    },
    {
      name: 'banco',
      aliases: ['bank'],
      run: async ({ msg, conn, from, args }) => {
        const d = load(); d.users[from] = d.users[from] || { money:0, bank:0, chars:[] };
        const sub = args[0];
        if (!sub) return conn.sendMessage(from, { text: `Banco: dinero ${d.users[from].money}, en banco ${d.users[from].bank}. Usa .banco depositar/retirar <cantidad>` });
        if (sub === 'depositar') {
          const n = parseInt(args[1]||'0'); if (!n || n<=0) return conn.sendMessage(from, { text: 'Cantidad inválida' });
          if (d.users[from].money < n) return conn.sendMessage(from, { text: 'No tienes suficiente dinero' });
          d.users[from].money -= n; d.users[from].bank += n; save(d);
          return conn.sendMessage(from, { text: `Depositaste ${n} monedas.` });
        }
        if (sub === 'retirar') {
          const n = parseInt(args[1]||'0'); if (!n || n<=0) return conn.sendMessage(from, { text: 'Cantidad inválida' });
          if (d.users[from].bank < n) return conn.sendMessage(from, { text: 'No hay suficiente en banco' });
          d.users[from].bank -= n; d.users[from].money += n; save(d);
          return conn.sendMessage(from, { text: `Retiraste ${n} monedas.` });
        }
        await conn.sendMessage(from, { text: 'Subcomando de banco no reconocido.' });
      }
    }
  ]
};
