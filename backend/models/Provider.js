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
  availability: [String],
  unavailability: [String],
  yearOfExperience: Number,
  numberOfPatientAttendedTo: Number,
  appointments: [
    {
      type: string,
      ref: 'Appointment',
    },
  ],
  image: String,
});

// ProviderSchema.index({ location: 'text' });

const Provider = mongoose.model('Provider', ProviderSchema);
module.exports = Provider;
