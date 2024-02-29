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

let localPort = 9999;
let remotePort = 9998;
// Bind to a UDP socket
let udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort,
  remoteAddress: '0.0.0.0',
  remotePort,
});

const refreshConnection = async (options) => {
  console.log(udpPort);
  if (udpPort) {
    // udpPort.close() just calls this.socket.close(), lets do this async
    // to avoid callback hell
    closeUDPPort = () =>
      new Promise((resolve, reject) => {
        if (udpPort.socket) {
          udpPort.socket.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    await closeUDPPort();
  }
  localPort = options?.localPort || localPort;
  remotePort = options?.remotePort || remotePort;
  console.log(localPort, remotePort);
  udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort,
    remoteAddress: '0.0.0.0',
    remotePort,
  });

  udpPort.on('message', (msg) => {
    console.log('UDP', msg);
    socketPort?.send(msg);
    mainWindow.webContents.send('osc-msg', {type: 'udp', msg});
  });

  udpPort.on('ready', () => {
    console.log('Listening for OSC over UDP.');
    console.log(' Host: localhost Port:', udpPort.options.localPort);
    console.log('Broadcasting OSC over UDP.');
    console.log(' Host: localhost Port:', udpPort.options.remotePort);
  });

  udpPort.open();
};

let socketPort;

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

  // and frontend forwarding to UDP
  wss.on('connection', (socket) => {
    console.log(
      'A Web Socket connection has been established. Clients:',
      wss.clients.size,
    );
    socketPort = new osc.WebSocketPort({
      socket: socket,
    });

    socketPort.on('message', (msg) => {
      console.log('SOCKET', msg);
      udpPort.send(msg);
      mainWindow.webContents.send('osc-msg', {type: 'socket', msg});
    });

    mainWindow.webContents.send('websocket-connection', wss.clients.size);

    socket.isAlive = true;
    socket.on('error', console.error);
    socket.on('pong', () => (socket.isAlive = true));
    socket.on('close', () => {
      console.log(
        'Websocket client closed connection. Clients: ',
        wss.clients.size,
      );
      mainWindow.webContents.send('websocket-connection', wss.clients.size);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        socket.terminate();
        console.log(
          'Lost connection to a websocket client. Clients:',
          wss.clients.size,
        );
        mainWindow.webContents.send('websocket-connection', wss.clients.size);
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 3000);
  wss.on('close', () => clearInterval(interval));

  refreshConnection();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('set-udp-in-port', (event, arg) => {
    console.log('Changing UDP in port to', arg.address, arg.port);
    refreshConnection({localPort: arg.port});
  });
  ipcMain.on('set-socket-port', (event, arg) => {
    console.log('Changing websocket out port to', arg);
    server.close();
    server.listen(arg);
  });
  ipcMain.on('set-udp-out-port', (event, arg) => {
    console.log('Changing UDP out port to', arg.address, arg.port);
    refreshConnection({remotePort: arg.port});
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
