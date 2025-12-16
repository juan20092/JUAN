/**
 * Anti-toxic module
 * Handles toxic language detection and user warnings
 */

/**
 * List of toxic words to detect
 */
export const toxicWords = [
  'g0re', 'gore', 'g0r3', 'g.o.r.e', 'sap0', 'sap4', 'malparido', 'malparida', 
  'malparidos', 'malparidas', 'm4lp4rid0', 'm4lp4rido', 'm4lparido', 'malp4rido', 
  'm4lparid0', 'malp4rid0', 'chocha', 'chup4la', 'chup4l4', 'chupalo', 'chup4lo', 
  'chup4l0', 'chupal0', 'chupon', 'chupameesta', 'sabandija', 'hijodelagranputa', 
  'hijodeputa', 'hijadeputa', 'hijadelagranputa', 'kbron', 'kbrona', 'cajetuda', 
  'laconchadedios', 'putita', 'putito', 'put1t4', 'putit4', 'putit0', 'put1to', 
  'put1ta', 'pr0stitut4s', 'pr0stitutas', 'pr05titutas', 'pr0stitut45', 'prostitut45', 
  'prostituta5', 'pr0stitut45', 'fanax', 'f4nax', 'drogas', 'droga', 'dr0g4', 'nepe', 
  'p3ne', 'p3n3', 'pen3', 'p.e.n.e', 'pvt0', 'pvto', 'put0', 'hijodelagransetentamilparesdeputa', 
  'Chingadamadre', 'coño', 'c0ño', 'coñ0', 'c0ñ0', 'afeminado', 'drog4', 'cocaína', 
  'marihuana', 'chocho', 'chocha', 'cagon', 'pedorro', 'agrandado', 'agrandada', 
  'pedorra', 'cagona', 'pinga', 'joto', 'sape', 'mamar', 'chigadamadre', 'hijueputa', 
  'chupa', 'caca', 'bobo', 'boba', 'loco', 'loca', 'chupapolla', 'estupido', 'estupida', 
  'estupidos', 'polla', 'pollas', 'idiota', 'maricon', 'chucha', 'verga', 'vrga', 'naco', 
  'zorra', 'zorro', 'zorras', 'zorros', 'pito', 'huevon', 'huevona', 'huevones', 'rctmre', 
  'mrd', 'ctm', 'csm', 'cepe', 'sepe', 'sepesito', 'cepecito', 'cepesito', 'hldv', 'ptm', 
  'baboso', 'babosa', 'babosos', 'babosas', 'feo', 'fea', 'feos', 'feas', 'mamawebos', 
  'chupame', 'bolas', 'qliao', 'imbecil', 'embeciles', 'kbrones', 'cabron', 'capullo', 
  'carajo', 'gore', 'gorre', 'gorreo', 'gordo', 'gorda', 'gordos', 'gordas', 'sapo', 
  'sapa', 'mierda', 'cerdo', 'cerda', 'puerco', 'puerca', 'perra', 'perro', 'dumb', 
  'fuck', 'shit', 'bullshit', 'cunt', 'semen', 'bitch', 'motherfucker', 'foker', 
  'fucking', 'puta', 'puto', 'mierda', 'malparido', 'pendejo', 'culiao', 'imbécil', 
  'estúpido', 'marica', 'perra'
]

/**
 * Create regex pattern from toxic words
 * @returns {RegExp} Compiled regex pattern
 */
export function createToxicRegex() {
  return new RegExp(`\\b(${toxicWords.join('|')})\\b`, 'i')
}

/**
 * Check if text contains toxic language
 * @param {string} text - Text to check
 * @returns {boolean} True if toxic language detected
 */
export function isToxicMessage(text) {
  if (!text || typeof text !== 'string') return false
  
  const regex = createToxicRegex()
  return regex.test(text)
}

/**
 * Handle toxic message detection and warnings
 * @param {Object} options - Options object
 * @param {Object} options.m - Message object
 * @param {Object} options.conn - Connection object
 * @param {Object} options.db - Database object
 * @param {Object} options.rcanal - Canal object for replies
 * @returns {Promise<boolean>} True if user was kicked, false otherwise
 */
export async function handleToxicMessage({ m, conn, db, rcanal }) {
  try {
    if (!isToxicMessage(m.text)) {
      return false
    }
    
    console.log('[ANTITOXIC] Detectado lenguaje tóxico:', m.text)
    
    // Ensure user exists in database
    if (!db.data.users[m.sender]) {
      db.data.users[m.sender] = {}
    }
    
    // Initialize warns if not exists
    if (!db.data.users[m.sender].warns) {
      db.data.users[m.sender].warns = 0
    }
    
    // Increment warnings
    let userWarns = db.data.users[m.sender].warns + 1
    db.data.users[m.sender].warns = userWarns
    
    // Send warning message
    await conn.reply(
      m.chat, 
      `🍭 *Advertencia por tóxico ${userWarns}/4*\nEvita usar lenguaje ofensivo.`, 
      m, 
      rcanal
    )
    
    // Kick user if warnings >= 4
    if (userWarns >= 4) {
      db.data.users[m.sender].warns = 0
      
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        await conn.reply(
          m.chat, 
          `❌ Usuario expulsado por comportamiento tóxico reiterado.`, 
          m, 
          rcanal
        )
        return true
      } catch (e) {
        console.error('[ANTITOXIC] Error al expulsar usuario:', e)
        await conn.reply(
          m.chat, 
          `⚠️ No se pudo expulsar al usuario. Verifica si el bot es admin.`, 
          m, 
          rcanal
        )
        return false
      }
    }
    
    return false
  } catch (e) {
    console.error('[ANTITOXIC] Error en handleToxicMessage:', e)
    return false
  }
}
