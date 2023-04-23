const Patient = require('../models/Patient');
const formatResponse = require('../utils/formatResponse');
const filterFields = require('../utils/filterFields');
const makeValidation = require('@withvoid/make-validation');

class PatientController {
  static async createPatient(req, res, next) {
    return res.status(500).json({
      message:
        'This route is  not defined. Kindly, use /signup to create account',
    });
  }

  static async getAllPatients(req, res, next) {
    try {
      const Patients = await Patient.find();
      const data = Patients.map((Patient) => formatResponse(Patient));

      return res.status(200).json({
        results: Patients.length,
        Patients: data,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getPatient(req, res, next) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res
          .status(404)
          .json({ error: 'Patient with this ID does not exist' });
      }

      return res.status(200).json({ patient: formatResponse(patient) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async updatePatient(req, res, next) {
    try {
      const patientId = req.params.id;
      if (!patientId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updatedPatient = await Patient.findByIdAndUpdate(
        { _id: patientId },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedPatient) {
        return res
          .status(404)
          .json({ error: 'Patient with this ID does not exist' });
      }

      return res.status(200).json({ Patient: formatResponse(updatedPatient) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deletePatient(req, res, next) {
    try {
      const patientId = req.params.id;
      if (!patientId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const patient = await Patient.findByIdAndDelete(patientId);

      if (!patient) {
        return res
          .status(404)
          .json({ error: 'Patient with this ID does not exist' });
      }

      return res.status(204).end({ status: 'success' });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getMe(req, res, next) {
    req.params.id = req.patient.id;
    next();
    req.patient.id;
  }

  static async updateMe(req, res, next) {
    const patientId = req.patient.id;
    if (!patientId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.body.password || req.body.passwordConfirmation) {
      return res.status(400).json({
        error:
          'Want to update your password? Kindly, use update password route',
      });
    }

    if (req.body.email) {
      return res.status(400).json({
        error: 'Want to update your email? Contact our support center',
      });
    }

    try {
      const filterredFields = filterFields(req.body, [
        'firstName',
        'lastName',
        'image',
      ]);
      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        filterredFields,
        { new: true, runValidators: true }
      );

      return res.status(200).json({ Patient: formatResponse(updatedPatient) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteMe(req, res, next) {
    console.log(req.patient);
    try {
      const patientId = req.patient.id;

      const patient = await Patient.findByIdAndUpdate(patientId, {
        active: false,
      });

      if (!patient) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(204).json({ status: 'success' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = PatientController;
