/**
 * Admin utilities module
 * Handles group admin detection and participant management
 */

import { normalizeJid, cleanJid } from './roles.js'

/**
 * Find participant in metadata using various matching strategies
 * @param {string} jidToFind - JID to find
 * @param {Array} participants - Array of participants from metadata
 * @param {Function} decodeJid - Decode JID function
 * @param {Function} areJidsSameUser - Baileys JID comparator function
 * @returns {Object|null} Participant object or null
 */
export function findParticipant(jidToFind, participants, decodeJid, areJidsSameUser) {
  if (!jidToFind || !participants || !participants.length) return null
  
  try {
    const targetFull = decodeJid ? decodeJid(jidToFind) : jidToFind
    const targetNum = normalizeJid(targetFull || jidToFind)
    
    for (const p of participants) {
      const pJid = p?.id || p?.jid || ''
      if (!pJid) continue
      
      const pFull = decodeJid ? decodeJid(pJid) : pJid
      
      // 1) Try library comparator with different variants
      if (areJidsSameUser) {
        try {
          if (areJidsSameUser(pJid, jidToFind) || 
              areJidsSameUser(pFull, targetFull) || 
              areJidsSameUser(pJid, targetFull)) {
            return p
          }
        } catch (e) {
          // Ignore comparator errors and fallthrough to simple checks
        }
      }
      
      // 2) Numeric match fallback
      try {
        const pNum = normalizeJid(pFull)
        const pNumRaw = normalizeJid(pJid)
        if ((pNum && pNum === targetNum) || (pNumRaw && pNumRaw === targetNum)) {
          return p
        }
      } catch (e) {}
      
      // 3) Clean JID compare (strip device suffix)
      try {
        const pClean = cleanJid(pJid)
        const pFullClean = cleanJid(pFull)
        const targetClean = cleanJid(jidToFind)
        const targetFullClean = cleanJid(targetFull)
        
        if ((pClean && pClean === targetClean) || 
            (pFullClean && pFullClean === targetFullClean)) {
          return p
        }
      } catch (e) {}
      
      // 4) Exact string fallback
      if (pJid === jidToFind || pFull === jidToFind) {
        return p
      }
    }
    
    return null
  } catch (e) {
    console.error('Error finding participant:', e)
    return null
  }
}

/**
 * Normalize participants array with admin info
 * @param {Array} participants - Raw participants array
 * @param {Function} decodeJid - Decode JID function
 * @returns {Array} Normalized participants with admin flags
 */
export function normalizeParticipants(participants, decodeJid) {
  if (!participants || !participants.length) return []
  
  return participants.map(participant => {
    const jidRaw = participant?.id || participant?.jid || ''
    const fullJid = (decodeJid ? decodeJid(jidRaw) : jidRaw) || jidRaw
    const num = normalizeJid(fullJid)
    const role = participant?.admin || participant?.role || null
    
    return {
      id: jidRaw,
      full: fullJid,
      num,
      admin: role, // 'admin' | 'superadmin' | null
      isAdmin: !!role
    }
  })
}

/**
 * Build participant info object from raw participant
 * @param {Object} participantRaw - Raw participant object
 * @param {Function} decodeJid - Decode JID function
 * @returns {Object|null} Normalized participant info or null
 */
export function buildParticipantInfo(participantRaw, decodeJid) {
  if (!participantRaw) return null
  
  const id = participantRaw.id || participantRaw.jid
  const full = decodeJid ? decodeJid(id) : id
  const num = normalizeJid(id)
  const admin = participantRaw.admin || participantRaw.role || null
  const isAdmin = !!(participantRaw.admin || participantRaw.isAdmin || participantRaw.role === 'admin' || participantRaw.role === 'superadmin')
  
  return { id, full, num, admin, isAdmin }
}

