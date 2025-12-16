/**
 * Database utilities module
 * Handles user and chat initialization and default values
 */

const isNumber = x => typeof x === 'number' && !isNaN(x)

/**
 * Default user data structure
 */
export const defaultUserData = {
  exp: 0,
  coin: 10,
  joincount: 1,
  diamond: 3,
  lastadventure: 0,
  health: 100,
  lastclaim: 0,
  lastcofre: 0,
  lastdiamantes: 0,
  lastcode: 0,
  lastduel: 0,
  lastpago: 0,
  lastmining: 0,
  lastcodereg: 0,
  muto: false,
  registered: false,
  genre: '',
  birth: '',
  marry: '',
  description: '',
  packstickers: null,
  name: '',
  age: -1,
  regTime: -1,
  afk: -1,
  afkReason: '',
  banned: false,
  useDocument: false,
  bank: 0,
  level: 0,
  role: 'Nuv',
  premium: false,
  premiumTime: 0,
  warn: 0,
  warns: 0,
  crime: 0,
  spam: 0,
  antispam: 0,
  antispam2: false
}

/**
 * Default chat data structure
 */
export const defaultChatData = {
  sAutoresponder: '',
  welcome: true,
  isBanned: false,
  autolevelup: false,
  autoresponder: false,
  delete: false,
  autoAceptar: false,
  autoRechazar: false,
  detect: true,
  antiBot: false,
  antiBot2: false,
  modoadmin: false,
  antiLink: true,
  antifake: false,
  reaction: false,
  nsfw: false,
  expired: 0,
  antiLag: false,
  per: [],
  antiImg: false,
  autosticker: false,
  antitoxic: false
}

/**
 * Default settings data structure
 */
export const defaultSettingsData = {
  self: false,
  restrict: true,
  jadibotmd: true,
  antiPrivate: false,
  autoread: false,
  status: 0
}

/**
 * Initialize or update user data with default values
 * @param {Object} user - User object from database
 * @param {string} name - User name for new users
 * @returns {Object} Updated user object
 */
export function initializeUserData(user, name = '') {
  if (!user || typeof user !== 'object') {
    return { ...defaultUserData, name }
  }

  // Numeric fields
  const numericFields = [
    'exp', 'coin', 'joincount', 'diamond', 'lastadventure', 'lastclaim',
    'health', 'crime', 'lastcofre', 'lastdiamantes', 'lastpago', 'lastcode',
    'lastcodereg', 'lastduel', 'lastmining', 'afk', 'age', 'regTime',
    'level', 'bank', 'warn', 'warns', 'spam', 'antispam'
  ]

  numericFields.forEach(field => {
    if (!isNumber(user[field])) {
      user[field] = defaultUserData[field]
    }
  })

  // Boolean fields
  const booleanFields = [
    'muto', 'premium', 'registered', 'banned', 'useDocument', 'antispam2'
  ]

  booleanFields.forEach(field => {
    if (!(field in user)) {
      user[field] = defaultUserData[field]
    }
  })

  // String fields
  const stringFields = [
    'genre', 'birth', 'marry', 'description', 'afkReason', 'role'
  ]

  stringFields.forEach(field => {
    if (!(field in user)) {
      user[field] = defaultUserData[field]
    }
  })

  // Special fields
  if (!('packstickers' in user)) user.packstickers = null
  if (!user.premium) user.premiumTime = 0
  if (!user.registered && !('name' in user)) user.name = name

  return user
}

/**
 * Initialize or update chat data with default values
 * @param {Object} chat - Chat object from database
 * @returns {Object} Updated chat object
 */
export function initializeChatData(chat) {
  if (!chat || typeof chat !== 'object') {
    return { ...defaultChatData }
  }

  // Boolean fields
  const booleanFields = [
    'isBanned', 'welcome', 'autolevelup', 'autoAceptar', 'autosticker',
    'autoRechazar', 'autoresponder', 'detect', 'antiBot', 'antiBot2',
    'modoadmin', 'antiLink', 'antiImg', 'reaction', 'nsfw', 'antifake',
    'delete', 'antiLag', 'antitoxic'
  ]

  booleanFields.forEach(field => {
    if (!(field in chat)) {
      chat[field] = defaultChatData[field]
    }
  })

  // String fields
  if (!('sAutoresponder' in chat)) chat.sAutoresponder = ''

  // Numeric fields
  if (!isNumber(chat.expired)) chat.expired = 0

  // Array fields
  if (!('per' in chat)) chat.per = []

  return chat
}

/**
 * Initialize or update settings data with default values
 * @param {Object} settings - Settings object from database
 * @returns {Object} Updated settings object
 */
export function initializeSettingsData(settings) {
  if (!settings || typeof settings !== 'object') {
    return { ...defaultSettingsData }
  }

  Object.keys(defaultSettingsData).forEach(key => {
    if (!(key in settings)) {
      settings[key] = defaultSettingsData[key]
    }
  })

  return settings
}

/**
 * Ensure database structure exists
 * @param {Object} db - Database object
 */
export function ensureDatabaseStructure(db) {
  if (!db.data) db.data = {}
  if (!db.data.users) db.data.users = {}
  if (!db.data.chats) db.data.chats = {}
  if (!db.data.settings) db.data.settings = {}
  if (!db.data.stats) db.data.stats = {}
}
