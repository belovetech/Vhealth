const jwt = require('jsonwebtoken');
const redisClient = require('../database/redis');
const formatResponse = require('./formatResponse');
/**
 *Generate JWT token
 * @param {string} userId
 * @returns JWT token
 */
module.exports = async (user, res) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  await redisClient.set(`auth_${token}`, user._id, 60 * 60);
  res.cookie('token', token, {
    maxAge: 60 * 60,
    httpOnly: true,
    sameSite: 'none',
  });
  return res.status(200).send({
    token,
    user: formatResponse(user),
  });
};
