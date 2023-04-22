const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ''),
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
  role: {
    type: String,
    enum: {
      values: ['patient', 'provider'],
      message: 'A user type can either be: patient or provider',
    },
    default: 'patient',
  },
  userName: String,
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
