/**
 * Authentication Controller
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redisClient = require('../database/redis');
const generateJWToken = require('../utils/generateJWToken');
const makeValidation = require('@withvoid/make-validation');
const formatResponse = require('../utils/formatResponse');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const sha1 = require('sha1');

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

      const { email, password } = req.body;
      let user = await User.findOne({ email }).exec();
      if (!user) {
        return res
          .status(400)
          .json({ status: 'failed', error: 'user not found' });
      }
      user = await User.findOne({ email, password: sha1(password) });
      if (!user) {
        return res
          .status(400)
          .json({ status: 'failed', error: 'Invalid login credentials' });
      }
      await generateJWToken(user, res);
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
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ status: 'failed', error: 'No User found' });
      }
      const resetToken = await user.forgetPasswordResetToken();

      const job = {
        firstName: user.firstName,
        resetLink: `${process.env.BASE_URL}/auth/resetPassword/${resetToken}`,
        email,
      };

      await sendEmail('Reset Password', 'reset', job, 0);

      return res.status(200).json({
        status: 'success',
        message: `Forget password token sent to ${email}`,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong....' });
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      console.log(hashedToken);
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(404).json({
          status: 'failed',
          error: 'Token is invalid or has expired.',
        });
      }

      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          password: { type: types.string },
          passwordConfirmation: { type: types.string },
        },
      }));
      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { password, passwordConfirmation } = req.body;

      user.password = password;
      user.passwordConfirmation = passwordConfirmation;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      await generateJWToken(user, res);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong....' });
    }
  }
  static async updatePassword(req, res, next) {
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          passwordCurrent: { type: types.string },
          password: { type: types.string },
          passwordConfirmation: { type: types.string },
        },
      }));
      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { passwordCurrent, password, passwordConfirmation } = req.body;

      const user = await User.findOne({ email: currentPassword }).select(
        '+password'
      );

      if (user.password !== hash1(passwordCurrent)) {
        return res.status(401).json({
          status: 'failed',
          error: 'Your current password is incorrect',
        });
      }

      user.password = password;
      user.passwordConfirmation = passwordConfirmation;
      await user.save();

      await generateJWToken(user, res);
    } catch (error) {
      console.log(error);
      if (error.errors.passwordConfirmation) {
        return res.status(400).json({
          status: 'failed',
          error: error.errors.passwordConfirmation.message,
        });
      }
      return res
        .status(500)
        .json({ status: 'failed', error: 'Something went wrong....' });
    }
  }
}

module.exports = AuthController;
