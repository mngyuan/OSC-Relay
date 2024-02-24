const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

app.setName('OSC Relay');

// -------------------------- OSC --------------------------
const osc = require('osc');
const express = require('express');
const WebSocket = require('ws');

// Bind to a UDP socket
const udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 9999,
  remoteAddress: '0.0.0.0',
  remotePort: 9998,
});

const portReadyCb = () => {
  console.log('Listening for OSC over UDP.');
  console.log(' Host: localhost Port:', udpPort.options.localPort);
  console.log('Broadcasting OSC over UDP.');
  console.log(' Host: localhost Port:', udpPort.options.remotePort);
};

udpPort.on('ready', portReadyCb);
udpPort.open();

let socketPort;

// Create an Express-based Web Socket server to which OSC messages will be relayed.
const expressapp = express();
const server = expressapp.listen(8081);
const wss = new WebSocket.Server({
  server: server,
});

// -------------------------- END OSC --------------------------

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Set up OSC message forwarding to the frontend
  udpPort.on('message', function (msg) {
    console.log('udp', msg);
    win.webContents.send('osc-msg', {type: 'udp', msg});
  });

  // and frontend forwarding to UDP
  wss.on('connection', function (socket) {
    console.log('A Web Socket connection has been established!');
    socketPort = new osc.WebSocketPort({
      socket: socket,
    });

    const relay = new osc.Relay(udpPort, socketPort, {
      raw: true,
    });

    socketPort.on('message', function (msg) {
      console.log('socket', msg);
      win.webContents.send('osc-msg', {type: 'socket', msg});
    });
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('set-udp-port', (event, arg) => {
    console.log('Changing UDP in port to', arg);
    udpPort.options.localPort = arg;
    udpPort.open();
  });
  ipcMain.on('set-socket-port', (event, arg) => {
    console.log('Changing websocket out port to', arg);
    server.close();
    server.listen(arg);
  });
  ipcMain.on('set-udp-out-port', (event, arg) => {
    console.log('Changing UDP out port to', arg);
    udpPort.options.remotePort = arg;
    udpPort.open();
  });

  createWindow();
});

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
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
