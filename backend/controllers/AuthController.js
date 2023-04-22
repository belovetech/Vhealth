const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../database/redis');
const generateJWToken = require('../utils/generateJWToken');
const validator = require('email-validator');

class AuthController {
  static async signup(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400)({ message: 'Provide valid email' });
      }

      if (!password || password.length < 8) {
        return res.status(400)({ message: 'Provide valid password' });
      }

      const userExist = await User.findOne({ email });
      if (userExist) {
        return res
          .status(400)
          .json({ message: 'User with that email exist, Kindly login' });
      }

      const user = await User.create({ email, password });
      return res.status(201).json({
        status: 'success',
        data: {
          id: user._id,
          email,
          password: user.password,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
      if (!validator.validate(email)) {
        return res.status(400).json({ error: 'Invalid email' });
      }
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      user = await User.findOne({ email, password: sha1(password) });
      if (!user) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
      const token = generateJWToken(user._id.toString());
      await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60);

      res.cookie('token', token, {
        maxAge: 60 * 60,
        httpOnly: true,
        sameSite: 'none',
      });
      return res.status(200).send({
        token,
        data: {
          id: user._id,
          email,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async logout(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const token = authorization.split(' ')[1];
      if (token === undefined) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const valid = await redisClient.get(`auth_${token}`);
      console.log(valid);
      if (valid === null) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await redisClient.del(`auth_${token}`);
      res.status(200).end();
      res.cookie('token', 'loggedout', { maxAge: 10 });
    } catch (error) {
      console.log(error);
      if (error.message === 'invalid signature') {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (error.message === 'jwt malformed') {
        return res.status(500).json({ error: 'Server error...' });
      }
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async protect(req, res, next) {
    let token;
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    if (authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    try {
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findOne({
        _id: decoded.userId,
      });
      if (!currentUser) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      req.user = currentUser;
      next();
    } catch (error) {
      if (error.message === 'invalid signature') {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (error.message === 'jwt malformed') {
        return res.status(500).json({ error: 'Server error...' });
      }
      console.log(err);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = AuthController;
