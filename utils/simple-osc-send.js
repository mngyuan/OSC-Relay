const osc = require('osc');

// Bind to a UDP socket
let udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 9997,
  medadata: true,
  broadcast: true,
});

const portReadyCb = () => {
  console.log(
    ' Host:',
    udpPort.options.remoteAddress,
    'Port:',
    udpPort.options.remotePort,
  );

  udpPort.send(
    {
      address: '/hello',
      args: ['world'],
    },
    'localhost',
    9997,
  );
};

udpPort.on('ready', portReadyCb);

udpPort.open();
