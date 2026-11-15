const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
async function startPair() {
  let number = "94715988504";
  console.log(`Pairing for: +${number}`);
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, browser: ['HIRU X MD','Chrome','1.0.0'] });
  sock.ev.on('creds.update', saveCreds);
  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(number);
    console.log(`🔥 PAIR CODE: ${code}`);
    console.log(`WhatsApp > Linked Devices > Link with Phone Number > ${code} ගහන්න`);
  } else {
    console.log('Already Paired!');
  }
  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'open') { console.log('✅ PAIRED!'); process.exit(0); }
  });
}
startPair();
