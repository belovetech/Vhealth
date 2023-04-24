const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const User = require('../models/User');
const makeValidation = require('@withvoid/make-validation');
const sendEmail = require('../utils/sendEmail');

class AppointementController {
  static async bookAppointement(req, res, next) {
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          providerId: { type: types.string },
          date: { type: types.string },
          time: { type: types.string },
        },
      }));
      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const userId = req.user.id;
      const { providerId, date, time } = req.body;
      const provider = await Provider.findById(providerId);
      if (!provider) {
        return res
          .status(404)
          .json({ error: 'There is no provider with this ID' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'There is no user with this ID' });
      }

      //TODO: Take care of already passed time
      const timeAvailable = provider.availability.some((t) => t === time);
      if (!timeAvailable) {
        return res.status(400).json({ error: 'Time is not available' });
      } else {
        provider.unavailability.push(time);
        const index = provider.availability.indexOf(time);
        provider.availability.splice(index, 1);
        provider.save();
      }

      const appointment = await Appointment.create({
        providerId,
        userId,
        date,
        time,
      });

      const job = {
        date,
        time,
        email: user.email,
        firstName: user.firstName,
        provider: provider.fullName,
      };
      // Send notification
      // keep records of both the provider and patient
      await sendEmail('Booking appointment', 'immediate', job, 0);
      Promise.allSettled([
        await sendEmail('Appointment Reminder', '10mins', job, 10),
        await sendEmail('Appointment Time', 'exactTime', job, 1),
      ])
        .then((res) => console.log(res))
        .then((err) => console.log(err));

      return res.status(201).json({
        id: appointment._id,
        provider: {
          fullName: provider.fullName,
          specialty: provider.specialty,
        },
        user: {
          fullName: user.firstName + ' ' + user.lastName,
        },
        appointment: {
          date,
          time,
          status: appointment.status,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server error...' });
    }
  }

  static async cancelAppointement(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          providerId: { type: types.string },
          time: { type: types.string },
        },
      }));
      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { providerId, date, time } = req.body;
      const provider = await Provider.findById(providerId);
      if (!provider) {
        return res
          .status(404)
          .json({ error: 'There is no provider with this ID' });
      }

      //TODO: Take care of already passed time
      const timeAvailable = provider.unavailability.some((t) => t === time);
      if (!timeAvailable) {
        return res.status(400).json({ error: 'Invalid Time' });
      } else {
        provider.availability.push(time);
        const index = provider.unavailability.indexOf(time);
        provider.unavailability.splice(index, 1);
        provider.save();
      }

      const job = {
        date: date || 0,
        time: time || 0,
        email: user.email,
        firstName: user.firstName,
        provider: provider.fullName,
      };

      // send cancellation notification
      await sendEmail('Cancelled appointment', 'cancel', job, 0);

      // update records of both the provider and patient

      return res
        .status(200)
        .json({ message: 'Appointment successfully cancelled' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server error...' });
    }
  }
}

module.exports = AppointementController;
