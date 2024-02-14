const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${electronAPI.chrome()}), Node.js (v${electronAPI.node()}), and Electron (v${electronAPI.electron()})`;

const inPortInput = document.getElementById('inport');
const outPortInput = document.getElementById('outport');
document.getElementById('inportset').addEventListener('click', () => {
  electronAPI.setUDPPort(inPortInput.value);
});
document.getElementById('outportset').addEventListener('click', () => {
  electronAPI.setSocketPort(outPortInput.value);
});

const messages = document.getElementById('messages');
electronAPI.onUDPOSCMsg((msg) => {
  const item = document.createElement('li');
  item.innerHTML = `<code>${JSON.stringify(msg, null, 2)}</code>`;
  messages.appendChild(item);
});
