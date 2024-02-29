const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // we can also expose variables, not just functions
  setUDPInPort: ({address, port}) =>
    ipcRenderer.send('set-udp-in-port', {address, port}),
  setSocketPort: (port) => ipcRenderer.send('set-socket-port', port),
  setUDPOutPort: ({address, port}) =>
    ipcRenderer.send('set-udp-out-port', {address, port}),
  onOSCMsg: (callback) =>
    ipcRenderer.on('osc-msg', (event, data) => callback(data)),
  onWebsocketConnection: (callback) =>
    ipcRenderer.on('websocket-connection', (event, data) => callback(data)),
  toggleUDPReceive: (receiving) =>
    ipcRenderer.send('toggle-udp-receive', receiving),
  toggleSocketSend: (sending) =>
    ipcRenderer.send('toggle-socket-send', sending),
});
