const 【entity-express¦canonical_name=express】 = require('【entity-express¦canonical_name=express】');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const app = 【entity-express¦canonical_name=express】();
app.use(【entity-express¦canonical_name=express】.json());
app.use(【entity-express¦canonical_name=express】.static(path.join(__dirname, 'public')));
app.get('/', (req,res) => res.sendFile(path.join(__dirname, 'public', 'pair.html')));
app.get('/health', (req,res) => res.json({ status:'online', bot: config.BOT_NAME }));
app.post('/api/pair', async (req,res) => {
  let { number } = req.body;
  number = String(number).replace(/[^0-9]/g,'');
  if(!number.startsWith('94') || number.length!==11) return res.json({ success:false, message:'94715988504 widiyata danna' });
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, browser:['HIRU X MD','Chrome','1.0.0'] });
    sock.ev.on('creds.update', saveCreds);
    if(sock.authState.creds.registered) return res.json({ success:false, message:'Already Paired!' });
    await new Promise(r=>setTimeout(r,1500));
    const code = await sock.requestPairingCode(number);
    res.json({ success:true, code, number });
  } catch(e) { res.json({ success:false, message: e.message }); }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🌐 Pair Site: http://localhost:${PORT}`));
