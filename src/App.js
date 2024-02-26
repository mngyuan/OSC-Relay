import React, {useState, useEffect} from 'react';

const App = () => {
  const [UDPInPort, setUDPInPort] = useState(9999);
  const [socketPort, setSocketPort] = useState(8081);
  const [UDPOutPort, setUDPOutPort] = useState(9998);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    electronAPI.onOSCMsg((msg) => {
      setMessages((messages) => [...messages, msg]);
    });
  }, [electronAPI]);

  return (
    <>
      <div className="row">
        <label htmlFor="udpinport">Receiving OSC UDP Port</label>
        <div>
          <input
            type="number"
            id="udpinport"
            name="udpinport"
            required
            size="10"
            value={UDPInPort}
            onChange={(e) => setUDPInPort(e.target.value)}
            onBlur={(e) => electronAPI.setUDPPort(e.target.value)}
          />
          <button
            id="udpinportset"
            onClick={() => electronAPI.setUDPPort(UDPInPort)}
          >
            Set
          </button>
        </div>
      </div>

      <div className="row">↓</div>

      <div className="row">
        <label htmlFor="socketport">OSC Websocket Port</label>
        <div>
          <input
            type="number"
            id="socketport"
            name="socketport"
            required
            size="10"
            value={socketPort}
            onChange={(e) => setSocketPort(e.target.value)}
            onBlur={(e) => electronAPI.setSocketPort(e.target.value)}
          />
          <button
            id="socketportset"
            onClick={() => electronAPI.setSocketPort(socketPort)}
          >
            Set
          </button>
        </div>
      </div>

      <br />

      <div className="row">
        <label htmlFor="socketoutport">OSC Websocket Port</label>
        <div>
          <input
            type="number"
            id="socketoutport"
            name="socketoutport"
            required
            size="10"
            value={socketPort}
            disabled
          />
          <button id="socketoutportset" disabled>
            Set
          </button>
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
            required
            value={UDPOutPort}
            onChange={(e) => setUDPOutPort(e.target.value)}
            onBlur={(e) => electronAPI.setUDPOutPort(e.target.value)}
          />
          <button
            id="udpoutportset"
            onClick={() => electronAPI.setUDPOutPort(UDPOutPort)}
          >
            Set
          </button>
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
