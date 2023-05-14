const jwt = require('jsonwebtoken');
const secretKey = 'secret';
const pool = require('../db');

function verifyToken(req, res, next) {
  // Get the token from the request headers or query parameters
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach the decoded user object to the request

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await pool.execute(query, [userId]);

  if (rows.length === 1) {
    return rows[0];
  } else {
    return null;
  }
}

module.exports = {
  verifyToken,
  getUserById
};
