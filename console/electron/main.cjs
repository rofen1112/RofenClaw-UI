const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')

app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-sandbox')
app.commandLine.appendSwitch('disable-software-rasterizer')

let splashWindow = null
let mainWindow = null
let tray = null

const GATEWAY_URL = 'http://localhost:18789'
const isDev = !app.isPackaged

const appLogs = []

function addLog(level, source, message, details = null) {
  const entry = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    level,
    source,
    message,
    details
  }
  appLogs.push(entry)
  if (appLogs.length > 1000) {
    appLogs.shift()
  }
  console.log(`[${entry.timestamp}] [${level.toUpperCase()}] [${source}] ${message}`)
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  splashWindow.loadFile(path.join(__dirname, '../resources/splash.html'))

  splashWindow.on('closed', () => {
    splashWindow = null
  })

  return splashWindow
}

async function findViteServer() {
  const http = require('http')
  const ports = [5173, 5174, 5175, 5176, 5177]
  
  for (const port of ports) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(true)
        })
        req.on('error', reject)
        req.setTimeout(1000, () => {
          req.destroy()
          reject(new Error('timeout'))
        })
      })
      return `http://localhost:${port}`
    } catch {
      continue
    }
  }
  return null
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false,
    backgroundColor: '#f8fafc',
  })

  if (isDev) {
    findViteServer().then((url) => {
      if (url) {
        mainWindow.loadURL(url)
      } else {
        setTimeout(() => {
          findViteServer().then((url) => {
            if (url) {
              mainWindow.loadURL(url)
            } else {
              console.error('Vite server not found')
              mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
            }
          })
        }, 3000)
      }
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close()
    }
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

function createTray() {
  const iconPath = path.join(__dirname, '../resources/icon.png')
  let icon
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty()
    }
  } catch {
    icon = nativeImage.createEmpty()
  }
  
  try {
    tray = new Tray(icon.resize({ width: 16, height: 16 }))
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show Window', 
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.focus()
          }
        }
      },
      { 
        label: 'Open Settings', 
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.webContents.send('navigate', '/settings')
          }
        }
      },
      { type: 'separator' },
      { 
        label: 'Restart Service', 
        click: () => {
          mainWindow?.webContents.send('restart-gateway')
        }
      },
      { type: 'separator' },
      { 
        label: 'Exit', 
        click: () => {
          app.isQuitting = true
          app.quit()
        }
      },
    ])
    
    tray.setToolTip('RofenClaw')
    tray.setContextMenu(contextMenu)
    
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })
  } catch (error) {
    console.log('Tray creation failed:', error.message)
  }
}

async function checkGatewayConnection() {
  const WebSocket = require('ws')
  return new Promise((resolve) => {
    try {
      addLog('debug', 'gateway', 'Checking gateway connection...')
      const ws = new WebSocket('ws://localhost:18789')
      const timeout = setTimeout(() => {
        ws.close()
        addLog('warn', 'gateway', 'Gateway connection check timeout')
        resolve(false)
      }, 3000)
      
      ws.on('open', () => {
        clearTimeout(timeout)
        ws.close()
        addLog('info', 'gateway', 'Gateway connection successful')
        resolve(true)
      })
      ws.on('error', (e) => {
        clearTimeout(timeout)
        addLog('error', 'gateway', 'Gateway connection failed', e.message)
        resolve(false)
      })
    } catch (e) {
      addLog('error', 'gateway', 'Gateway check exception', e.message)
      resolve(false)
    }
  })
}

async function loadConfig() {
  const configPath = path.join(app.getPath('home'), '.openclaw', 'openclaw.json')
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Load config failed:', error)
  }
  return null
}

app.whenReady().then(async () => {
  createSplashWindow()

  const gatewayReady = await checkGatewayConnection()
  
  splashWindow?.webContents.send('loading-status', {
    stage: 'gateway',
    status: gatewayReady ? 'connected' : 'disconnected',
    message: gatewayReady ? 'Gateway connected' : 'Gateway not running, some features limited',
  })

  const config = await loadConfig()
  
  splashWindow?.webContents.send('loading-status', {
    stage: 'config',
    status: config ? 'loaded' : 'error',
    message: config ? 'Config loaded' : 'Config load failed',
  })

  createMainWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})

ipcMain.handle('get-config', async () => {
  return await loadConfig()
})

ipcMain.handle('config:get', async () => {
  return await loadConfig()
})

ipcMain.handle('config:save', async (event, config) => {
  const configPath = path.join(app.getPath('home'), '.openclaw', 'openclaw.json')
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('save-config', async (event, config) => {
  const configPath = path.join(app.getPath('home'), '.openclaw', 'openclaw.json')
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('check-gateway', async () => {
  return await checkGatewayConnection()
})

ipcMain.handle('gateway:check', async () => {
  return await checkGatewayConnection()
})

ipcMain.handle('gateway:chat', async (event, message) => {
  const { exec } = require('child_process')
  addLog('info', 'gateway', `Sending chat message: ${message.slice(0, 50)}...`)
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      addLog('error', 'gateway', 'Request timeout')
      reject(new Error('Request timeout'))
    }, 180000)
    
    const command = `openclaw agent --agent main --message "${message.replace(/"/g, '\\"')}" --json`
    
    exec(command, { cwd: app.getPath('home') }, (error, stdout, stderr) => {
      clearTimeout(timeout)
      
      if (error) {
        addLog('error', 'gateway', 'Command failed', error.message)
        reject(new Error(error.message))
        return
      }
      
      if (stderr) {
        addLog('warn', 'gateway', 'Command stderr', stderr)
      }
      
      try {
        const result = JSON.parse(stdout)
        const text = result?.result?.payloads?.[0]?.text || result?.summary || stdout
        addLog('info', 'gateway', `Chat completed, response length: ${text.length}`)
        resolve(text)
      } catch (e) {
        addLog('warn', 'gateway', 'Failed to parse JSON, returning raw output')
        resolve(stdout)
      }
    })
  })
})

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url)
})

ipcMain.handle('shell:openExternal', async (event, url) => {
  await shell.openExternal(url)
})

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('close-window', () => {
  mainWindow?.close()
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('get-app-path', () => {
  return {
    home: app.getPath('home'),
    userData: app.getPath('userData'),
    openclawDir: path.join(app.getPath('home'), '.openclaw'),
  }
})

ipcMain.handle('app:getPath', () => {
  return {
    home: app.getPath('home'),
    userData: app.getPath('userData'),
    openclawDir: path.join(app.getPath('home'), '.openclaw'),
  }
})

ipcMain.handle('logs:get', async () => {
  return appLogs
})
