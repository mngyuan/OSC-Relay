const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // we can also expose variables, not just functions
  setUDPPort: (port) => ipcRenderer.send('set-udp-port', port),
  setSocketPort: (port) => ipcRenderer.send('set-socket-port', port),
  setUDPOutPort: (port) => ipcRenderer.send('set-udp-out-port', port),
  onOSCMsg: (callback) =>
    ipcRenderer.on('osc-msg', (event, data) => callback(data)),
});
