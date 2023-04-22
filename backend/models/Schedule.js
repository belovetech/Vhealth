const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  providerId: String,
  date: String,
  time: Date,
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);
module.exports = Schedule;
