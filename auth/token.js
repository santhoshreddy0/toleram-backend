const jwt = require('jsonwebtoken');
const config = require('../config');

const secretKey = config.jwtSecret;;

function generateToken(payload) {
  return jwt.sign(payload, secretKey);
}

module.exports = {
  generateToken
};
