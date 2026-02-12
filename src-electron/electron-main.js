import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import MainService from './MainService.js';
import GitService from './GitService.js';
import InternetService from './InternetService.js';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow;

async function createWindow() {
  /**
   * Initial window options
   */

  const services = {};
  for (let [name, api] of [
    ['MainService', MainService],
    ['GitService', GitService],
    ['InternetService', InternetService],
  ]) {
    services[name] = Object.getOwnPropertyNames(api).filter(k => typeof api[k] === 'function');
    for (let f of services[name])
      ipcMain.handle(`${name}.${f}`, (e, ...args) => {
        return api[f](...args);
      });
  }

  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/linux-512x512.png'), // tray icon
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION
        )
      ),
      additionalArguments: ['--services=' + JSON.stringify(services)],
    },
  });

  globalShortcut.register('Control+=', () => {
    mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 1);
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  setTimeout(() => {
    mainWindow.webContents.setZoomLevel(1.5);
  }, 100);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  console.log(platform);
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
