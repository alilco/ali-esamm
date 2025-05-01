import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import AddFriend from "./AddFriend";
import Chat from "./Chat";

function App() {
  const [friend, setFriend] = React.useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/add-friend" element={<AddFriend />} />
        <Route path="/chat" element={<Chat friend={friend} />} />
      </Routes>
    </Router>
  );
}

export default App;
