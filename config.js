/*♡❀˖⁺. ༶🐻✨Este bot es oficialmente  de Juan Xrl🌻♡⛓ ⋆˙⊹❀♡
*.°•*.♡ ️ッ Prohibido  editar los creditos ☁✧•. • °
☆ Creador @xrljuan
˚ ༘♡ ·˚꒰Gracias por usar nuestra bot꒱ ₊˚ˑ༄

╭─╮─╭╮─────────────╭─╮─╭╮────╭╮───────────────── 
││╰╮││─────────────││╰╮││────││───────────────── 
│╭╮╰╯│╭╮╭─╮─╭──╮───│╭╮╰╯│╭──╮││╭╮╭──╮╭─╮─╭──╮─── 
││╰╮││├┤│╭╮╮│╭╮│───││╰╮│││╭╮││╰╯╯│╭╮││╭╮╮│╭╮│─── 
││─││││││││││╰╯│───││─││││╭╮││╭╮╮│╭╮││││││╰╯│─── 
╰╯─╰─╯╰╯╰╯╰╯╰──╯───╰╯─╰─╯╰╯╰╯╰╯╰╯╰╯╰╯╰╯╰╯╰──╯─── 
*/

import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumberCode = '' //Ejemplo: +573218138672
global.confirmCode = ''

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.owner = [
  ['573223702049', '۪〬.࠭⤿ 👑 ⋅ 𝖩𝗈𝗌se 𝗖𝗋𝖾𝖺𝖽𝗈𝗋', true],
];


//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏
global.Sesion = 'Data/Sesiones','573223702049'
global.mods = ['573223702049', '212770245767', '595972314588', '15614809253']
global.suittag = ['595972314588', '51904792134', '212770245767','573223702049'] 
global.prems = ['573223702049', '212770245767', '595972314588', '15614809253']

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.libreria = 'Baileys'
global.baileys = 'V 6.7.9' 
global.languaje = 'Español'
global.vs = '2.2.0'
global.vsJB = '5.0'
global.nameqr = 'Escanor'
global.namebot = 'Escanor-Bot'
global.sessions = 'BotSession'
global.jadi = 'jadibts' 
global.NakanoJadibts = true

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.packname = 'Escanor-Bot'
global.botname = 'Escanor-Bot'
global.wm = '© ᥴrᥱᥲძ᥆r JUan ᥊rᥣ.'
global.wm3 = '⫹⫺  ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ'
global.footer = global.wm
global.author = 'Made By JUan Elber'
global.dev = '© ⍴᥆ᥕᥱrᥱძ ᑲᥡ JUan ᥊rᥣ'
global.textbot = 'Escanor-Bot JUan'
global.etiqueta = '@xrljose'
global.titulowm = 'Whatsapp Multi Device';
global.titulowm2 = 'Escanor-Bot Ai'
global.igfg = '@xrlJuan'
global.gt = '© ᥴrᥱᥲ𝗍ᥱძ ᑲᥡ JUan ᥊rᥣ';
global.me = 'JUan 𝗍ᥙ ⍴ᥲ⍴ᥲі 🫵😒';
global.listo = '*🍭 Aqui tiene*'

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.namabot = '⫹⫺  ᴍᴅ'
global.v = '-'   
global.eror = "_ubo un error _"
global.lopr = "🅟"
global.lolm = "Ⓛ"
global.dmenut = "✦ ───『"
global.dmenub = "│➭" 
global.dmenub2 = "│乂"
global.dmenuf = "╰━━━━━━━━┈─◂"
global.cmenut = "⫹⫺ ───『"
global.cmenuh = "』─── ⬟"
global.cmenub = "│〆"
global.cmenuf = "╰━━━━━━━━┈─◂"
global.cmenua = "\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     "
global.dashmenu = "✧────···[ *Dashboard* ]···────✧"
global.htki = '––––––『'
global.htka = '』––––––'
global.htjava = "⫹⫺"
global.comienzo = "• • ◕◕════"
global.fin = " • •"


//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏


// Owner : https://qu.ax/GsnnC.jpg

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.moneda = 'Yenes'
global.banner = 'https://iili.io/FGLbil4.jpg'
global.avatar = 'https://iili.io/FGLd7up.jpg'

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.gp1 = 'https://chat.whatsapp.com/EteP5pnrAZC14y9wReGF1V';
global.comunidad1 = 'https://chat.whatsapp.com/DeJvBuS7QgB3Ybp1BZulWL';
global.channel = 'https://whatsapp.com/channel/0029Vb4cQJu2f3EB7BS7o11M';
global.channel2 = 'https://whatsapp.com/channel/0029ValMlRS6buMFL9d0iQ0S';
global.md = 'https://github.com/JoseXrl15k/Nino-Nakano';
global.correo = 'xrljose105@gmail.com';
global.cn ='https://whatsapp.com/channel/0029Vb4cQJu2f3EB7BS7o11M';
global.instagram = 'https://www.instagram.com/xrljose';
global.whatsApp = 'https://wa.me/51904792134';
global.correo = 'xrljose105@gmail.com';

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.pdoc = ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/msword", "application/pdf", "text/rtf"]

