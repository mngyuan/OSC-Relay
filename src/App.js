import React, {useState, useEffect, useRef} from 'react';

const App = () => {
  const [UDPInAddress, setUDPInAddress] = useState('localhost');
  const [UDPInPort, setUDPInPort] = useState(9999);
  const [socketPort, setSocketPort] = useState(8081);
  const [UDPOutAddress, setUDPOutAddress] = useState('localhost');
  const [UDPOutPort, setUDPOutPort] = useState(9998);
  const [messages, setMessages] = useState([]);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  useEffect(() => {
    electronAPI.onOSCMsg((msg) => {
      setMessages((messages) => [...messages, msg]);
    });
    electronAPI.onWebsocketConnection((clientCount) =>
      clientCount > 0
        ? setWebsocketConnected(true)
        : setWebsocketConnected(false),
    );
  }, [electronAPI]);

  useEffect(() => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, [messages]);

  return (
    <>
      <div className="receiving" style={{backgroundColor: 'orange'}}>
        <div className="row">
          <label htmlFor="udpinport">Receiving OSC UDP Port</label>
          <div>
            <input
              type="number"
              id="udpinport"
              name="udpinport"
              className="port"
              required
              size="10"
              value={UDPInPort}
              onChange={(e) => setUDPInPort(e.target.value)}
              onBlur={(e) =>
                electronAPI.setUDPInPort({
                  address: UDPInAddress,
                  port: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="row">↓</div>

        <div className="row">
          <label htmlFor="socketport">
            OSC Websocket Port
            <div
              className="dot"
              style={{backgroundColor: websocketConnected ? 'green' : 'red'}}
            ></div>
          </label>
          <div>
            <input
              type="number"
              id="socketport"
              name="socketport"
              className="port"
              required
              size="10"
              value={socketPort}
              onChange={(e) => setSocketPort(e.target.value)}
              onBlur={(e) => electronAPI.setSocketPort(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="sending" style={{backgroundColor: 'yellow'}}>
        <div className="row">
          <label htmlFor="socketoutport">
            OSC Websocket Port
            <div
              className="dot"
              style={{backgroundColor: websocketConnected ? 'green' : 'red'}}
            ></div>
          </label>
          <div>
            <input
              type="number"
              id="socketoutport"
              name="socketoutport"
              className="port"
              required
              size="10"
              value={socketPort}
              disabled
            />
          </div>
        </div>

        <div className="row">↓</div>

        <div className="row">
          <label htmlFor="udpoutport">Sending OSC UDP Port</label>
          <div>
            <input
              type="number"
              id="udpoutport"
              name="udpoutport"
              className="port"
              required
              value={UDPOutPort}
              onChange={(e) => setUDPOutPort(e.target.value)}
              onBlur={(e) =>
                electronAPI.setUDPOutPort({
                  address: UDPOutAddress,
                  port: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="buttons">
        <button name="clear" onClick={() => setMessages([])}>
          Clear
        </button>
      </div>
      <ul id="messages">
        {messages.map(({type, msg}, i) => (
          <li key={i}>
            <div className={`badge ${type}`}>{type}</div>
            <code>{JSON.stringify(msg, null, 2)}</code>
          </li>
        ))}
      </ul>
    </>
  );
};

export default App;
