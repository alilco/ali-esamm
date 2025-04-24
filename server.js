const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");

app.post("/signup", (req, res) => {
  const newUser = req.body;
  let users = [];

  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  }

  const userExists = users.find(u => u.username === newUser.username);
  if (userExists) {
    return res.json({ success: false, message: "اسم المستخدم موجود بالفعل." });
  }

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
