const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/users', (req, res) => {
  const users = JSON.parse(fs.readFileSync('users.json'));
  res.json(users);
});

app.post('/users', (req, res) => {
  fs.writeFileSync('users.json', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
