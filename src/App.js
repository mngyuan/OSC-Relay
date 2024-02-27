import React, {useState, useEffect, useRef} from 'react';

const App = () => {
  const [receiving, setReceiving] = useState(true);
  const [UDPInAddress, setUDPInAddress] = useState('localhost');
  const [UDPInPort, setUDPInPort] = useState(9999);
  const [socketPort, setSocketPort] = useState(8081);
  const [sending, setSending] = useState(true);
  const [UDPOutAddress, setUDPOutAddress] = useState('localhost');
  const [UDPOutPort, setUDPOutPort] = useState(9998);
  const [messages, setMessages] = useState([]);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const wsRef = useRef(websocketConnected);

  useEffect(() => {
    electronAPI.onOSCMsg((msg) => {
      if (wsRef.current === false) {
        // if we're visually telling the user the websocket is disconnected
        // even though it might be connected on the node side, let's filter
        // socket messages since osc.relay won't be forwarding them anyway
        console.log('filtered message', msg);
      } else {
        setMessages((messages) => [...messages, msg]);
      }
    });
    electronAPI.onWebsocketConnection(() => setWebsocketConnected(true));
  }, [electronAPI]);

  useEffect(() => {
    electronAPI.toggleUDPReceive(
      receiving ? {address: UDPInAddress, port: UDPInPort} : false,
    );
  }, [receiving]);

  useEffect(() => {
    electronAPI.toggleSocketSend(
      sending ? {address: UDPOutAddress, port: UDPOutPort} : false,
    );
  }, [sending]);

  useEffect(() => {
    // osc.relay doesn't work for some reason when reestablishing UDPPort,
    // so we'll tell the user to reconnect the websocket
    setWebsocketConnected(false);
  }, [UDPInPort, UDPOutPort, receiving]);

  // need this to read the current value of websocketConnected in our useEffect
  useEffect(() => {
    wsRef.current = websocketConnected;
  });

  useEffect(() => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, [messages]);

  return (
    <>
      <div
        className="receiving"
        style={{backgroundColor: receiving ? 'orange' : 'grey'}}
      >
        <div className="row">
          <div onClick={() => setReceiving(!receiving)}>
            <input
              type="checkbox"
              name="receiving"
              checked={receiving}
              onChange={(e) => setReceiving(!receiving)}
            />
            <label htmlFor="receiving"> Enable</label>
          </div>
        </div>
        <div className="row">
          <label htmlFor="udpinport">Receiving OSC UDP Port</label>
          <div>
            {/*
            <input
              id="udpinaddress"
              name="udpinaddress"
              className="address"
              required
              size="10"
              value={UDPInAddress}
              onChange={(e) => setUDPInAddress(e.target.value)}
              onBlur={(e) =>
                receiving &&
                electronAPI.setUDPInPort({
                  address: e.target.value,
                  port: UDPInPort,
                })
              }
            />
            */}
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
                receiving &&
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

      <div
        className="sending"
        style={{backgroundColor: sending ? 'yellow' : 'grey'}}
      >
        <div className="row">
          <div onClick={() => setSending(!sending)}>
            <input
              type="checkbox"
              name="sending"
              checked={sending}
              onChange={(e) => setSending(!sending)}
            />
            <label htmlFor="sending"> Enable</label>
          </div>
        </div>
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
            {/* 
            <input
              id="udpoutaddress"
              name="udpoutaddress"
              className="address"
              required
              size="10"
              value={UDPOutAddress}
              onChange={(e) => setUDPOutAddress(e.target.value)}
              onBlur={(e) =>
                sending &&
                electronAPI.setUDPOutPort({
                  address: e.target.value,
                  port: UDPOutPort,
                })
              }
            />
            */}
            <input
              type="number"
              id="udpoutport"
              name="udpoutport"
              className="port"
              required
              value={UDPOutPort}
              onChange={(e) => setUDPOutPort(e.target.value)}
              onBlur={(e) =>
                sending &&
                electronAPI.setUDPOutPort({
                  address: UDPOutAddress,
                  port: e.target.value,
                })
              }
            />
          </div>
        </div>
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
