const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateToken } = require('./token');

function validatePassword(password) {
  // Password validation logic goes here
  console.log(password, !password);
  if(!password || password?.length <1) return false
  return true;
}

function validateEmail(email) {
  // Email validation logic goes here
  if(!email || email?.length<5) return false
  return true;
}


router.post('/', async (req, res) => {
  const {email, password } = req.body;
  if (!validateEmail(email)) {
    res.status(422).json({ message: 'Invalid email format' });
    return;
  }

  if (!validatePassword(password)) {
    res.status(422).json({ message: 'Invalid password' });
    return;
  }
  try {
    // Select the user from the database based on their email
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 1) {
      const user = rows[0];
      // Verify the password
      if (password === user.password) {
        // Generate a JWT token with the user ID and email
        const token = generateToken({ id: user.id, email: user.email });
        res.json({ 
          "id" : user.id,
          "name":user.name,
          "email":user.email,
          token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(404).json({ message: 'Invalid email' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
