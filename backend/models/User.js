/**
 * User (patient/admin) Model
 */

const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const { string } = require('@withvoid/make-validation/lib/validationTypes');

/**
 * Check for a strict string value
 * @param {string} val
 * @returns true if value is a string otherwise false
 */
function strictString(val) {
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
      values: ['patient', 'admin', 'moderator'],
      message: 'A Patient type can either be: patient or provider',
    },
    default: 'patient',
  },
  appointments: [
    {
      type: String,
      ref: 'Appointment',
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  image: String,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.password = sha1(this.password);

  this.passwordConfirmation = undefined;
  next();
});

UserSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
