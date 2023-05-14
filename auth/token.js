const jwt = require('jsonwebtoken');
const secretKey = 'secret';

function generateToken(payload) {
  return jwt.sign(payload, secretKey);
}

module.exports = {
  generateToken
};
