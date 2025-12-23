import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import cluster from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'
import os from 'os'
import { promises as fsPromises } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { name, author } = require(join(__dirname, './package.json'))
const { say } = cfonts
const rl = createInterface(process.stdin, process.stdout)

say('Ji\nren\nBot', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'white']
})
say(`Desarrolado por JuanMd`, {
  font: 'console',
  align: 'center',
  colors: ['cyan', 'magenta', 'yellow']
})

let isRunning = false

/**
 * Handle uncaught exceptions to prevent silent failures
 */
process.on('uncaughtException', (err) => {
  if (err.code === 'ENOSPC') {
    console.error('Se ha detectado ENOSPC (sin espacio o límite de watchers alcanzado), reiniciando....')
  } else {
    console.error('Error no capturado:', err)
  }
  process.exit(1)
})

/**
 * Display system information and package details
 * @param {string} currentFilePath - Path to the current file
 */
async function displaySystemInfo(currentFilePath) {
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024)
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024)
  const packageJsonPath = join(dirname(currentFilePath), './package.json')
  
  try {
    const packageJsonData = await fsPromises.readFile(packageJsonPath, 'utf-8')
    const packageJsonObj = JSON.parse(packageJsonData)
    const currentTime = new Date().toLocaleString()
    const lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 》'
    
    console.log(chalk.yellow(`╭${lineM}
┊${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')}${chalk.yellow(`🖥️ ${os.type()}, ${os.release()} - ${os.arch()}`)}
┊${chalk.blueBright('┊')}${chalk.yellow(`💾 Total RAM: ${ramInGB.toFixed(2)} GB`)}
┊${chalk.blueBright('┊')}${chalk.yellow(`💽 Free RAM: ${freeRamInGB.toFixed(2)} GB`)}
┊${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')} ${chalk.blue.bold(`🟢INFORMACIÓN :`)}
┊${chalk.blueBright('┊')} ${chalk.blueBright('┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
┊${chalk.blueBright('┊')}${chalk.cyan(`👨🏻‍💻 Nombre: ${packageJsonObj.name}`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`📲 Versión: ${packageJsonObj.version}`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`🔗 Descripción: ${packageJsonObj.description}`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`🐉 Project Author: ${packageJsonObj.author.name} (@xrljuan)`)}
┊${chalk.blueBright('┊')}${chalk.blueBright('┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
┊${chalk.blueBright('┊')}${chalk.yellow(`🏓 Colaborador:`)}
┊${chalk.blueBright('┊')}${chalk.yellow(`• JUAN`)}
┊${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
┊${chalk.blueBright('╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')}
┊${chalk.blueBright('┊')}${chalk.cyan(`⏰ Hora Actual :`)}
┊${chalk.blueBright('┊')}${chalk.cyan(`${currentTime}`)}
┊${chalk.blueBright('╰┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅')} 
╰${lineM}`))
  } catch (err) {
    console.error(chalk.red(`❌ No se pudo leer el archivo package.json: ${err.message}`))
  }
}

/**
 * Setup cluster worker with proper configuration
 * @param {string[]} args - Command line arguments
 * @returns {object} Forked worker process
 */
function setupClusterWorker(args) {
  // Ensure workers get --expose-gc for better memory management
  const wantFlag = '--expose-gc'
  const workerExecArgv = process.execArgv.filter(arg => arg !== wantFlag)
  const envNodeOpts = process.env.NODE_OPTIONS || ''
  const hasFlagInEnv = envNodeOpts.split(/\s+/).includes(wantFlag)
  const workerEnv = { 
    ...process.env, 
    NODE_OPTIONS: hasFlagInEnv ? envNodeOpts : `${envNodeOpts} ${wantFlag}`.trim() 
  }

  // Use modern API if available, fallback to legacy
  const setup = typeof cluster.setupPrimary === 'function' ? cluster.setupPrimary : cluster.setupMaster
  setup({
    exec: args[0],
    args: args.slice(1),
    execArgv: workerExecArgv,
  })
  
  return cluster.fork(workerEnv)
}

/**
 * Setup worker message handlers
 * @param {object} worker - Cluster worker process
 * @param {Array} startArgs - Arguments for restart
 */
function setupWorkerMessageHandlers(worker, startArgs) {
  worker.on('message', data => {
    switch (data) {
      case 'reset':
        worker.process.kill()
        isRunning = false
        start.apply(null, startArgs)
        break
      case 'uptime':
        worker.send(process.uptime())
        break
    }
  })
}

/**
 * Setup worker exit handlers
 * @param {object} worker - Cluster worker process
 * @param {string[]} args - Command line arguments
 * @param {string} file - File to restart
 */
function setupWorkerExitHandlers(worker, args, file) {
  worker.on('exit', (_, code) => {
    isRunning = false
    console.error('⚠️ ERROR ⚠️ >> ', code)
    
    // Restart the main file
    start('main.js')

    // Watch for changes if exit code is non-zero
    if (code !== 0) {
      watchFile(args[0], () => {
        unwatchFile(args[0])
        start(file)
      })
    }
  })
}

/**
 * Setup readline interface for user input
 * @param {object} worker - Cluster worker process
 * @param {object} opts - Command line options
 */
function setupReadlineInterface(worker, opts) {
  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', line => {
        worker.emit('message', line.trim())
      })
    }
  }
}

/**
 * Start the application with cluster management
 * @param {string} file - Main file to execute
 */
async function start(file) {
  if (isRunning) return
  isRunning = true
  
  const currentFilePath = new URL(import.meta.url).pathname
  const args = [join(__dirname, file), ...process.argv.slice(2)]
  
  // Display startup command
  say([process.argv[0], ...args].join(' '), {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
  })
  
  // Setup and fork cluster worker
  const worker = setupClusterWorker(args)
  
  // Setup worker event handlers
  setupWorkerMessageHandlers(worker, [file])
  setupWorkerExitHandlers(worker, args, file)
  
  // Display system information
  await displaySystemInfo(currentFilePath)
  
  // Setup readline interface
  const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
  setupReadlineInterface(worker, opts)
}

start('main.js')