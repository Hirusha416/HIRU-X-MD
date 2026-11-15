const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/【entity-baileys¦canonical_name=Baileys】');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const config = require('./config');
const { menuText, mediaMenu, movieMenu, generalMenu, settingsMenu, groupMenu, newsMenu, downloadMenu, adminMenu, apiMenu } = require('./menus');
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: state, browser: ['HIRU X MD', 'Chrome', '1.0.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') console.log('✅ HIRU X MD Connected!');
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]; if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg });
    const [cmdRaw, ...rest] = body.trim().split(/\s+/);
    const cmd = cmdRaw.toLowerCase(); const query = rest.join(' ');
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const h = Math.floor(process.uptime()/3600), m = Math.floor((process.uptime()%3600)/60);
    if (cmd === '.menu' || cmd === 'menu') {
      const header = `*╭──• [ ⚡ ${config.BOT_NAME} ]*\n*│◊│* \`Hello 🎭\` : @${from.split('@')[0]}\n*│◊│* 🦉 SWEET DREAMS\n*│◊╰────────────┉•┉*\n*╰──────────────────┉*\n\n*╭──• [ 🖥️ 𝐒𝐘𝐒𝐓𝐄𝐌 ]*\n*│◊│* 🤖 \`ʙᴏᴛ\` : ${config.BOT_NAME}\n*│◊│* 👑 \`ᴏᴡɴᴇʀ\` : ${config.OWNER_NAME}\n*│◊│* 💾 \`ʀᴀᴍ\` : ${ram} MB\n*│◊│* ⏱️ \`ᴜᴘᴛɪᴍᴇ\` : 0D ${h}H ${m}M\n*│◊╰────────────┉•┉*\n*╰──────────────────┉*\n`;
      return await reply(header + menuText + `\n${config.FOOTER}`);
    }
    if (cmd === '1' || cmd === '.media') return await reply(mediaMenu);
    if (cmd === '2' || cmd === '.movie') return await reply(movieMenu);
    if (cmd === '3' || cmd === '.general') return await reply(generalMenu);
    if (cmd === '4' || cmd === '.settings') return await reply(settingsMenu);
    if (cmd === '5' || cmd === '.group') return await reply(groupMenu);
    if (cmd === '6' || cmd === '.news') return await reply(newsMenu);
    if (cmd === '7' || cmd === '.download') return await reply(downloadMenu);
    if (cmd === '8' || cmd === '.admin') return await reply(adminMenu);
    if (cmd === '9' || cmd === '.api') return await reply(apiMenu);
    if (cmd === '.ping') return await reply('⚡ *Pong!* HIRU X MD is alive\n💾 RAM: ' + ram + ' MB');
    if (cmd === '.owner') return await reply(`👑 Owner: ${config.OWNER_NAME}\n📞 Number: +${config.OWNER_NUMBER}\n🤖 Bot: ${config.BOT_NAME}`);
    if (cmd === '.alive') return await reply(`🤖 *${config.BOT_NAME} ALIVE*\n👑 Owner: ${config.OWNER_NAME}`);
    if (cmd === '.song' || cmd === '.play') {
      if(!query) return await reply('🎵 Ex: .song Hanthanata Payana Sanda');
      await reply(`🎵 Searching: ${query}\n⏳ Tikak inna...`);
      try {
        const { downloadSong } = require('./lib/song');
        const { file, video } = await downloadSong(query);
        await sock.sendMessage(from, { audio: fs.readFileSync(file), mimetype:'audio/mpeg', fileName: video.title + '.mp3' }, { quoted: msg });
        await reply(`✅ *${video.title}*\n⏱️ ${video.timestamp}\n🔗 ${video.url}`);
        fs.unlinkSync(file);
      } catch(e){ await reply('❌ Song download ba: '+e.message); }
      return;
    }
    if (cmd === '.movie' || cmd === '.film') {
      if(!query) return await reply('🎬 Ex: .movie Avatar 2');
      await reply(`🎬 Searching Movie: ${query}...`);
      try {
        const { searchMovie } = require('./lib/movie');
        const mv = await searchMovie(query);
        let txt = `🎬 *${mv.Title}* (${mv.Year})\n\n⭐ IMDB: ${mv.imdbRating || 'N/A'}\n🎭 Genre: ${mv.Genre || '-'}\n👤 Director: ${mv.Director || '-'}\n👥 Actors: ${mv.Actors || '-'}\n\n📖 Plot:\n${mv.Plot}\n\n> HIRU X MD`;
        if(mv.Poster && mv.Poster!=='N/A') await sock.sendMessage(from, { image:{url:mv.Poster}, caption: txt }, { quoted: msg });
        else await reply(txt);
      } catch(e){ await reply('❌ Movie hoyaganna ba'); }
      return;
    }
    if (cmd === '.sinhala') {
      if(!query) return await reply('Ex: .sinhala Ranjith');
      try { const { searchSinhalaMovie } = require('./lib/movie'); const list = await searchSinhalaMovie(query); let t='🇱🇰 *Sinhala Movies:*\n\n'; list.forEach((v,i)=> t+=`${i+1}. ${v.title}\n🔗 ${v.url}\n\n`); await reply(t); } catch(e){ await reply('❌ Error'); }
      return;
    }
    if (cmd === '.trailer') {
      if(!query) return await reply('Ex: .trailer Avatar');
      try { const yts = require('yt-search'); const r = await yts(query+' movie trailer'); const v=r.videos[0]; await reply(`🎥 *${v.title}*\n🔗 ${v.url}`); } catch(e){ await reply('❌ Error'); }
      return;
    }
  });
}
startBot();
