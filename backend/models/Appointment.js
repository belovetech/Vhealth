/**
 * Appointment Schema
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AppointmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/-/g, ''),
    },
    doctor: {
      type: String,
      ref: 'Provider',
    },
    patient: {
      type: String,
      ref: 'User',
    },
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
    collection: 'appointments',
  }
);

AppointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'patient doctor',
    select: '-__v',
  });
  next();
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
