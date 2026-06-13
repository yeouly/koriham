const { app, BrowserWindow, session } = require('electron')
const http = require('http')
const fs   = require('fs')
const path = require('path')

const PORT = 3721
const ROOT = __dirname

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css',
  '.js':    'application/javascript',
  '.json':  'application/json',
  '.mp3':   'audio/mpeg',
  '.jpeg':  'image/jpeg',
  '.jpg':   'image/jpeg',
  '.png':   'image/png',
  '.svg':   'image/svg+xml',
  '.gif':   'image/gif',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
}

const server = http.createServer((req, res) => {
  const urlPath  = decodeURIComponent(req.url.split('?')[0])
  const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath)
  const ext      = path.extname(filePath).toLowerCase()

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

let mainWindow

app.whenReady().then(() => {
  // Grant microphone permission automatically for localhost
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'microphone' || permission === 'audioCapture') {
      callback(true)
    } else {
      callback(false)
    }
  })

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media' || permission === 'microphone' || permission === 'audioCapture') {
      return true
    }
    return false
  })

  server.listen(PORT, '127.0.0.1', () => {
    mainWindow = new BrowserWindow({
      width:     393,
      height:    852,
      resizable: false,
      title:     '코리햄',
      webPreferences: {
        nodeIntegration:  false,
        contextIsolation: true,
      },
    })

    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(`http://localhost:${PORT}/`)

    mainWindow.on('closed', () => { mainWindow = null })
  })
})

app.on('window-all-closed', () => {
  server.close()
  app.quit()
})
