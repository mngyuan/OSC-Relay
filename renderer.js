const udpinPortInput = document.getElementById('udpinport');
const socketportInput = document.getElementById('socketport');
const socketoutportInput = document.getElementById('socketoutport');
const udpoutPortInput = document.getElementById('udpoutport');
document.getElementById('udpinportset').addEventListener('click', () => {
  electronAPI.setUDPPort(udpinPortInput.value);
});
document.getElementById('socketportset').addEventListener('click', () => {
  electronAPI.setSocketPort(socketportInput.value);
});
document.getElementById('udpoutportset').addEventListener('click', () => {
  electronAPI.setUDPOutPort(udpoutPortInput.value);
});
socketportInput.addEventListener('change', () => {
  socketoutportInput.value = socketportInput.value;
});

const messages = document.getElementById('messages');
electronAPI.onOSCMsg(({type, msg}) => {
  const item = document.createElement('li');
  item.innerHTML = `
  <div class="badge ${type}">${type}</div>
  <code>
    ${JSON.stringify(msg, null, 2)}
  </code>`;
  messages.appendChild(item);
});
