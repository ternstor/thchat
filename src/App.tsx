import React from 'react';
import {uniqueNamesGenerator, colors, animals} from 'unique-names-generator';
import {formatRelative} from 'date-fns'
import './App.css';
import { socket } from './socket';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const randomColor = require('randomcolor');

type Message = {
  username: string
  timestamp: Date
  content: string
}

type User = Record<string, string>;
type Users = Record<string, User>;

function App() {
  const [isConnected, setIsConnected] = React.useState(socket.connected);
  // const [messageEvents, setMessageEvents] = React.useState([]);

  const uniqueUserName = uniqueNamesGenerator({dictionaries: [colors, animals]})

  const [username, setUsername] = React.useState(uniqueUserName);
  const [messages, setMessages] = React.useState<Array<Message>>([]);
  const [messageContent, setMessageContent] = React.useState("");
  const initialUser = {
    username: username,
    initials: getInitials(username),
    color: randomColor({luminosity: 'light'}).toString()
  }
  const [users, setUsers] = React.useState<Users>({});

  React.useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message.ack', onMessageAckEvent);
    socket.on('init.done', onInitDoneEvent);

    socket.emit('init', initialUser);

    function onMessageAckEvent(data: any) {
      setUsers(users => { return {...users, ...data.user} });
      setMessages(messages => [...messages, data.message]);
    }
    function onInitDoneEvent(data: any) {
      setUsers(data.users);
      setMessages(data.messages);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message.ack', onMessageAckEvent);
      socket.off('init.done', onInitDoneEvent);
    };
  }, []);

  function getInitials(pythonCaseName: string) {
    const [first, last] = pythonCaseName.split('_');
    return (first[0] + last[0]).toUpperCase();
  }

  function sendMessage() {
    if (messageContent.trim() === "") {
      return;
    }
    const newMessage: Message = {username: username, timestamp: new Date(), content: messageContent};
    socket.emit('message.new', newMessage);
    setMessageContent('');
  }
  return (
    <div className="App">
      <p>You are: {username}</p>
      <ol>
        {
          messages.map((msg, i) =>
          <li key={i} className={msg.username === username ? "own-message" : ""}>
            <div
              className={msg.username === username ? "right-circle" : "left-circle"}
              style={{backgroundColor: users[msg.username].color}}>
                {users[msg.username].initials}
            </div>
            <div>{msg.username}: {msg.content}</div>
            <span>{formatRelative(new Date(msg.timestamp), new Date())}</span>
          </li>)
        }
      </ol>
      <div id="chatbox">
        <input placeholder="Write here" value={messageContent} onChange={e => setMessageContent(e.target.value)}></input>
        <button onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
}

export default App;
