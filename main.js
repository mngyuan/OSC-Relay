const {app, BrowserWindow} = require('electron/main');
const path = require('node:path');

// OSC
const osc = require('osc');
const express = require('express');
const WebSocket = require('ws');

// Bind to a UDP socket to listen for incoming OSC events.
const udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 9999,
});

udpPort.on('ready', function () {
  console.log('Listening for OSC over UDP.');
  console.log(' Host: localhost Port:', udpPort.options.localPort);
});

udpPort.open();

// Create an Express-based Web Socket server to which OSC messages will be relayed.
const expressapp = express();
const server = expressapp.listen(8081);
const wss = new WebSocket.Server({
  server: server,
});

wss.on('connection', function (socket) {
  console.log('A Web Socket connection has been established!');
  var socketPort = new osc.WebSocketPort({
    socket: socket,
  });

  var relay = new osc.Relay(udpPort, socketPort, {
    raw: true,
  });
});
// END OSC

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
