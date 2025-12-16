import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

// Import modular utilities
import { 
  initializeUserData, 
  initializeChatData, 
  initializeSettingsData,
  ensureDatabaseStructure 
} from './lib/database.js'
import { 
  normalizeJid, 
  cleanJid, 
  isRootOwner, 
  isOwner as checkIsOwner, 
  isModerator, 
  isPremium,
  getBotJids 
} from './lib/roles.js'
import { getAdminStatus } from './lib/admin-utils.js'
import { handleToxicMessage } from './lib/antitoxic.js'
import { 
  isNumber, 
  delay, 
  pickRandom, 
  maskSensitiveData,
  createLogger 
} from './lib/utils.js'
import {
  isCommandMatch,
  validatePluginPermissions,
  buildPluginExtra
} from './lib/plugin-utils.js'

const { proto, areJidsSameUser } = (await import('@whiskeysockets/baileys')).default
const logger = createLogger('HANDLER')

/**
 * Main message handler for the WhatsApp bot
 * Processes incoming messages, manages user/chat data, checks permissions,
 * handles plugins, and executes commands
 * 
 * @param {Object} chatUpdate - Chat update object from Baileys
 * @returns {Promise<void>}
 */
export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
// Aseguramos que exista una propiedad lid coherente (para comparaciones normalizadas)
if (this.user && !this.user.lid) this.user.lid = this.user.id
if (!chatUpdate)
return
    if (typeof this.pushMessage === 'function') {
      this.pushMessage(chatUpdate.messages).catch(console.error)
    } else {
      // Fallback: if pushMessage not available (legacy socket), avoid crashing
      // You may consider upgrading to makeSylphySocket() for full feature set.
    }
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m)
return

if (m.isGroup && global.conns && global.conns.length > 1) {
    let botsEnGrupo = global.conns.filter(c => c.user && c.user.jid && c.ws && c.ws.socket && c.ws.socket.readyState !== 3)
    let elegido = botsEnGrupo[Math.floor(Math.random() * botsEnGrupo.length)]
    if (this.user.jid !== elegido.user.jid) return
}

// Ensure database is loaded
if (global.db.data == null) {
  await global.loadDatabase()
}

// Ensure database structure exists
ensureDatabaseStructure(global.db)

try {
  m = smsg(this, m) || m
  if (!m) return
  
  m.exp = 0
  m.coin = false
  
  try {
    // Initialize user data using modular function
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') {
      global.db.data.users[m.sender] = {}
      user = global.db.data.users[m.sender]
    }
    global.db.data.users[m.sender] = initializeUserData(user, m.name)
    
    // Initialize chat data using modular function
    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') {
      global.db.data.chats[m.chat] = {}
      chat = global.db.data.chats[m.chat]
    }
    global.db.data.chats[m.chat] = initializeChatData(chat)
    
    // Initialize settings data using modular function
    var settings = global.db.data.settings[this.user.jid]
    if (typeof settings !== 'object') {
      global.db.data.settings[this.user.jid] = {}
      settings = global.db.data.settings[this.user.jid]
    }
    global.db.data.settings[this.user.jid] = initializeSettingsData(settings)
  } catch (e) {
    logger.error('Error inicializando datos de usuario/chat:', e)
  }
const mainBot = global.conn.user.jid
const chat = global.db.data.chats[m.chat] || {}
const isSubbs = chat.antiLag === true
const allowedBots = chat.per || []
if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
const isAllowed = allowedBots.includes(this.user.jid)
if (isSubbs && !isAllowed) 
return

if (opts['nyimak'])  return
if (!m.fromMe && opts['self'])  return
if (opts['swonly'] && m.chat !== 'status@broadcast')  return
if (typeof m.text !== 'string')
m.text = ''

let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

// Get group metadata and participants
const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat, { force: true }).catch(_ => null) : {}
const participants = (m.isGroup ? groupMetadata.participants : []) || []

// Get admin status using modular function
const adminStatus = getAdminStatus({
  m,
  participants,
  thisConn: this,
  globalConn: global.conn,
  areJidsSameUser
})

const { isAdmin, isBotAdmin, isRAdmin, participantUser, botParticipant } = adminStatus

