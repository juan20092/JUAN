/**
 * Roles utilities module
 * Handles role detection and permissions (owner, admin, premium, etc.)
 */

/**
 * Normalize JID to only base number (removes device suffix and non-digits)
 * @param {string} jid - JID to normalize
 * @returns {string} Normalized JID (only digits)
 */
export const normalizeJid = jid => {
  if (!jid) return ''
  // Remove domain and keep the part before '@'
  let base = jid.split('@')[0]
  // Remove device suffix if it exists (part after ':')
  base = base.split(':')[0]
  // Keep only digits
  return base.replace(/[^0-9]/g, '')
}

/**
 * Clean JID by removing device suffix
 * @param {string} jid - JID to clean
 * @returns {string} Cleaned JID
 */
export const cleanJid = jid => jid?.split(':')[0] || ''

/**
 * Check if user is root owner
 * @param {string} senderJid - Sender JID
 * @param {Object} conn - Connection object
 * @param {Object} global - Global object with owner list
 * @returns {boolean} True if user is root owner
 */
export function isRootOwner(senderJid, conn, global) {
  try {
    const senderNum = normalizeJid(senderJid)
    const ownerList = [
      conn.decodeJid ? conn.decodeJid(conn.user.id) : conn.user.id,
      ...global.owner.map(([number]) => number)
    ].map(v => v.replace(/[^0-9]/g, ''))
    
    return ownerList.includes(senderNum)
  } catch (e) {
    console.error('Error checking root owner:', e)
    return false
  }
}

/**
 * Check if user is owner (root owner or fromMe)
 * @param {boolean} isROwner - Is root owner
 * @param {boolean} fromMe - Message is from me
 * @returns {boolean} True if user is owner
 */
export function isOwner(isROwner, fromMe) {
  return isROwner || fromMe
}

/**
 * Check if user is moderator
 * @param {string} senderJid - Sender JID
 * @param {boolean} isOwner - Is owner
 * @param {Object} global - Global object with mods list
 * @returns {boolean} True if user is moderator
 */
export function isModerator(senderJid, isOwner, global) {
  if (isOwner) return true
  
  try {
    const senderNum = normalizeJid(senderJid)
    return global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum)
  } catch (e) {
    console.error('Error checking moderator:', e)
    return false
  }
}

/**
 * Check if user is premium
 * @param {string} senderJid - Sender JID
 * @param {boolean} isROwner - Is root owner
 * @param {Object} user - User database object
 * @param {Object} global - Global object with prems list
 * @returns {boolean} True if user is premium
 */
export function isPremium(senderJid, isROwner, user, global) {
  if (isROwner) return true
  
  try {
    const senderNum = normalizeJid(senderJid)
    const isPremList = global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum)
    const isPremDB = user && user.premium === true
    
    return isPremList || isPremDB
  } catch (e) {
    console.error('Error checking premium:', e)
    return false
  }
}

/**
 * Get all bot JIDs and normalized numbers
 * @param {Object} thisConn - Current connection object
 * @param {Object} globalConn - Global connection object
 * @returns {Object} Object with botJids and botNums arrays
 */
export function getBotJids(thisConn, globalConn) {
  const botJids = []
  const decodeJid = thisConn?.decodeJid || (jid => jid)
  
  if (thisConn?.user?.jid) botJids.push(thisConn.user.jid)
  if (thisConn?.user?.lid) botJids.push(thisConn.user.lid)
  if (globalConn?.user?.jid) botJids.push(globalConn.user.jid)
  
  // Normalize and unique
  const botNums = [...new Set(botJids.filter(Boolean).map(j => normalizeJid(decodeJid(j))))]
  
  return { botJids: botJids.filter(Boolean), botNums }
}
