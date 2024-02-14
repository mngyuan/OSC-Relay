const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
  setUDPPort: (port) => ipcRenderer.send('set-udp-port', port),
  setSocketPort: (port) => ipcRenderer.send('set-socket-port', port),
  onUDPOSCMsg: (callback) =>
    ipcRenderer.on('udp-osc-msg', (event, msg) => callback(msg)),
});
