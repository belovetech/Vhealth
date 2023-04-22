const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  providerId: String,
  patientId: String,
  date: String,
  time: Date,
  status: {
    type: String,
    enum: {
      values: ['availability', 'on-going', 'non-availability'],
    },
    default: 'availability',
  },
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;