// Set admin flags on message object
m.isAdmin = isAdmin
m.isSuperAdmin = isRAdmin
m.isBotAdmin = isBotAdmin
m.adminRole = isRAdmin ? 'superadmin' : (isAdmin ? 'admin' : null)

// Variables for compatibility with plugins
let user = participantUser || {}
let bot = botParticipant || {}

// Get role-based permissions
const senderNum = normalizeJid(this.decodeJid ? this.decodeJid(m.sender) : m.sender)
const isROwner = isRootOwner(m.sender, conn, global)
const isOwner = checkIsOwner(isROwner, m.fromMe)
const isMods = isModerator(m.sender, isOwner, global)
const isPrems = isPremium(m.sender, isROwner, _user, global)

// Message queue management for non-premium/mod users
// Prevents spam by enforcing a queue delay between messages
if (opts['queque'] && m.text && !(isMods || isPrems)) {
let queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

// Ignore Baileys internal messages
if (m.isBaileys) {
return
}

// Add random experience points to user
m.exp += Math.ceil(Math.random() * 10)

let usedPrefix

// Handle anti-toxic messages if enabled for this group
if (m.isGroup && global.db.data.chats[m.chat]?.antitoxic) {
  await handleToxicMessage({
    m,
    conn: this,
    db: global.db,
    rcanal: typeof rcanal !== 'undefined' ? rcanal : null
  })
}

// Plugin directory path
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

// Main plugin loop - iterate through all loaded plugins
for (let name in global.plugins) {
let plugin = global.plugins[name]

// Skip if plugin doesn't exist or is disabled
if (!plugin) continue
if (plugin.disabled) continue

const __filename = join(___dirname, name)

// Execute plugin.all function if exists (runs for all messages)
if (typeof plugin.all === 'function') {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename
})
} catch (e) {
logger.error(`Error en plugin.all (${name}):`, e)
}}

// Skip admin plugins if restrictions are disabled
if (!opts['restrict']) {
if (plugin.tags && plugin.tags.includes('admin')) {
continue
}
}

// Helper function to escape regex special characters
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

// Determine the prefix to use for this plugin
let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix

// Match command prefix against message text
let match = (_prefix instanceof RegExp ? 
[[_prefix.exec(m.text), _prefix]] :
Array.isArray(_prefix) ?
_prefix.map(p => {
let re = p instanceof RegExp ?
p :
new RegExp(str2Regex(p))
return [re.exec(m.text), re]
}) :
typeof _prefix === 'string' ?
[[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
[[[], new RegExp]]
).find(p => p[1])
if (typeof plugin.before === 'function') {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}))
continue
}
if (typeof plugin !== 'function')
continue
if ((usedPrefix = (match[0] || '')[0])) {
let noPrefix = m.text.replace(usedPrefix, '')
let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
args = args || []
let _args = noPrefix.trim().split` `.slice(1)
let text = _args.join` `
command = (command || '').toLowerCase()
let fail = plugin.fail || global.dfail

// Use optimized command matching
let isAccept = isCommandMatch(command, plugin.command)

// Ignore Baileys internal messages
if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return

if (!isAccept) {
continue
}
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['grupo-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return
if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return 
if (user.antispam > 2) return
if (m.text && user.banned && !isROwner) {
m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
user.antispam++
return
}

if (user.antispam2 && isROwner) return
let time = global.db.data.users[m.sender].spam + 3000
if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`) 
global.db.data.users[m.sender].spam = new Date * 1

if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
let setting = global.db.data.settings[this.user.jid]
if (name != 'grupo-unbanchat.js' && chat?.isBanned)
return 
if (name != 'owner-unbanuser.js' && user?.banned)
return
}}

// Handle plugin warnings
if (plugin?.warn && !isOwner && !isROwner) {
  let warns = global.db.data.users[m.sender].warns || 0
  warns++
  global.db.data.users[m.sender].warns = warns
  await this.reply(m.chat, `⚠️ Advertencia ${warns}/3.`, m, typeof rcanal !== 'undefined' ? rcanal : undefined)

  if (warns >= 3) {
    global.db.data.users[m.sender].warns = 0
    try {
      await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      await this.reply(m.chat, `🪴 Has sido expulsado por acumulación de advertencias.`, m, typeof rcanal !== 'undefined' ? rcanal : undefined)
    } catch (err) {
      await this.reply(m.chat, `⚠️ No se pudo expulsar al usuario. Revisa permisos del bot.`, m, typeof rcanal !== 'undefined' ? rcanal : undefined)
    }
    return
  }
}

// Check admin mode
let adminMode = global.db.data.chats[m.chat].modoadmin
let mini = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || _prefix ||  m.text.slice(0, 1) == _prefix || plugin.command}`
if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return   

// Validate plugin permissions using optimized function
const permissionCheck = validatePluginPermissions(plugin, {
  isROwner,
  isOwner,
  isMods,
  isPrems,
  isAdmin,
  m,
  _user,
  isGroup: m.isGroup
})

if (!permissionCheck.valid) {
  fail(permissionCheck.failType, m, this)
  continue
}

m.isCommand = true
let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
if (xp > 200)
m.reply('chirrido -_-')
else
m.exp += xp
if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
conn.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
continue
}
if (plugin.level > _user.level) {
conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)       
continue
}
// Build extra object for plugin using optimized function
let extra = buildPluginExtra({
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
})

