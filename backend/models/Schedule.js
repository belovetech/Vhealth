const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  providerId: String,
  userId: String,
  date: Date,
  time: {
    type: String,
    required: true,
    enum: {
      values: [
        '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
      ],
    },
  },
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
