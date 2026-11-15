const axios = require('axios');
const yts = require('yt-search');
const OMDB_KEY = process.env.OMDB_KEY || 'trilogy';
async function searchMovie(name) {
  try {
    const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(name)}&apikey=${OMDB_KEY}`);
    if(res.data && res.data.Response==='True') return res.data;
  } catch(e){}
  const r = await yts(name + ' movie trailer');
  return { Title: name, Year:'-', Plot:'Trailer eka balanna', Poster: r.videos[0]?.thumbnail, Trailer: r.videos[0]?.url };
}
async function searchSinhalaMovie(name) {
  const r = await yts(name + ' sinhala movie full');
  return r.videos.slice(0,5).map(v=>({ title:v.title, url:v.url, duration:v.timestamp, views:v.views }));
}
module.exports = { searchMovie, searchSinhalaMovie };