try {
await plugin.call(this, m, extra)
if (!isPrems)
m.coin = m.coin || plugin.coin || false
} catch (e) {
m.error = e
logger.error('Error ejecutando plugin:', e)
if (e) {
let text = format(e)
// Mask sensitive data in error messages
text = maskSensitiveData(text, global.APIKeys || {})
m.reply(text)
}
} finally {
if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra)
} catch (e) {
logger.error('Error ejecutando plugin.after:', e)
}}
if (m.coin)
conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
}
break
}}
} catch (e) {
console.error(e)
} finally {
if (opts['queque'] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
}
let user, stats = global.db.data.stats
if (m) { let utente = global.db.data.users[m.sender]
if (utente.muto == true) {
let bang = m.key.id
let cancellazzione = m.key.participant
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione }})
}
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
user.coin -= m.coin * 1
}

let stat
if (m.plugin) {
let now = +new Date
if (m.plugin in stats) {
stat = stats[m.plugin]
if (!isNumber(stat.total))
stat.total = 1
if (!isNumber(stat.success))
stat.success = m.error != null ? 0 : 1
if (!isNumber(stat.last))
stat.last = now
if (!isNumber(stat.lastSuccess))
stat.lastSuccess = m.error != null ? 0 : now
} else
stat = stats[m.plugin] = {
total: 1,
success: m.error != null ? 0 : 1,
last: now,
lastSuccess: m.error != null ? 0 : now
}
stat.total += 1
stat.last = now
if (m.error == null) {
stat.success += 1
stat.lastSuccess = now
}}}

try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) { 
console.log(m, m.quoted, e)}
let settingsREAD = global.db.data.settings[this.user.jid] || {}  
if (opts['autoread']) await this.readMessages([m.key])

if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
}
}}

/**
 * Handle delete message events (anti-delete feature)
 * @param {Object} message - Delete message event
 */
export async function deleteUpdate(message) {
  try {
    const { fromMe, id, participant, remoteJid: chat } = message

    // Ignore messages from bot itself
    if (fromMe) return

    let chatData = global.db.data.chats[chat] || {}
    
    // Check if anti-delete is enabled for this chat
    if (!chatData.delete) return

    let msg = this.messages?.get(chat)?.get(id)

    if (!msg) return
    if (!msg?.message) return
    
    // Only work in groups
    if (!msg.key?.remoteJid.endsWith('@g.us')) return

    const antideleteMessage = `╭•┈•〘✘ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ✘〙•┈• ◊
│❍ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢:
│• @${participant.split`@`[0]}
│
│❒ 𝗔𝗰𝗮𝗯𝗮 𝗱𝗲 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗿 𝘂𝗻 𝗺𝗲𝗻𝘀𝗮𝗷𝗲
│𝗿𝗲𝗲𝗻𝘃𝗶𝗮𝗻𝗱𝗼... ⧖˚₊· ͟͟͞͞➳❥
╰•┈•〘✘ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ✘〙•┈• ◊`.trim()

    await this.sendMessage(chat, {
      text: antideleteMessage,
      mentions: [participant]
    }, { quoted: msg })

    await this.copyNForward(chat, msg)

  } catch (e) {
    logger.error('Error en antidelete:', e)
  }
}

