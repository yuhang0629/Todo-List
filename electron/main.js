const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false // Prevent background throttling for better performance
    },
    frame: false,
    resizable: true,
    show: false,
    transparent: false,
    skipTaskbar: false,
    webSecurity: false // Allow faster loading
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Optimize performance after show
    if (!isDev) {
      mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// File storage handlers
const getDataPath = () => {
  return path.join(app.getPath('userData'), 'todos.json');
};

ipcMain.handle('load-todos', async () => {
  try {
    const dataPath = getDataPath();
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty object if file doesn't exist
    return {};
  }
});

ipcMain.handle('save-todos', async (event, todos) => {
  try {
    const dataPath = getDataPath();
    await fs.writeFile(dataPath, JSON.stringify(todos, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving todos:', error);
    return false;
  }
});

ipcMain.handle('get-data-path', async () => {
  return getDataPath();
});

ipcMain.handle('set-always-on-top', async (event, alwaysOnTop) => {
  try {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(alwaysOnTop);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting always on top:', error);
    return false;
  }
});

ipcMain.handle('resize-window', async (event, { width, height }) => {
  try {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      mainWindow.center();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error resizing window:', error);
    return false;
  }
});