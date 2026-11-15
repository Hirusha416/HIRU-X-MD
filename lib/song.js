const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
async function downloadSong(query) {
  const r = await yts(query + ' song');
  const video = r.videos[0];
  if(!video) throw new Error('Song eka hoyaganna ba');
  const dir = path.join(__dirname, '../temp');
  fs.mkdirSync(dir, {recursive:true});
  const file = path.join(dir, `${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    const stream = ytdl(video.url, { filter:'audioonly', quality:'highestaudio' });
    const ws = fs.createWriteStream(file);
    stream.pipe(ws);
    ws.on('finish', ()=> resolve({ file, video }));
    ws.on('error', reject);
    stream.on('error', reject);
  });
}
module.exports = { downloadSong };