/**
 * Get admin status for sender and bot in a group
 * @param {Object} options - Options object
 * @param {Object} options.m - Message object
 * @param {Array} options.participants - Group participants
 * @param {Object} options.thisConn - Current connection
 * @param {Object} options.globalConn - Global connection
 * @param {Function} options.areJidsSameUser - Baileys JID comparator
 * @returns {Object} Admin status info
 */
export function getAdminStatus({ m, participants, thisConn, globalConn, areJidsSameUser }) {
  if (!m.isGroup || !participants || !participants.length) {
    return {
      isAdmin: false,
      isBotAdmin: false,
      isRAdmin: false,
      participantUser: null,
      botParticipant: null
    }
  }
  
  const decodeJid = thisConn?.decodeJid || (jid => jid)
  const senderFull = decodeJid(m.sender)
  const senderNum = normalizeJid(senderFull || m.sender)
  
  // Get bot JIDs
  const botJids = []
  if (thisConn?.user?.jid) botJids.push(thisConn.user.jid)
  if (thisConn?.user?.lid) botJids.push(thisConn.user.lid)
  if (globalConn?.user?.jid) botJids.push(globalConn.user.jid)
  
  const botNums = [...new Set(botJids.filter(Boolean).map(j => normalizeJid(decodeJid(j))))]
  
  // Find sender participant
  let participantRaw = findParticipant(m.sender, participants, decodeJid, areJidsSameUser)
  
  // If not found, try numeric-only matches
  if (!participantRaw && senderNum) {
    participantRaw = participants.find(p => {
      const pj = decodeJid(p?.id || p?.jid || '')
      return normalizeJid(pj) === senderNum
    }) || null
  }
  
  // Find bot participant
  let botRaw = null
  for (const b of botJids) {
    botRaw = findParticipant(b, participants, decodeJid, areJidsSameUser)
    if (botRaw) break
  }
  
  // If still not found, try against botNums
  if (!botRaw && botNums && botNums.length) {
    for (const bn of botNums) {
      botRaw = participants.find(p => {
        const pj = decodeJid(p?.id || p?.jid || '')
        return normalizeJid(pj) === bn
      }) || null
      if (botRaw) break
    }
  }
  
  // Build normalized participant info
  const participantsNormalized = normalizeParticipants(participants, decodeJid)
  
  let participantUser = participantRaw 
    ? buildParticipantInfo(participantRaw, decodeJid)
    : participantsNormalized.find(p => p.num === senderNum || p.full === senderFull || p.id === m.sender) || null
  
  const botParticipant = botRaw 
    ? buildParticipantInfo(botRaw, decodeJid)
    : participantsNormalized.find(p => botNums.includes(p.num) || botJids.includes(p.full) || botJids.includes(p.id)) || null
  
  // Fallback: sometimes sender is one of the bot JIDs (multi-connection)
  if (!participantUser && botParticipant) {
    let senderMatchesBot = false
    
    try {
      for (const bj of botJids) {
        try {
          if (areJidsSameUser && (areJidsSameUser(bj, m.sender) || areJidsSameUser(bj, senderFull))) {
            senderMatchesBot = true
            break
          }
        } catch (e) {
          if (cleanJid(bj) === cleanJid(m.sender) || normalizeJid(bj) === senderNum) {
            senderMatchesBot = true
            break
          }
        }
      }
    } catch (e) {}
    
    if (!senderMatchesBot && botNums.includes(senderNum)) {
      senderMatchesBot = true
    }
    
    if (senderMatchesBot) {
      participantUser = {
        id: botParticipant.id,
        full: botParticipant.full,
        num: botParticipant.num,
        admin: botParticipant.admin,
        isAdmin: !!botParticipant.isAdmin
      }
    }
  }
  
  // Calculate admin flags
  const isAdmin = !!participantUser?.isAdmin
  const isBotAdmin = !!botParticipant?.isAdmin
  const isRAdmin = participantUser?.admin === 'superadmin' || false
  
  return {
    isAdmin,
    isBotAdmin,
    isRAdmin,
    participantUser,
    botParticipant
  }
}
