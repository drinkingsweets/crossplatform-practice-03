const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { listDirectory } = require('./directory');

const page = path.join(__dirname, 'index.html');
let win;
function checkSender(event) {
  if (!win || event.sender !== win.webContents ||
      event.senderFrame !== win.webContents.mainFrame ||
      event.senderFrame.url !== pathToFileURL(page).href) {
    throw new Error('Недопустимый отправитель IPC');
  }
}
ipcMain.handle('list-dir', async (event, dir) => {
  checkSender(event);
  const root = app.isPackaged
    ? path.join(process.resourcesPath, 'example') : process.cwd();
  return listDirectory(root, dir);
});
ipcMain.handle('runtime-versions', (event) => {
  checkSender(event);
  const { electron, chrome, node } = process.versions;
  return { electron, chrome, node };
});
function createWindow() {
  win = new BrowserWindow({
    width: 1000, height: 760, minWidth: 760, minHeight: 540,
    title: 'Electron File Explorer — Вариант 8',
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.on('closed', () => { win = null; });
  win.loadFile(page);
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, _p, cb) => cb(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
