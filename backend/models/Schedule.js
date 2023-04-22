const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  providerId: String,
  userId: String,
  date: Date,
  time: Date,
  status: {
    type: String,
    enum: {
      values: ['pending', 'held', 'cancelled'],
    },
    default: 'pending',
  },
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;
