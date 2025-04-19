const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Connect to Firebase using firebase-admin.json
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    await db.collection('users').add({ email, password });
    res.redirect('/login.html');
  } catch (err) {
    res.send('❌ Error during signup.');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('email', '==', email)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      res.send('❌ Invalid credentials.');
    } else {
      res.redirect('/home.html');
    }
  } catch (err) {
    res.send('❌ Login failed.');
  }
});

// Redirect to home if user comes after login
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
