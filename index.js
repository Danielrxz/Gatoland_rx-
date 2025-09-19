/**
 * Gatoland-MD - index.js (MONOLITH)
 * Todo-en-uno: conexión, handlers y comandos principales.
 *
 * Recomendado: npm install @adiwajshing/baileys qrcode-terminal ytdl-core yt-search axios form-data fs-extra chalk pino wa-sticker-formatter ffmpeg-static fluent-ffmpeg
 *
 * Crea carpetas: temp/  database/
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const axios = require('axios');
const FormData = require('form-data');
const chalk = require('chalk');

const TEMP_DIR = path.join(__dirname, 'temp');
const DB_DIR = path.join(__dirname, 'database');
fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(DB_DIR);

// Simple DB helpers
function dbFile(name){ return path.join(DB_DIR, `${name}.json`); }
function load(name){ try { const p = dbFile(name); if(!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify({})) } return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e){ return {}; } }
function save(name, data){ fs.writeFileSync(dbFile(name), JSON.stringify(data, null, 2)); }

// Format helpers
function formatDuration(seconds){ const m = Math.floor(seconds/60); const s = seconds%60; return `${m}:${String(s).padStart(2,'0')}`; }
function short(text, n=200){ return text && text.length>n ? text.slice(0,n)+'...' : text || ''; }

// subbots db init
const subDBName = 'subbots';
if(!fs.existsSync(dbFile(subDBName))) save(subDBName, { codes: [], active: [], official: null });

// Gacha characters (long list)
const CHARACTERS = [
  "Naruto Uzumaki 🍜","Sasuke Uchiha 🔥","Sakura Haruno 🌸","Kakashi Hatake 📚","Itachi Uchiha 🌑",
  "Hinata Hyuga 💜","Shikamaru Nara 💤","Gaara 🌪️","Rock Lee 🥋","Neji Hyuga 👁️",
  "Goku 🐉","Vegeta 👑","Bulma 🔧","Piccolo 🟢","Freezer ❄️","Cell 🦠","Majin Buu 🍭",
  "Tanjiro Kamado 🌊","Nezuko Kamado 🎋","Zenitsu Agatsuma ⚡","Inosuke Hashibira 🐗","Rengoku 🔥",
  "Eren Yeager 🐺","Mikasa Ackerman ⚔️","Levi Ackerman ☄️","Armin Arlert 📖",
  "Gojo Satoru 👓","Megumi Fushiguro 🐺","Nobara Kugisaki 🌹","Sukuna 👹","Yuta Okkotsu ⚡",
  "Yugi Muto 🎴","Seto Kaiba 🐉","Light Yagami 📓","L Lawliet 🍩","Edward Elric ⚙️",
  "Alphonse Elric 🐱","Ichigo Kurosaki 🍓","Rukia Kuchiki ❄️","Saitama 👊","Genos 🔥",
  "Killua Zoldyck ⚡","Gon Freecss 🐟","Rem 💙","Emilia ❄️","Ainz Ooal Gown ☠️","Megumin 💥",
  "Natsu Dragneel 🔥","Lucy Heartfilia ✨","Erza Scarlet 🛡️","Luffy ☠️","Zoro ⚔️","Nami 🗺️",
  "Trafalgar Law ⚓","Sanji 👨‍🍳","Chopper 🐾","Robin 📚","Franky 🤖","Brook 🎸","Jinbe 🦈"
];

// API placeholders (put your keys/urls)
const APK_API_KEY = "";
const APK_API_URL = ""; // example: "https://api.example.com/apk"
const FB_API_KEY = "";
const FB_API_URL = "";
const IG_API_KEY = "";
const IG_API_URL = "";
const PIN_API_KEY = "";
const PIN_API_URL = "";

// ChatGPT env check
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

// Keep in-memory cooldowns
const cooldowns = { work: {}, daily: {}, action5m: {} };

// Helper: send text
async function sendText(sock, jid, text, quoted){
  try { return await sock.sendMessage(jid, { text }, { quoted }); }
  catch(e){ console.error('sendText error', e); }
}

// Helper: upload to telegra.ph
async function uploadToTelegraph(buffer, filename){
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://telegra.ph/upload', form, { headers: form.getHeaders(), maxContentLength: 50_000_000 });
    if(res.status === 200 && res.data && res.data[0] && res.data[0].src) return 'https://telegra.ph' + res.data[0].src;
    throw new Error('No src in response');
  } catch(e){ throw e; }
}

// Helper: download quoted media
async function downloadQuotedMedia(msg){
  try {
    // msg is the Baileys message object
    const message = msg.message || {};
    // find which media type
    const types = ['imageMessage','videoMessage','stickerMessage','documentMessage','audioMessage'];
    for(const t of types){
      if(message[t]){
        const stream = await msg.download(); // in some bailey versions, msg.download exists on proto; if not, use sock.downloadMediaMessage (not available here). We'll call msg.download() which many wrappers support.
        return { buffer: stream, mime: message[t].mimetype || '' };
      }
    }
    return null;
  } catch (e) {
    // fallback: try to use messageContext...
    return null;
  }
}

// MAIN: startup
async function start(){
  console.clear();
  console.log(chalk.cyan(`
██████╗  █████╗ ████████╗ ██████╗ ██╗      █████╗ ███╗   ██╗██████╗ 
██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██║     ██╔══██╗████╗  ██║██╔══██╗
██████╔╝███████║   ██║   ██║   ██║██║     ███████║██╔██╗ ██║██║  ██║
██╔═══╝ ██╔══██║   ██║   ██║   ██║██║     ██╔══██║██║╚██╗██║██║  ██║
██║     ██║  ██║   ██║   ╚██████╔╝███████╗██║  ██║██║ ╚████║██████╔╝
╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝
                  ⚔️ GATOLAND-MD 🚀
`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const choice = await new Promise(res => rl.question('vamos aya 🚀: ingresa 1 para qr y 2 para code: ', a => res(a.trim())));
  // auth state
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname,'auth_info_multi'));
  const { version } = await fetchLatestBaileysVersion().catch(()=>({ version: [3,6,1] }));

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // we'll control QR manually
    auth: state,
    browser: ['Chrome','Ubuntu','1.0.0'],
    version
  });

  // log and send QR if asked
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if(qr && choice === '1'){
      console.log(chalk.yellow('QR generado — escanéalo con WhatsApp:'));
      qrcode.generate(qr, { small: true });
    }
    if(connection === 'open') console.log(chalk.green('✅ Conectado a WhatsApp'));
    if(connection === 'close'){
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error || 'unknown';
      console.log(chalk.red('Conexión cerrada:'), reason);
      if(reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('Se cerró sesión. Borra auth_info_multi y vuelve a escanear.'));
      }
    }
  });

  // send code flow if choose 2
  if(choice === '2'){
    const phone = await new Promise(res => rl.question('📱 Ingresa tu número (ej: 521XXXXXXXXXX): ', a => res(a.trim())));
    // Wait for socket open before sending code (we'll listen for open)
    sock.ev.on('connection.update', async (u) => {
      if(u.connection === 'open'){
        try{
          const creds = state.creds || {};
          const code = Buffer.from(JSON.stringify(creds)).toString('base64');
          const jid = phone.includes('@')? phone : `${phone}@s.whatsapp.net`;
          await sock.sendMessage(jid, { text: `🔑 CODE de Gatoland-MD:\n\n\`\`\`${code}\`\`\`\n\nPégalo en otra instancia del bot en la opción 2 para vincular.` });
          console.log(chalk.green(`✅ CODE enviado a ${phone}`));
        }catch(e){ console.error('Error enviando CODE:', e); }
      }
    });
  }

  // save creds
  sock.ev.on('creds.update', saveCreds);

  // helper: log outgoing messages (wrap sendMessage)
  const origSend = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options = {}) => {
    try {
      // small preview
      const preview = (() => {
        try { return JSON.stringify(content).slice(0,500); } catch(e){ return String(content).slice(0,200); }
      })();
      console.log(chalk.magenta(`[BOT] -> ${jid}: ${preview}`));
    } catch(e){}
    return origSend(jid, content, options);
  };

  // mark official bot jid on open
  sock.ev.on('connection.update', (u) => {
    if(u.connection === 'open'){
      // set official in subbots db as this jid (best-effort: find own jid)
      // we can fetch own id via sock.user.id but depending on baileys version
      if(sock.user && sock.user.id) {
        const db = load(subDBName);
        db.official = sock.user.id;
        save(subDBName, db);
      }
    }
  });

  // message listener
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const messages = m.messages || [];
      for(const message of messages){
        if(!message.message) continue;
        const from = message.key.remoteJid;
        const pushName = message.pushName || (message.key.participant || '').split('@')[0] || 'unknown';
        const isFromMe = message.key.fromMe === true;
        // extract text
        let text = '';
        if(message.message.conversation) text = message.message.conversation;
        else if(message.message.extendedTextMessage?.text) text = message.message.extendedTextMessage.text;
        else if(message.message.imageMessage?.caption) text = message.message.imageMessage.caption;
        else if(message.message.videoMessage?.caption) text = message.message.videoMessage.caption;

        if(!isFromMe) console.log(chalk.green(`[USUARIO] ${pushName} (${from}): ${short(text,300)}`));
        else console.log(chalk.gray(`[YO] (${from}): ${short(text,300)}`));

        // Command processing
        if(!isFromMe && text && text.startsWith('.')){
          const parts = text.slice(1).trim().split(/\s+/);
          const cmd = parts.shift().toLowerCase();
          const args = parts;
          await handleCommand({ sock, message, from, pushName, cmd, args, text });
        }
      }
    } catch(e){
      console.error('messages.upsert error', e);
    }
  });

  // group participants update -> prevent subbot spam if official present
  sock.ev.on('group-participants.update', async (gp) => {
    try {
      const id = gp.id;
      const participants = gp.participants || [];
      const action = gp.action || gp.announce || gp.participantsAction;
      const db = load(subDBName);
      const official = db.official;
      // if a subbot is added and official exists in group, remove it
      for(const p of participants){
        const isSub = (db.active||[]).some(s => s.jid === p);
        if(isSub && official){
          // check if official in group - naive approach: ask group metadata? skip detailed check for brevity
          // We'll warn and try to remove the subbot
          try {
            await sock.sendMessage(id, { text: `🤖 Este grupo ya contiene el bot oficial. El subbot ${p.split('@')[0]} se retirará para evitar spam.` });
            await sock.groupParticipantsUpdate(id, [p], 'remove');
          } catch(e){}
        }
      }
    } catch(e){ console.error('group update err', e); }
  });

  console.log(chalk.gray('✔️ Index cargado. Esperando comandos...'));
}

// ---------- Commands handler (many commands inside same file) ----------
async function handleCommand({ sock, message, from, pushName, cmd, args, text }){
  try {
    // quick mapping
    switch(cmd){
      case 'menu':
      case 'help':
      case 'ayuda':
        return await cmd_menu({ sock, message, from });
      case 'owner':
      case 'creador':
        return await cmd_owner({ sock, message, from });
      case 'code':
        return await cmd_code({ sock, message, from });
      case 'qr':
        return await sendText(sock, from, 'El QR se muestra en la consola del servidor cuando inicias con opción 1.');
      case 'play':
        return await cmd_play({ sock, message, from, args });
      case 'ytmp3':
        return await cmd_ytmp3({ sock, message, from, args });
      case 'ytmp4':
        return await cmd_ytmp4({ sock, message, from, args });
      case 'apk':
        return await cmd_apk({ sock, message, from, args });
      case 'fb':
        return await cmd_fb({ sock, message, from, args });
      case 'ig':
        return await cmd_ig({ sock, message, from, args });
      case 'pin':
      case 'pinterest':
        return await cmd_pin({ sock, message, from, args });
      case 'work':
        return await cmd_work({ sock, message, from });
      case 'daily':
        return await cmd_daily({ sock, message, from });
      case 'baltop':
      case 'balancetop':
        return await cmd_baltop({ sock, message, from });
      case 'banco':
      case 'bank':
        return await cmd_banco({ sock, message, from, args });
      case 'cazar':
        return await cmd_cazar({ sock, message, from });
      case 'minar':
        return await cmd_minar({ sock, message, from });
      case 'talar':
        return await cmd_talar({ sock, message, from });
      case 'exclavisar':
        return await cmd_exclavisar({ sock, message, from, args });
      case 'misexclavos':
        return await cmd_misexclavos({ sock, message, from });
      case 'rw':
        return await cmd_rw({ sock, message, from });
      case 'c':
      case 'claim':
      case 'c/claim':
        return await cmd_claim({ sock, message, from });
      case 'mispersonajes':
      case 'mp':
        return await cmd_mispersonajes({ sock, message, from });
      case 'venderpersonaje':
      case 'vender':
        return await cmd_venderpersonaje({ sock, message, from, args });
      case 's':
      case 'sticker':
        return await cmd_s({ sock, message, from });
      case 'toimg':
        return await cmd_toimg({ sock, message, from });
      case 'tourl':
        return await cmd_tourl({ sock, message, from });
      case 'chatgpt':
        return await cmd_chatgpt({ sock, message, from, args });
      case 'kick':
        return await cmd_kick({ sock, message, from, args });
      case 'cerrargrupo':
        return await cmd_cerrargrupo({ sock, message, from });
      case 'abrirgrupo':
        return await cmd_abrirgrupo({ sock, message, from });
      case 'invocar':
        return await cmd_invocar({ sock, message, from });
      case 'tag':
        return await cmd_tag({ sock, message, from, args });
      default:
        return await sendText(sock, from, `Comando .${cmd} no reconocido. Usa .menu para ver comandos.`);
    }
  } catch(e){
    console.error('handleCommand error', e);
    try { await sendText(sock, from, '❌ Error interno ejecutando comando. Revisa consola.'); } catch(e){}
  }
}

/* ------------------ Implementation of commands ------------------ */

