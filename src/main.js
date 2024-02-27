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
let udpPort = new osc.UDPPort({
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

let socketPort;
let relay;

// Create an Express-based Web Socket server to which OSC messages will be relayed.
const expressapp = express();
const server = expressapp.listen(8081);
const wss = new WebSocket.Server({
  server: server,
});

// -------------------------- END OSC --------------------------

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Set up OSC message forwarding to the frontend
  udpPort.on('message', (msg) => {
    console.log('udp', msg);
    mainWindow.webContents.send('osc-msg', {type: 'udp', msg});
  });

  // and frontend forwarding to UDP
  wss.on('connection', function (socket) {
    console.log('A Web Socket connection has been established!');
    socketPort = new osc.WebSocketPort({
      socket: socket,
    });
    console.log('socketport');

    socketPort.on('message', function (msg) {
      console.log('socket', msg);
      mainWindow.webContents.send('osc-msg', {type: 'socket', msg});
    });

    relay = new osc.Relay(udpPort, socketPort, {
      raw: true,
    });

    mainWindow.webContents.send('websocket-connection');
  });
};

const refreshConnection = (options) => {
  udpPort.close();
  // otherwise next listen won't work; this is due to how osc.js works
  udpPort.socket = undefined;
  udpPort.options = {...udpPort.options, ...options};
  udpPort.open();
  if (socketPort) {
    console.log('remaking relay');
    relay.close();
    relay = new osc.Relay(udpPort, socketPort, {
      raw: true,
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('set-udp-in-port', (event, arg) => {
    console.log('Changing UDP in port to', arg.address, arg.port);
    refreshConnection({localAddress: arg.address, localPort: arg.port});
  });
  ipcMain.on('set-socket-port', (event, arg) => {
    console.log('Changing websocket out port to', arg);
    server.close();
    server.listen(arg);
  });
  ipcMain.on('set-udp-out-port', (event, arg) => {
    console.log('Changing UDP out port to', arg.address, arg.port);
    refreshConnection({remoteAddress: arg.address, remotePort: arg.port});
  });
  ipcMain.on('toggle-udp-receive', (event, arg) => {
    if (arg) {
      refreshConnection({localAddress: arg.address, localPort: arg.port});
      console.log('Enabling UDP receive relay', arg.address, arg.port);
    } else {
      refreshConnection({localAddress: 'localhost', localPort: 65534});
      console.log('Disabling UDP receive relay');
    }
  });
  ipcMain.on('toggle-socket-send', (event, arg) => {
    if (arg) {
      udpPort.options.remoteAddress = arg.address;
      udpPort.options.remotePort = arg.port;
      console.log('Enabling UDP send relay', arg.address, arg.port);
    } else {
      udpPort.options.remoteAddress = undefined;
      udpPort.options.remotePort = undefined;
      console.log('Disabling UDP send relay');
    }
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
