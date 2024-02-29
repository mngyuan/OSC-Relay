const osc = require('osc');

// Bind to a UDP socket
let udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 9998,
  remoteAddress: '0.0.0.0',
  remotePort: 9999,
});

const portReadyCb = () => {
  console.log('Listening for OSC over UDP.');
  console.log(' Host: localhost Port:', udpPort.options.localPort);
};

udpPort.on('ready', portReadyCb);

udpPort.on('message', function (oscMessage) {
  console.log(oscMessage);
});

udpPort.open();