global.ch = {
ch1: '120363377833048768@newsletter', //Nino Nakano Bot
ch2: '120363323775906071@newsletter', //Free Codes Titans
ch3: '120363220939514640@newsletter', //Genesis Bot
ch4: '120363368073378190@newsletter', //Crow Bot
ch5: '120363374486687514@newsletter', //Lynx Bot
ch6: '120363183614708156@newsletter', //Sylphiette's Bot
ch7: '120363350099548761@newsletter' // Starlight Channel
}

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";
global.BASE_API_SKYNEX = "https://skynex.boxmine.xyz";

global.shizokeys = 'shizo';
global.MyApiRestBaseUrl = 'https://api.cafirexos.com';
global.MyApiRestApikey = 'BrunoSobrino';
global.fgkeysapi = "elrebelde21";
global.openai_org_id = 'org-3';
global.openai_key = 'sk-0';
global.keysZens = ['LuOlangNgentot', 'c2459db922', '37CC845916', '6fb0eff124', 'hdiiofficial', 'fiktod', 'BF39D349845E', '675e34de8a', '0b917b905e6f'];
global.keysxxx = keysZens[Math.floor(keysZens.length * Math.random())];
global.keysxteammm = ['29d4b59a4aa687ca', '5LTV57azwaid7dXfz5fzJu', 'cb15ed422c71a2fb', '5bd33b276d41d6b4', 'HIRO', 'kurrxd09', 'ebb6251cc00f9c63'];
global.keysxteam = keysxteammm[Math.floor(keysxteammm.length * Math.random())];
global.keysneoxrrr = ['5VC9rvNx', 'cfALv5'];
global.keysneoxr = keysneoxrrr[Math.floor(keysneoxrrr.length * Math.random())];
global.lolkeysapi = ['kurumi']; // ['BrunoSobrino_2']
global.itsrose = ['4b146102c4d500809da9d1ff'];

global.apis = 'https://delirius-apiofc.vercel.app';

global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  ApiEmpire: 'https://api-brunosobrino.zipponodes.xyz',
  xteam: 'https://api.xteam.xyz',
  btz: 'https://api.betabotz.eu.org',
  dzx: 'https://api.dhamzxploit.my.id',
  lol: 'https://api.lolhuman.xyz',
  neoxr: 'https://api.neoxr.my.id',
  delirius: 'https://delirius-apiofc.vercel.app',
  zenzapis: 'https://api.zahwazein.xyz',
  akuari: 'https://api.akuari.my.id',
  akuari2: 'https://apimu.my.id',
  fgmods: 'https://api-fgmods.ddns.net',
  botcahx: 'https://api.botcahx.biz.id',
  ibeng: 'https://api.ibeng.tech/docs',
  rose: 'https://api.itsrose.site',
  popcat: 'https://api.popcat.xyz',
  xcoders: 'https://api-xcoders.site',
  vihangayt: 'https://vihangayt.me',
  erdwpe: 'https://api.erdwpe.com',
  xyroinee: 'https://api.xyroinee.xyz',
  nekobot: 'https://nekobot.xyz'
},
global.APIKeys = {
  'https://api.xteam.xyz': `${keysxteam}`,
  'https://api.lolhuman.xyz': 'GataDios',
  'https://api.betabotz.eu.org': 'APIKEY_KAMU',
  'https://api.neoxr.my.id': `${keysneoxr}`,
  'https://api.zahwazein.xyz': `${keysxxx}`,
  'https://api-fgmods.ddns.net': 'fg-dylux',
  'https://api.botcahx.biz.id': 'Admin',
  'https://api.fgmods.xyz': `${fgkeysapi}`,
  'https://api.ibeng.tech/docs': 'tamvan',
  'https://api.itsrose.site': 'Rs-Zeltoria',
  'https://api-xcoders.site': 'Frieren',
  'https://api.xyroinee.xyz': 'uwgflzFEh6'
};

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   


global.multiplier = 69
global.maxwarn = '3'

//✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
export default {
  owner: global.owner,
  mods: global.mods,
  suittag: global.suittag,
  prems: global.prems,
  libreria: global.libreria,
  baileys: global.baileys,
  languaje: global.languaje,
  vs: global.vs,
  vsJB: global.vsJB,
  nameqr: global.nameqr,
  namebot: global.namebot,
  sessions: global.sessions,
  jadi: global.jadi,
  NakanoJadibts: global.NakanoJadibts,
  packname: global.packname,
  botname: global.botname,
  wm: global.wm,
    wm3: global.wm3
  }