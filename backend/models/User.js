const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

function strictString(val) {
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(val)) throw new Error(`${val} should be a string`);
  return val;
}

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ''),
  },
  firstName: {
    type: String,
    required: [true, 'Pls, provide your firstname'],
    set: strictString,
  },
  lastName: {
    type: String,
    required: [true, 'Pls, provide your lastname'],
    set: strictString,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: [true, 'Kindly provide your email'],
    validate: [validator.isEmail, 'Pls, provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Kindly provide a password'],
    minLength: [8, 'Minimum length should be 8'],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Kindly re-enter your password'],
    validate: {
      validator(el) {
        return this.password === el;
      },
      message: 'Password are not the same!',
    },
  },
  role: {
    type: String,
    enum: {
      values: ['patient', 'provider'],
      message: 'A user type can either be: patient or provider',
    },
    default: 'patient',
  },
  image: String,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = sha1(this.password);

  this.passwordConfirmation = undefined;
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
