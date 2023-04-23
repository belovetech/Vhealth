const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    providerId: String,
    userId: String,
    date: String,
    time: String,
    status: {
      type: String,
      enum: {
        values: ['pending', 'held', 'cancelled'],
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'appointements',
  }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
