const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

const ProviderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4().replace(/-/g, ''),
  },
  fullName: {
    type: String,
    trim: true,
    required: [true, 'Kindly provide your fullName'],
  },
  bio: String,
  service: String,
  yearOfExperience: Number,
  NumberOfPatient: Number,
  image: String,
});

const User = mongoose.model('User', ProviderSchema);
module.exports = User;
