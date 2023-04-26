/**
 * User (patient) Controller
 */

const User = require('../models/User');
const formatResponse = require('../utils/formatResponse');
const filterFields = require('../utils/filterFields');

class UserController {
  static async createUser(req, res, next) {
    return res.status(500).json({
      message:
        'This route is  not defined. Kindly, use /signup to create account',
    });
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find().exec();
      const data = users.map((User) => formatResponse(User));

      return res.status(200).json({
        results: users.length,
        users: data,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id).exec();
      if (!user) {
        return res
          .status(404)
          .json({ error: 'user with this ID does not exist' });
      }

      return res.status(200).json({ user: formatResponse(user) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async updateUser(req, res, next) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updatedUser = await User.findByIdAndUpdate(
        { _id: userId },
        req.body,
        { new: true, runValidators: true }
      ).exec();

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: 'user with this ID does not exist' });
      }

      return res.status(200).json({ user: formatResponse(updatedUser) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const user = await User.findByIdAndDelete(userId).exec();

      if (!user) {
        return res
          .status(404)
          .json({ error: 'user with this ID does not exist' });
      }

      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getMe(req, res, next) {
    req.params.id = req.user.id;
    next();
    req.user.id;
  }

  static async updateMe(req, res, next) {
    const userId = req.user.id;
    if (!userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.body.password || req.body.passwordConfirmation) {
      return res.status(400).json({
        error:
          'Want to update your password? Kindly, use update password route',
      });
    }

    if (req.body.email) {
      return res.status(400).json({
        error: 'Want to update your email? Contact our support center',
      });
    }

    try {
      const filterredFields = filterFields(req.body, [
        'firstName',
        'lastName',
        'image',
      ]);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        filterredFields,
        { new: true, runValidators: true }
      ).exec();

      return res.status(200).json({ user: formatResponse(updatedUser) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteMe(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByIdAndUpdate(userId, {
        active: false,
      }).exec();

      if (!user) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(204).end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = UserController;
