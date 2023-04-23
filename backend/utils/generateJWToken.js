const jwt = require('jsonwebtoken');

const generateJWToken = (patientId) => {
  const token = jwt.sign({ patientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

module.exports = generateJWToken;
