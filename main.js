const {app, BrowserWindow, ipcMain} = require('electron/main');
const path = require('node:path');

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
  const win = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

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

app.whenReady().then(() => {
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
