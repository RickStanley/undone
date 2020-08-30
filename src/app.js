const { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme, Menu, screen, Tray } = require('electron');
const path = require('path');

/** @type {Tray} */
let tray = null;
/** @type {BrowserWindow} */
let mainWindow = null;

let isQuiting = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

app.on('before-quit', () => {
  isQuiting = true;
});

//#region Shortcuts
function registerShortcuts() {
  globalShortcut.register('CommandOrControl+W', () => {
    mainWindow.destroy();
    app.quit();
  });
  globalShortcut.register('CommandOrControl+C', () => {
    unregisterShorcuts();
    mainWindow.hide();
  });
}

function unregisterShorcuts() {
  globalShortcut.unregisterAll();
}
//#endregion


const createMainWindow = () => {
  const mainWindowDimensions = {
    width: 375,
    height: 500
  };

  const mainWindowPosition = calculateWindowPosition(mainWindowDimensions);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...mainWindowDimensions,
    ...mainWindowPosition,
    fullscreenable: false,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/views/index.html'));

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  });

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
      mainWindow?.restore();
    });
  }

  mainWindow.on('focus', registerShortcuts);
  mainWindow.on('blur', unregisterShorcuts);
  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.prevendDefault();
      unregisterShorcuts();
      mainWindow.hide();
    }
  });
  mainWindow.on('minimize', (event) => {
    if (!isQuiting) {
      event.prevendDefault?.();
      unregisterShorcuts();
      mainWindow.hide();
    }
  });

};

const createProgressWindow = () => {
  const progressWindowDimensions = {
    width: 375,
    height: 250,
  };

  const progressWindowPosition = calculateWindowPosition(progressWindowDimensions);

  const progressWindow = new BrowserWindow({
    ...progressWindowDimensions,
    ...progressWindowPosition,
  });

  progressWindow.loadFile(path.join(__dirname, '/views/progress.html'));

  progressWindow.webContents.openDevTools();
};

/**
 * Calculates window position relative to tray prosition in the primary display.
 * @param {{width: number, height: number}} 
 */
const calculateWindowPosition = ({ width, height }) => {
  const screenBounds = screen.getPrimaryDisplay().size;
  const trayBounds = tray.getBounds();

  //where is the icon on the screen?
  let trayPos = 4; // 1:top-left 2:top-right 3:bottom-left 4.bottom-right
  trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
  trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

  let x, y;

  //calculate the new window position
  switch (trayPos) {
    case 1: // for TOP - LEFT
      x = Math.floor(trayBounds.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + trayBounds.height / 2);
      break;

    case 2: // for TOP - RIGHT
      x = Math.floor(
        trayBounds.x - width - trayBounds.width / 2
      );
      y = Math.floor(trayBounds.y + trayBounds.height / 2);
      break;

    case 3: // for BOTTOM - LEFT
      x = Math.floor(trayBounds.x + trayBounds.width / 2);
      y = Math.floor(
        trayBounds.y - height - trayBounds.height / 2
      );
      break;

    case 4: // for BOTTOM - RIGHT
      x = Math.floor(
        trayBounds.x - width - trayBounds.width / 2
      );
      y = Math.floor(
        trayBounds.y - height - trayBounds.height / 2
      );
      break;
  }

  return { x, y };
}

app.on('ready', () => {
  const iconPath = path.join(__dirname, '/assets/icons/', `icon-${nativeTheme.shouldUseDarkColors ? 'white' : 'black'}.png`);
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Progress',
      click: createProgressWindow
    },
    {
      label: 'Quit',
      click: () => {
        mainWindow.destroy();
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Undone');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
  })
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

nativeTheme.on('updated', () => {
  const iconPath = path.join(__dirname, '/assets/icons/', `icon-${nativeTheme.shouldUseDarkColors ? 'white' : 'black'}.png`);
  tray.setImage(iconPath);
});

//#region IPC events
ipcMain.on('window', (event, args) => {
  switch (args[0]) {
    case 'minimize':
      mainWindow.hide();
      break;
    case 'close':
      mainWindow.destroy();
      app.quit();
      break;
  }
});
//#endregion