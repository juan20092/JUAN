/**
 * Plugin performance utilities
 * Caching and optimization for plugin execution
 */

/**
 * Cache for compiled regex patterns
 */
const regexCache = new Map()

/**
 * Get or create cached regex pattern
 * @param {string|RegExp} pattern - Pattern to compile
 * @returns {RegExp} Compiled regex
 */
export function getCachedRegex(pattern) {
  if (pattern instanceof RegExp) return pattern
  
  if (regexCache.has(pattern)) {
    return regexCache.get(pattern)
  }
  
  const regex = new RegExp(pattern)
  regexCache.set(pattern, regex)
  
  return regex
}

/**
 * Clear regex cache
 */
export function clearRegexCache() {
  regexCache.clear()
}

/**
 * Check if command matches plugin command pattern
 * @param {string} command - Command to check
 * @param {string|RegExp|Array} pluginCommand - Plugin command pattern
 * @returns {boolean} True if matches
 */
export function isCommandMatch(command, pluginCommand) {
  if (!pluginCommand) return false
  
  // RegExp pattern
  if (pluginCommand instanceof RegExp) {
    return pluginCommand.test(command)
  }
  
  // Array of patterns
  if (Array.isArray(pluginCommand)) {
    return pluginCommand.some(cmd => {
      if (cmd instanceof RegExp) {
        return cmd.test(command)
      }
      return cmd === command
    })
  }
  
  // String pattern
  if (typeof pluginCommand === 'string') {
    return pluginCommand === command
  }
  
  return false
}

/**
 * Validate plugin permissions efficiently
 * @param {Object} plugin - Plugin object
 * @param {Object} permissions - User permissions
 * @returns {Object} Validation result {valid: boolean, failType: string}
 */
export function validatePluginPermissions(plugin, permissions) {
  const {
    isROwner, isOwner, isMods, isPrems, isAdmin, 
    m, _user, isGroup
  } = permissions
  
  // Check owner permissions
  if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
    return { valid: false, failType: 'owner' }
  }
  
  if (plugin.rowner && !isROwner) {
    return { valid: false, failType: 'rowner' }
  }
  
  if (plugin.owner && !isOwner) {
    return { valid: false, failType: 'owner' }
  }
  
  // Check moderator permissions
  if (plugin.mods && !isMods) {
    return { valid: false, failType: 'mods' }
  }
  
  // Check premium permissions
  if (plugin.premium && !isPrems) {
    return { valid: false, failType: 'premium' }
  }
  
  // Check admin permissions
  if (plugin.admin && !isAdmin) {
    return { valid: false, failType: 'admin' }
  }
  
  // Check group/private restrictions
  if (plugin.private && isGroup) {
    return { valid: false, failType: 'private' }
  }
  
  if (plugin.group && !isGroup) {
    return { valid: false, failType: 'group' }
  }
  
  // Check registration requirement
  if (plugin.register === true && _user.registered === false) {
    return { valid: false, failType: 'unreg' }
  }
  
  return { valid: true, failType: null }
}

/**
 * Build extra object for plugin execution
 * @param {Object} params - Parameters for building extra object
 * @returns {Object} Extra object for plugin
 */
export function buildPluginExtra(params) {
  const {
    match, usedPrefix, noPrefix, _args, args, command, text,
    conn, participants, groupMetadata, user, bot,
    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
    chatUpdate, __dirname, __filename
  } = params
  
  return {
    match,
    usedPrefix,
    noPrefix,
    _args,
    args,
    command,
    text,
    conn,
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
    __dirname,
    __filename
  }
}
