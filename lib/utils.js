/**
 * Common utilities module
 * Helper functions used across the handler
 */

/**
 * Check if value is a number
 * @param {*} x - Value to check
 * @returns {boolean} True if value is a valid number
 */
export const isNumber = x => typeof x === 'number' && !isNaN(x)

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after delay
 */
export const delay = ms => {
  if (!isNumber(ms)) return Promise.resolve()
  
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Pick a random element from an array
 * @param {Array} list - Array to pick from
 * @returns {*} Random element from array
 */
export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Mask sensitive data in error messages
 * @param {string} text - Text that may contain sensitive data
 * @param {Object} apiKeys - Object containing API keys to mask
 * @returns {string} Text with masked sensitive data
 */
export function maskSensitiveData(text, apiKeys = {}) {
  if (!text || typeof text !== 'string') return text
  
  let maskedText = text
  
  // Mask API keys
  for (let key of Object.values(apiKeys)) {
    if (key && typeof key === 'string') {
      maskedText = maskedText.replace(new RegExp(key, 'g'), '***MASKED***')
    }
  }
  
  // Mask common sensitive patterns
  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{48}/g,  // OpenAI API keys
    /(?:password|passwd|pwd)[\s:=]+[^\s]+/gi,  // Passwords
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // Emails (partial)
  ]
  
  sensitivePatterns.forEach(pattern => {
    maskedText = maskedText.replace(pattern, '***MASKED***')
  })
  
  return maskedText
}

/**
 * Safely get nested property from object
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot-separated path to property
 * @param {*} defaultValue - Default value if property not found
 * @returns {*} Property value or default value
 */
export function safeGet(obj, path, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue
  
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return defaultValue
    }
  }
  
  return result
}

/**
 * Check if running in development mode
 * @returns {boolean} True if in development mode
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
}

/**
 * Create a safe logger that masks sensitive data
 * @param {string} prefix - Prefix for log messages
 * @returns {Object} Logger object with log, error, warn methods
 */
export function createLogger(prefix = '') {
  const prefixStr = prefix ? `[${prefix}] ` : ''
  
  return {
    log: (...args) => console.log(prefixStr, ...args),
    error: (...args) => console.error(prefixStr, ...args),
    warn: (...args) => console.warn(prefixStr, ...args),
    debug: (...args) => {
      if (isDevelopment()) {
        console.log(`${prefixStr}[DEBUG]`, ...args)
      }
    }
  }
}

/**
 * Validate required configuration
 * @param {Object} config - Configuration object
 * @param {Array<string>} requiredKeys - Array of required keys
 * @returns {Object} Validation result {valid: boolean, missing: Array}
 */
export function validateConfig(config, requiredKeys) {
  const missing = []
  
  for (const key of requiredKeys) {
    if (!(key in config) || config[key] === undefined || config[key] === null) {
      missing.push(key)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  }
}
