# OSC Relay

Forwards messages from a UDP port to a websocket, and vice-versa. Useful for connecting p5.js and other browser applications to native applications or other computers.

Download the latest [release](/releases).

## Development

```
npm run start
```

Open [this starter sketch](https://editor.p5js.org/mngyuan/sketches/hA9CeepA-) and run it to connect to the websocket.

Send some OSC messages - you can use `utils/osc-simple.py` to get started. They should appear in the main window of OSC Relay and in the console in the p5.js editor.
