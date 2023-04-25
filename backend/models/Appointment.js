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
