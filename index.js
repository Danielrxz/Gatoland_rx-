// index.js - Gatoland-MD (QR + CODE, Chrome Ubuntu, carga recursiva de plugins, logging completo)
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const readline = require('readline');
const chalk = require('chalk');

const AUTH_DIR = './auth_info_multi';
const PLUGINS_GLOB = path.join(__dirname, 'plugins', '**', '*.js');
const BANNER_NAME = 'Gatoland';

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => rl.question(question, a => { rl.close(); resolve(a.trim()); }));
  return answer;
}

async function loadPlugins() {
  const files = glob.sync(PLUGINS_GLOB);
  const commands = new Map();
  console.log(chalk.green(`🔎 Cargando plugins (${files.length})...`));
  for (const f of files) {
    try {
      delete require.cache[require.resolve(f)];
      const mod = require(f);
      if (mod && Array.isArray(mod.commands)) {
        for (const cmd of mod.commands) {
          const name = (cmd.name || '').toLowerCase();
          if (!name) continue;
          commands.set(name, cmd);
          if (Array.isArray(cmd.aliases)) {
            for (const a of cmd.aliases) commands.set(a.toLowerCase(), cmd);
          }
          console.log(chalk.blue(`  › ${name}  (archivo: ${path.relative(process.cwd(), f)})`));
        }
      } else {
        console.log(chalk.yellow(`  ⚠ El plugin ${path.relative(process.cwd(), f)} no exporta .commands (skipped)`));
      }
    } catch (e) {
      console.error(chalk.red(`  ✖ Error cargando plugin ${f}:`), e.message || e);
    }
  }
  console.log(chalk.green(`✅ Total comandos registrados: ${commands.size}`));
  return commands;
}

