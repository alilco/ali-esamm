const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// المسار الكامل إلى users.json
const usersFile = path.join(__dirname, 'public', 'users.json');

// جلب كل المستخدمين
app.get('/users', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'فشل في قراءة المستخدمين' });
    res.json(JSON.parse(data));
  });
});

// إنشاء مستخدم جديد (تسجيل حساب)
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  fs.readFile(usersFile, 'utf8', (err, data) => {
    let users = [];
    if (!err) users = JSON.parse(data);

    const exists = users.find(u => u.username === username);
    if (exists) return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });

    const newUser = {
      username,
      password,
      displayName: username,
      image: '',
      bio: '',
      friends: [],
      lastSeen: new Date().toISOString(),
      active: true
    };

    users.push(newUser);
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'فشل في حفظ المستخدم' });
      res.json({ success: true });
    });
  });
});

// تسجيل الدخول
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'خطأ في الخادم' });

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'بيانات غير صحيحة' });

    user.active = true;
    user.lastSeen = new Date().toISOString();

    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) return res.status(500).json({ error: 'فشل في التحديث' });
      res.json({ success: true });
    });
  });
});

// تحديث بيانات المستخدم
app.post('/update-user', (req, res) => {
  const updatedUsers = req.body;
  fs.writeFile(usersFile, JSON.stringify(updatedUsers, null, 2), err => {
    if (err) return res.status(500).json({ error: 'فشل في التحديث' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
