const User = require('../models/User');
const formatResponse = require('../utils/formatResponse');

class UserController {
  static async createUser(req, res, next) {
    return res.status(500).json({
      message:
        'This route is  not defined. Kindly, use /signup to create account',
    });
  }

  static async getAllUsers(req, res, next) {
    try {
      const Users = await User.find();
      const data = Users.map((User) => formatResponse(User));

      return res.status(200).json({
        results: Users.length,
        Users: data,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getUser(req, res, next) {
    try {
      const User = await User.findById(req.params.id);
      if (!User) {
        return res
          .status(404)
          .json({ error: 'User with this ID does not exist' });
      }

      return res.status(200).json({ User: formatResponse(User) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { Userid } = req.headers;
      if (!Userid) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updatedUser = await User.findByIdAndUpdate(
        { _id: Userid },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: 'User with this ID does not exist' });
      }

      return res.status(200).json({ User: formatResponse(updatedUser) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { Userid } = req.headers;
      if (!Userid) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const User = await User.findByIdAndDelete(Userid);

      if (!User) {
        return res
          .status(404)
          .json({ error: 'User with this ID does not exist' });
      }

      return res.status(204).end({ status: 'success' });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getMe(req, res, next) {
    req.params.id = req.headers.Userid;
    next();
  }

  static async updateMe(req, res, next) {
    const { Userid } = req.headers;
    if (!Userid) {
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
        'userName',
      ]);
      const updatedUser = await User.findByIdAndUpdate(
        Userid,
        filterredFields,
        { new: true, runValidators: true }
      );

      return res.status(200).json({ User: formatResponse(updatedUser) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteMe(req, res, next) {
    try {
      const { Userid } = req.headers;

      const User = await User.findByIdAndUpdate(Userid, {
        active: false,
      });

      if (!User) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(204).json({ status: 'success' });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = UserController;
