/**
 * Simple utilities for message processing
 * Extends message objects with additional methods and properties
 */

import fetch from 'node-fetch'

/**
 * Serialize message to add helper methods and properties
 * @param {Object} conn - Connection object
 * @param {Object} m - Message object
 * @returns {Object} Serialized message object
 */
export function smsg(conn, m) {
  if (!m) return m
  
  // Ensure m has required properties
  m.id = m.key?.id
  m.isBaileys = m.id?.startsWith('BAE5') || m.id?.startsWith('3EB0')
  m.chat = m.key?.remoteJid || ''
  m.fromMe = m.key?.fromMe || false
  m.isGroup = m.chat?.endsWith('@g.us') || false
  m.sender = m.fromMe 
    ? (conn.user?.id || conn.user?.jid) 
    : (m.participant || m.key?.participant || m.chat || '')
  
  // Message type detection
  m.mtype = Object.keys(m.message || {})[0]
  m.msg = m.message?.[m.mtype] || {}
  m.text = m.msg?.text || m.msg?.caption || m.msg?.contentText || m.msg || ''
  
  // Media handling
  m.quoted = m.msg?.contextInfo?.quotedMessage ? {
    ...m.msg.contextInfo,
    message: m.msg.contextInfo.quotedMessage,
    mtype: Object.keys(m.msg.contextInfo.quotedMessage)[0],
    msg: m.msg.contextInfo.quotedMessage[Object.keys(m.msg.contextInfo.quotedMessage)[0]],
    text: m.msg.contextInfo.quotedMessage[Object.keys(m.msg.contextInfo.quotedMessage)[0]]?.text 
       || m.msg.contextInfo.quotedMessage[Object.keys(m.msg.contextInfo.quotedMessage)[0]]?.caption
       || ''
  } : null
  
  // Helper method to download media (uses Baileys' downloadMediaMessage)
  m.download = async (filename) => {
    if (!m.msg) return null
    
    try {
      const buffer = await conn.downloadMediaMessage(m.msg)
      
      if (filename) {
        const fs = await import('fs')
        await fs.promises.writeFile(filename, buffer)
        return filename
      }
      
      return buffer
    } catch (e) {
      console.error('Error descargando media:', e)
      return null
    }
  }
  
  // Helper method to reply
  m.reply = async (text, chatId, options) => {
    return await conn.sendMessage(chatId || m.chat, { text }, { quoted: m, ...options })
  }
  
  // Helper method to react to message
  m.react = async (emoji) => {
    return await conn.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: m.key
      }
    })
  }
  
  // Get message name/push name
  m.name = m.pushName || m.msg?.pushName || 'User'
  
  return m
}
