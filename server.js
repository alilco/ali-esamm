const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// تحميل المستخدمين
function loadUsers() {
  const data = fs.readFileSync("users.json", "utf8");
  return JSON.parse(data);
}

// حفظ المستخدمين
function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    user.lastSeen = "نشط الآن";
    saveUsers(users);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
});

// تسجيل مستخدم جديد
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const existing = users.find(u => u.username === username);
  if (existing) {
    res.json({ success: false, message: "اسم المستخدم موجود بالفعل" });
  } else {
    users.push({
      username,
      password,
      friends: [],
      lastSeen: "نشط الآن"
    });
    saveUsers(users);
    res.json({ success: true });
  }
});

// إضافة صديق
app.post("/add-friend", (req, res) => {
  const { username, friendUsername } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  const friend = users.find(u => u.username === friendUsername);

  if (!user || !friend) {
    return res.json({ success: false, message: "المستخدم غير موجود" });
  }

  if (!user.friends.includes(friendUsername)) {
    user.friends.push(friendUsername);
  }

  saveUsers(users);
  res.json({ success: true });
});

// البحث عن مستخدمين
app.get("/search", (req, res) => {
  const q = req.query.q;
  const users = loadUsers();
  const results = users.filter(u => u.username.includes(q));
  res.json(results.map(u => ({ username: u.username })));
});

// الحصول على بيانات مستخدم
app.get("/user/:username", (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.username === req.params.username);
  if (user) {
    res.json({
      username: user.username,
      lastSeen: user.lastSeen,
      friends: user.friends
    });
  } else {
    res.status(404).json({ error: "المستخدم غير موجود" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
