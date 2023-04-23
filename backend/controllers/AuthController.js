const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const redisClient = require('../database/redis');
const generateJWToken = require('../utils/generateJWToken');
const validator = require('email-validator');
const makeValidation = require('@withvoid/make-validation');
const formatResponse = require('../utils/formatResponse');

class AuthController {
  static async signup(req, res, next) {
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          firstName: { type: types.string },
          lastName: { type: types.string },
          email: { type: types.string },
          password: { type: types.string },
          passwordConfirmation: { type: types.string },
        },
      }));

      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const { firstName, lastName, email, password, passwordConfirmation } =
        req.body;

      const patientExist = await Patient.findOne({ email });
      if (patientExist) {
        return res
          .status(400)
          .json({ message: 'Patient with that email exist, Kindly login' });
      }

      const patient = await Patient.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
      });
      return res.status(201).json({
        status: 'success',
        patient: formatResponse(patient),
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          email: { type: types.string },
          password: { type: types.string },
        },
      }));

      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      let patient = await Patient.findOne({ email });
      if (!patient) {
        return res.status(400).json({ error: 'patient not found' });
      }
      patient = await Patient.findOne({ email, password: sha1(password) });
      if (!patient) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
      const token = generateJWToken(patient._id.toString());
      await redisClient.set(`auth_${token}`, patient._id.toString(), 60 * 60);

      res.cookie('token', token, {
        maxAge: 60 * 60,
        httpOnly: true,
        sameSite: 'none',
      });
      return res.status(200).send({
        token,
        Patient: formatResponse(patient),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async logout(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const token = authorization.split(' ')[1];
      if (token === undefined) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const patient = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== patient.patientId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await redisClient.del(`auth_${token}`);
      res.cookie('token', 'loggedout', { maxAge: 10 });
      return res.status(200).json({ message: 'You have sucessfully logout' });
    } catch (error) {
      console.log(error);
      if (error.message === 'invalid signature') {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (error.message === 'jwt malformed') {
        return res.status(500).json({ error: 'Server error...' });
      }
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async protect(req, res, next) {
    let token;
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    if (authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
    try {
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentPatient = await Patient.findOne({
        _id: decoded.patientId,
      });
      if (!currentPatient) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      req.patient = formatResponse(currentPatient);
      next();
    } catch (error) {
      if (error.message === 'invalid signature') {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      if (error.message === 'jwt malformed') {
        return res.status(500).json({ error: 'Server error...' });
      }
      console.log(err);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = AuthController;
