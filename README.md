# OSC Relay

<img src="OSC Relay.png" alt="An application titled OSC Relay showing OSC messages forwarded from UDP to a websocket and vice-versa" width="300"/>

Forwards messages from a UDP port to a websocket, and vice-versa. Useful for connecting p5.js and other browser applications to native applications or other computers.

Download the latest [release](https://github.com/mngyuan/OSC-Relay/releases).

## Development

```
npm run start
```

Open [this starter sketch](https://editor.p5js.org/mngyuan/sketches/hA9CeepA-) and run it to connect to the websocket.

Send some OSC messages - you can the scripts in [`utils/`](/utils) to get started. Messages received should appear in the main window of OSC Relay and in the console in the p5.js editor.
