import React, { useState } from "react";
import { auth, database } from "./firebase";
import { ref, set, get } from "firebase/database";

const AddFriend = () => {
  const [username, setUsername] = useState("");

  const handleAddFriend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const friend = Object.values(users).find((user) => user.username === username);

      if (friend) {
        const friendsRef = ref(database, `friends/${currentUser.uid}`);
        set(friendsRef, {
          ...friend,
          addedAt: new Date().toISOString(),
        });
        alert("Friend added successfully!");
      } else {
        alert("User not found!");
      }
    } else {
      alert("No users found.");
    }
  };

  return (
    <div>
      <h2>Add Friend</h2>
      <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleAddFriend}>Add Friend</button>
    </div>
  );
};

export default AddFriend;
