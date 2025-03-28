const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateToken } = require('./token');

function validatePassword(password) {
  // Password validation logic goes here
  if(password.length <8) return false
  return true;
}

function validateEmail(email) {
  // Email validation logic goes here
  if(email.length<5) return false
  return true;
}

function validateName(name) {
  // Password validation logic goes here
  if(!name || name.length <3) return false
  return true;
}

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!validateEmail(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  if (!validateName(name)) {
    res.status(400).json({ message: 'Invalid name' });
    return;
  }

  if (!validatePassword(password)) {
    res.status(400).json({ message: 'Invalid password' });
    return;
  }

  try {
    // Check if the email already exists
    const [emailRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (emailRows.length > 0) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // Insert the new user into the database
    const [insertResult] = await pool.execute('INSERT INTO users (email, password,name) VALUES (?, ?, ?)', [email, password,name]);
    // Generate a JWT token with the new user's ID and email
    const newUser = {
      id: insertResult.insertId,
      email,
      role: 'user',
      name
    };
    const token = generateToken(newUser);
    res.json({ 
      "name":name,
      "email":email,
      "role":'user',
      token 
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
