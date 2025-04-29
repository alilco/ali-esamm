import React, { useEffect, useState } from 'react';
import './App.css';

import {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  ref,
  push,
  onValue,
  query,
  orderByChild
} from './firebase';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Listen for auth state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // Listen for messages in Realtime DB
  useEffect(() => {
    if (!user) return;

    const messagesRef = query(ref(db, 'messages'), orderByChild('timestamp'));
    onValue(messagesRef, (snapshot) => {
      const list = [];
      snapshot.forEach((childSnapshot) => {
        list.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setMessages(list);
    });
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login failed!");
      console.error(error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMessageRef = push(ref(db, 'messages'));
    set(newMessageRef, {
      text: newMessage,
      uid: user.uid,
      displayName: user.email,
      timestamp: Date.now()
    });

    setNewMessage('');
  };

  return (
    <div className="App">
      <header>
        <h1>💬 Messenger Clone</h1>
        {user && <button onClick={handleLogout}>Logout</button>}
      </header>

      {!user ? (
        <div className="login">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Sign In</button>
        </div>
      ) : (
        <>
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.uid === user.uid ? 'sent' : 'received'}`}>
                <strong>{msg.displayName}</strong>: {msg.text}
              </div>
            ))}
          </div>
          <div className="input-box">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
