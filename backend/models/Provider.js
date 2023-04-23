const mongoose = require('mongoose');
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
  specialty: String,
  location: String,
  availabilty: Array,
  yearOfExperience: Number,
  numberOfPatientAttendedTo: Number,
  image: String,
});

// ProviderSchema.index({ location: 'text' });

const Provider = mongoose.model('Provider', ProviderSchema);
module.exports = Provider;
