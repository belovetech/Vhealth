const jwt = require('jsonwebtoken');
/**
 *Generate JWT token
 * @param {string} userId
 * @returns JWT token
 */
module.exports = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};
