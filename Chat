import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase";
import { ref, push, onValue } from "firebase/database";

const Chat = ({ friend }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const chatRef = ref(database, `chats/${auth.currentUser.uid}_${friend.uid}`);
    onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(Object.values(snapshot.val()));
      } else {
        setMessages([]);
      }
    });
  }, [friend]);

  const sendMessage = () => {
    const chatRef = ref(database, `chats/${auth.currentUser.uid}_${friend.uid}`);
    push(chatRef, {
      sender: auth.currentUser.uid,
      text: message,
      timestamp: new Date().toISOString(),
    });
    setMessage("");
  };

  return (
    <div>
      <h2>Chat with {friend.username}</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender === auth.currentUser.uid ? "You" : friend.username}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