// .menu
async function cmd_menu({ sock, message, from }){
  const caption = `
🌌 *GATOLAND-MD* 🚀⚔️
🤖 Author: Danielrxz

📜 *Menú de Comandos* (usa .menu)
- Gacha: .rw .c/claim .mispersonajes .venderpersonaje
- Economía: .work .daily .banco .baltop .cazar .minar .talar .exclavisar .misexclavos
- Media: .play .ytmp3 .ytmp4 .fb .ig .pin .apk
- Tools: .s .toimg .tourl .whatmusic .chatgpt
- Admin: .kick .invocar .cerrargrupo .abrirgrupo .tag
- Subbots: .code (límite 30)
  `;
  // send image with buttons
  const imgUrl = 'https://cdn.russellxz.click/e16ef9dd.jpeg';
  try {
    await sock.sendMessage(from, {
      image: { url: imgUrl },
      caption,
      footer: '⚔️ Gatoland-MD',
      buttons: [
        { buttonId: '.code', buttonText: { displayText: '🤖 Ser Subbot' }, type: 1 },
        { buttonId: '.play despacito', buttonText: { displayText: '🎶 Probar Música' }, type: 1 },
        { buttonId: '.owner', buttonText: { displayText: '👑 Dueño' }, type: 1 }
      ],
      headerType: 4
    });
  } catch(e){
    console.error('menu send err', e);
    await sendText(sock, from, caption);
  }
}