async function start() {
  console.log(chalk.cyan('🚀 Vamos allá: Inicia Gatoland-MD'));
  console.log('1) Ingresar con QR');
  console.log('2) Generar/Enviar CODE');

  const choice = await ask('👉 Elige una opción (1=QR, 2=CODE): ');

  // prepare auth state
  await fs.ensureDir(AUTH_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion().catch(()=>({ version: [3, 6, 1] }));

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    // Browser set to Chrome on Ubuntu as requested
    browser: ['Chrome','Ubuntu','1.0.0']
  });

  // save creds on update
  sock.ev.on('creds.update', saveCreds);

  // Intercept outgoing messages once to log everything bot sends
  const origSend = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, message, options = {}) => {
    try {
      // Friendly print of the outgoing content (trim)
      const outPreview = (() => {
        try { return JSON.stringify(message).slice(0, 800); } catch(e){ return String(message).slice(0,800); }
      })();
      console.log(chalk.magenta(`[BOT] -> ${jid}: ${outPreview}`));
    } catch (e) {}
    return origSend(jid, message, options);
  };

  // connection updates: show QR, handle close
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr && choice === '1') {
      console.log(chalk.yellow('📟 QR generado — escanéalo con WhatsApp Web/APP:'));
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log(chalk.green('✅ Conectado a WhatsApp!'));
      // try set profile name (best-effort)
      try {
        if (typeof sock.updateProfileName === 'function') await sock.updateProfileName(BANNER_NAME);
      } catch(e){}
    }
    if (connection === 'close') {
      const reason = (lastDisconnect && lastDisconnect.error) ? lastDisconnect.error.output?.statusCode || lastDisconnect.error : 'unknown';
      console.log(chalk.red('❌ Conexión cerrada:'), reason);
      if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode === DisconnectReason.loggedOut) {
        console.log(chalk.red('La sesión fue cerrada (logged out). Borra auth_info_multi y vuelve a iniciar con QR.'));
      } else {
        console.log(chalk.yellow('Intentando reconectar...'));
        // process.exit(1) para que supervisor (pm2/nodemon) lo reinicie o manualmente reinicies
        setTimeout(()=>process.exit(1), 1500);
      }
    }
  });

  // If user chose CODE: ask phone and send code to that number
  if (choice === '2') {
    const phone = await ask('📱 Ingresa tu número con código de país (ej: 521XXXXXXXXXX): ');
    try {
      // produce a base64 string of creds (state.creds)
      const creds = state.creds || {};
      const code = Buffer.from(JSON.stringify(creds)).toString('base64');
      // send message once connected; wait for open event then send
      sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
          try {
            await sock.sendMessage(`${phone}@s.whatsapp.net`, {
              text: `🔑 CODE de Gatoland-MD:\n\n\`\`\`${code}\`\`\`\n\n⚔️ Pégalo en otra instancia del bot en la opción 2 para vincular.`
            });
            console.log(chalk.green(`✅ CODE enviado a ${phone}`));
          } catch (e) {
            console.error(chalk.red('✖ No se pudo enviar el CODE por WhatsApp:'), e.message || e);
          }
        }
      });
    } catch (e) {
      console.error('Error generando CODE:', e);
    }
  }

  // If QR chosen: also ask phone so bot can notify on successful login
  if (choice === '1') {
    const phone = await ask('📱 Ingresa tu número para notificación tras escanear (opcional, deja vacío para omitir): ');
    if (phone) {
      sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
          try {
            await sock.sendMessage(`${phone}@s.whatsapp.net`, { text: '✅ Has iniciado sesión en Gatoland-MD vía QR. ¡Listo!' });
            console.log(chalk.green(`✅ Notificación enviada a ${phone}`));
          } catch (e) {
            console.error(chalk.red('✖ No se pudo notificar por WhatsApp:'), e.message || e);
          }
        }
      });
    }
  }

  // Load plugins
  const commands = await loadPlugins();

  // Message handling: single place for messages.upsert
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const messages = m.messages || [];
      for (const rawMsg of messages) {
        const msg = rawMsg;
        if (!msg.message) continue;

        const from = msg.key.remoteJid;
        const pushName = msg.pushName || msg.key.participant || 'unknown';
        const isBotMsg = msg.key.fromMe === true;

        // Extract text
        let text = '';
        if (msg.message.conversation) text = msg.message.conversation;
        else if (msg.message.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
        else if (msg.message.imageMessage?.caption) text = msg.message.imageMessage.caption;
        else if (msg.message.videoMessage?.caption) text = msg.message.videoMessage.caption;

        // Log incoming (user) or bot-sent (fromMe)
        if (!isBotMsg) {
          console.log(chalk.green(`[USUARIO] ${pushName} (${from}): ${text}`));
        } else {
          console.log(chalk.magenta(`[YO] (${from}): ${text}`));
        }

        // Process commands only for non-bot messages
        if (!isBotMsg && text && text.startsWith('.')) {
          const parts = text.slice(1).trim().split(/\s+/);
          const cmdName = parts.shift().toLowerCase();
          const args = parts;

          const handler = commands.get(cmdName);
          if (!handler) {
            // Optionally respond unknown
            await sock.sendMessage(from, { text: `Comando .${cmdName} no reconocido.` });
            continue;
          }

          // Execute handler: handlers expect signature { msg, conn, args, from, pushName }
          try {
            await handler.run({ msg, conn: sock, args, from, pushName });
          } catch (e) {
            console.error(chalk.red(`Error ejecutando .${cmdName}:`), e);
            await sock.sendMessage(from, { text: `Error ejecutando .${cmdName}: ${e.message || e}` });
          }
        }
      }
    } catch (e) {
      console.error('Error procesando messages.upsert:', e);
    }
  });

  // also log presence of other useful events for debugging
  sock.ev.on('presence.update', (p) => {
    // optional: console.log('presence', p)
  });

  console.log(chalk.gray('✔️ Index cargado. Esperando mensajes...'));
  return sock;
}

start().catch(err => {
  console.error('Fallo al iniciar el bot:', err);
  process.exit(1);
});