/**
 * Default fail handler for permission checks
 * Sends appropriate error message based on fail type
 * 
 * @param {string} type - Type of permission failure
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 */
global.dfail = (type, m, conn) => {
  const msg = {
    rowner: '*`🍉 sᴏʟᴏ ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴘᴏʀ ᴇʟ ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ ᴅᴇʟ ʙᴏᴛ`*',
    owner: '*`🍉 sᴏʟᴏ ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴘᴏʀ ᴇʟ ᴘʀᴏᴘɪᴇᴛᴀʀɪᴏ ᴅᴇʟ ʙᴏᴛ`*',
    mods: '*`🍉 sᴏʟᴏ ᴍᴏᴅᴇʀᴀᴅᴏʀᴇs • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴘᴏʀ ᴍᴏᴅᴇʀᴀᴅᴏʀᴇs ᴅᴇʟ ʙᴏᴛ`*',
    premium: '*`🍉 sᴏʟᴏ ᴜsᴜᴀʀɪᴏs ᴘʀᴇᴍɪᴜᴍ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴘᴏʀ ᴜsᴜᴀʀɪᴏs ᴘʀᴇᴍɪᴜᴍ`*',
    group: '*`🍉 ᴄʜᴀᴛ ᴅᴇ ɢʀᴜᴘᴏ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴇɴ ɢʀᴜᴘᴏs`*',
    private: '*`🍉 ᴄʜᴀᴛ ᴘʀɪᴠᴀᴅᴏ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴇɴ ᴄʜᴀᴛs ᴘʀɪᴠᴀᴅᴏs`*',
    admin: '*`🍉 sᴏʟᴏ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴘᴏʀ ᴀᴅᴍɪɴs ᴅᴇʟ ɢʀᴜᴘᴏ`*',
    botAdmin: '*`🍉 sᴏʟᴏ ᴄᴜᴀɴᴅᴏ ᴇʟ ʙᴏᴛ ᴇs ᴀᴅᴍɪɴ • ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ᴘᴜᴇᴅᴇ sᴇʀ ᴜsᴀᴅᴏ ᴄᴜᴀɴᴅᴏ ᴇʟ ʙᴏᴛ ᴇs ᴀᴅᴍɪɴ`*',
    unreg: '*`🍉 ɴᴏ ᴇsᴛᴀ́s ʀᴇɢɪsᴛʀᴀᴅᴏ/ᴀ • ᴇsᴄʀɪʙᴇ .ʀᴇɢ ᴘᴀʀᴀ ᴘᴏᴅᴇʀ ᴜsᴀʀ ᴇsᴛᴀ ғᴜɴᴄɪᴏ́ɴ`*', 
    restrict: '*`🍉 ʀᴇsᴛʀɪɴɢɪᴅᴏ • ʟᴀs ʀᴇsᴛʀɪᴄᴄɪᴏɴᴇs ɴᴏ ᴇsᴛᴀ́ɴ ᴀᴄᴛɪᴠᴀᴅᴀs ᴇɴ ᴇsᴛᴇ ᴄʜᴀᴛ`*'
  }[type]
  
  if (msg) {
    return conn.reply(m.chat, msg, m, typeof rcanal !== 'undefined' ? rcanal : undefined)
      .then(_ => m.react('✖️'))
      .catch(e => logger.error('Error enviando mensaje de fallo:', e))
  }
}
let file = global.__filename(import.meta.url, true)

// NO TOCAR
watchFile(file, async () => {
unwatchFile(file);
console.log(chalk.green('Actualizando "handler.js"'));
// if (global.reloadHandler) console.log(await global.reloadHandler());

if (global.conns && global.conns.length > 0 ) {
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
for (const userr of users) {
userr.subreloadHandler(false)
}}});