// .owner / .creador
async function cmd_owner({ sock, message, from }){
  const number = '526242262017';
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Danielrxz
TEL;waid=${number}:+52 624 226 2017
END:VCARD`;
  try {
    await sock.sendMessage(from, { contacts: { displayName: 'Danielrxz - Creador', contacts: [{ vcard }] } }, { quoted: message });
    await sendText(sock, from, '👑 Creador: Danielrxz\n📱 +52 624 226 2017\n⚔️ Gatoland-MD');
  } catch(e){ console.error('owner err', e); }
}

// .code - generate code and store (max 30)
async function cmd_code({ sock, message, from }){
  const db = load(subDBName);
  db.codes = db.codes || [];
  db.active = db.active || [];
  if((db.active||[]).length >= 30) return await sendText(sock, from, '🚫 Límite de 30 subbots alcanzado.');
  // generate base64 code from current creds
  try {
    const credsPath = path.join(__dirname, 'auth_info_multi', 'creds.json');
    if(!fs.existsSync(credsPath)) return await sendText(sock, from, '⚠️ No hay credenciales disponibles para generar code (inicia sesión con QR primero).');
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    const code = Buffer.from(JSON.stringify(creds)).toString('base64');
    // store short code token for management (first 8 chars)
    const token = code.slice(0,16);
    db.codes.push({ token, created: Date.now(), owner: from });
    save(subDBName, db);
    await sendText(sock, from, `🔑 CODE generado (copia todo el bloque):\n\n${code}\n\n⚠️ Guárdalo en privado. Token: ${token}`);
  } catch(e){
    console.error('code gen err', e);
    await sendText(sock, from, '❌ Error generando CODE.');
  }
}

// .play
async function cmd_play({ sock, message, from, args }){
  if(!args.length) return await sendText(sock, from, 'Uso: .play <nombre de canción>');
  const q = args.join(' ');
  try {
    const r = await yts(q);
    const v = r.videos && r.videos[0];
    if(!v) return await sendText(sock, from, 'No encontré resultados.');
    const info = await ytdl.getInfo(v.url);
    const details = info.videoDetails;
    const caption = `🎶 *${details.title}*\n👤 ${details.author?.name || 'Unknown'}\n⏱ ${formatDuration(Number(details.lengthSeconds||0))}\n👁️ ${details.viewCount}\n\n${short(details.description,200)}\n\n⚔️ Descargas Gatoland ⚔️`;
    // send thumbnail + buttons for mp3/mp4
    await sock.sendMessage(from, {
      image: { url: v.thumbnail },
      caption,
      footer: 'Gatoland-MD',
      buttons: [
        { buttonId: `.ytmp3 ${v.url}`, buttonText: { displayText: '🎵 Descargar MP3' }, type: 1 },
        { buttonId: `.ytmp4 ${v.url}`, buttonText: { displayText: '🎥 Descargar MP4' }, type: 1 }
      ],
      headerType: 4
    });
  } catch(e){
    console.error('play err', e);
    await sendText(sock, from, '❌ Error buscando la canción.');
  }
}

// .ytmp3
async function cmd_ytmp3({ sock, message, from, args }){
  const url = args[0];
  if(!url) return await sendText(sock, from, 'Uso: .ytmp3 <url>');
  if(!ytdl.validateURL(url)) return await sendText(sock, from, 'URL de YouTube inválida.');
  const tmpFile = path.join(TEMP_DIR, `yt_${Date.now()}.mp3`);
  try {
    await sendText(sock, from, '🎧 Descargando audio, esto puede tardar...');
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    await new Promise((res,rej)=> {
      const out = fs.createWriteStream(tmpFile);
      stream.pipe(out);
      out.on('finish', res);
      out.on('error', rej);
    });
    await sock.sendMessage(from, { audio: fs.readFileSync(tmpFile), mimetype: 'audio/mpeg', fileName: 'song.mp3' });
  } catch(e){ console.error('ytmp3 err', e); await sendText(sock, from, '❌ Error al generar mp3 (revisa ffmpeg si usas conversión).'); }
  try{ if(fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); }catch(e){}
}

// .ytmp4
async function cmd_ytmp4({ sock, message, from, args }){
  const url = args[0];
  if(!url) return await sendText(sock, from, 'Uso: .ytmp4 <url>');
  if(!ytdl.validateURL(url)) return await sendText(sock, from, 'URL de YouTube inválida.');
  const tmpFile = path.join(TEMP_DIR, `yt_${Date.now()}.mp4`);
  try {
    await sendText(sock, from, '🎥 Descargando video...');
    const stream = ytdl(url, { quality: 'highestvideo' });
    await new Promise((res,rej)=> {
      const out = fs.createWriteStream(tmpFile);
      stream.pipe(out);
      out.on('finish', res);
      out.on('error', rej);
    });
    await sock.sendMessage(fr