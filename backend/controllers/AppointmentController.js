/**
 * Apointment Controller
 * book appoointment and cancle appointment endpoints handlers
 */

const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const User = require('../models/User');
const makeValidation = require('@withvoid/make-validation');
const sendEmail = require('../utils/sendEmail');
const APIfeatures = require('../utils/apiFeatures');

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

      const timeAvailable = provider.availability.some((t) => t === time);
      if (
        !timeAvailable ||
        Number(new Date(`${date} ${time}`)) <= Number(new Date())
      ) {
        return res.status(400).json({
          error:
            'Date and Time are not available, Kindly select another available date and time',
        });
      }
      const appointment = await Appointment.create({
        providerId,
        userId,
        date,
        time,
      });

      if (!appointment) {
        return res.status(500).json({ error: 'Server Error' });
      }
      user.appointments = appointment._id;
      provider.appointments = appointment._id;

      provider.unavailability.push(time);
      const index = provider.availability.indexOf(time);
      provider.availability.splice(index, 1);
      provider.save();
      user.save({ validateBeforeSave: false });

      const job = {
        date,
        time,
        email: user.email,
        firstName: user.firstName,
        provider: provider.fullName,
      };

      await sendEmail('Booking appointment', 'immediate', job, 0);
      Promise.allSettled([
        await sendEmail('Appointment Reminder', '10mins', job, 10),
        await sendEmail('Appointment Time', 'exactTime', job, 1),
      ]);

      // TODO: update records of both the provider and patient
      //TODO:  update the appointment status

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
      let user = await User.findById(userId).exec();
      if (!user) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          date: { type: types.string },
          time: { type: types.string },
        },
      }));
      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { date, time } = req.body;
      const { appointmentId } = req.params;

      const appointment = await Appointment.findById(appointmentId).exec();

      const provider = await Provider.findById(appointment.doctor).exec();
      if (!provider) {
        return res.status(404).json({ error: 'No provider with this ID' });
      }

      user = await User.findById(appointment.patient).exec();
      if (!user) {
        return res.status(404).json({ error: 'No user with this ID' });
      }

      const timeUnavailable = provider.unavailability.some((t) => t === time);
      if (!timeUnavailable) {
        return res.status(400).json({ error: 'Invalid Time' });
      }

      const job = {
        date: date,
        time: time,
        email: user.email,
        firstName: user.firstName,
        provider: provider.fullName,
      };

      // send cancellation email and update appointment's status
      await sendEmail('Cancelled appointment', 'cancel', job, 0);
      appointment.status = 'cancelled';
      appointment.save();

      // update provider's availability
      provider.availability.push(time);
      const index = provider.unavailability.indexOf(time);
      provider.unavailability.splice(index, 1);
      provider.save();

      // TODO: update records of both the provider and patient
      return res
        .status(200)
        .json({ message: 'Appointment successfully cancelled' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server error...' });
    }
  }

  static async getAllAppointment(req, res, next) {
    try {
      const query = {};
      for (let [key, value] of Object.entries(req.query)) {
        query[key] = capitalize(value);
      }

      const features = new APIfeatures(Appointment.find(), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const appointments = await features.query;

      return res.status(200).json({
        results: appointments.length,
        appointments,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = AppointementController;
