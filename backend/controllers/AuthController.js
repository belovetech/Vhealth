/**
 * Authentication Controller
 */
const crypto = require('crypto');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../database/redis');
const generateJWToken = require('../utils/generateJWToken');
const makeValidation = require('@withvoid/make-validation');
const formatResponse = require('../utils/formatResponse');
const sendEmail = require('../utils/sendEmail');

class AuthController {
  static async signup(req, res, next) {
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          firstName: { type: types.string },
          lastName: { type: types.string },
          email: { type: types.string },
          password: { type: types.string },
          passwordConfirmation: { type: types.string },
        },
      }));

      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { firstName, lastName, email, password, passwordConfirmation } =
        req.body;

      const userExist = await User.findOne({ email }).exec();
      if (userExist) {
        return res.status(400).json({
          status: 'failed',
          error: 'user with that email exist, Kindly login',
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
      });
      return res.status(201).json({
        status: 'success',
        user: formatResponse(user),
      });
    } catch (error) {
      if (error.errors.passwordConfirmation) {
        return res
          .status(400)
          .json({ error: error.errors.passwordConfirmation.message });
      }
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong.' });
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          email: { type: types.string },
          password: { type: types.string },
        },
      }));

      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      let user = await User.findOne({ email }).exec();
      if (!user) {
        return res
          .status(400)
          .json({ status: 'failed', error: 'user not found' });
      }
      user = await User.findOne({ email, password });
      if (!user) {
        return res
          .status(400)
          .json({ status: 'failed', error: 'Invalid login credentials' });
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
        user: formatResponse(user),
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong.' });
    }
  }

  static async logout(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res
          .status(401)
          .json({ status: 'failed', error: 'Unauthorised' });
      }
      if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const token = authorization.split(' ')[1];
      if (token === undefined) {
        return res
          .status(401)
          .json({ status: 'failed', error: 'Unauthorised' });
      }
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ status: 'failed', error: 'Forbidden' });
      }
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== user.userId) {
        return res.status(403).json({ status: 'failed', error: 'Forbidden' });
      }
      await redisClient.del(`auth_${token}`);
      res.cookie('token', 'loggedout', { maxAge: 10 });
      return res
        .status(200)
        .json({ status: 'success', message: 'You have sucessfully logout' });
    } catch (error) {
      console.log(error);
      if (error.message === 'invalid signature') {
        return res
          .status(401)
          .json({ status: 'failed', error: 'Unauthorised' });
      }
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong.' });
    }
  }

  static async protect(req, res, next) {
    let token;
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ status: 'failed', error: 'Unauthorised' });
    }
    if (authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({ status: 'failed', error: 'Unauthorised' });
    }
    try {
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ status: 'failed', error: 'Forbidden' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentuser = await User.findOne({
        _id: decoded.userId,
      });
      if (!currentuser) {
        return res
          .status(401)
          .json({ status: 'failed', error: 'Unauthorised' });
      }
      req.user = formatResponse(currentuser);
      next();
    } catch (error) {
      if (error.message === 'invalid signature') {
        return res
          .status(401)
          .json({ status: 'failed', error: 'Unauthorised' });
      }
      if (error.message === 'jwt malformed') {
        return res
          .status(500)
          .json({ status: 'failed', error: 'Something went wrong....' });
      }
      console.log(error);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong....' });
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res
          .status(404)
          .json({ status: 'failed', error: 'No User found' });
      }
      const resetToken = crypto.randomBytes(32).toString('hex');
      await redisClient.set(`Reset_${resetToken}`, user._id, 10 * 60 * 1000);

      await sendEmail('Reset Password', 'reset', job, 0);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong....' });
    }
  }
}

module.exports = AuthController;
