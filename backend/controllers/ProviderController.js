/**
 * Provider Controller
 */

const Provider = require('../models/Provider');
const makeValidation = require('@withvoid/make-validation');
const APIfeatures = require('../utils/apiFeatures');
const formatProviderResponse = require('../utils/formatProvider');
const capitalize = require('../utils/capitalize');

class ProviderController {
  static async createProvider(req, res, next) {
    try {
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          fullName: { type: types.string },
          bio: { type: types.string },
          specialty: { type: types.string },
          location: { type: types.string },
          yearOfExperience: { type: types.string },
          numberOfPatientAttendedTo: { type: types.string },
        },
      }));

      if (!validation.success) {
        return res.status(400).json({ ...validation });
      }

      const {
        fullName,
        bio,
        specialty,
        location,
        yearOfExperience,
        numberOfPatientAttendedTo,
        availability,
      } = req.body;

      const provider = await Provider.create({
        fullName,
        bio,
        specialty: capitalize(specialty),
        location: capitalize(location),
        yearOfExperience,
        numberOfPatientAttendedTo,
        availability,
      });

      return res.status(201).json(formatProviderResponse(provider));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server error...' });
    }
  }

  static async getAllProvider(req, res, next) {
    try {
      const query = {};
      for (let [key, value] of Object.entries(req.query)) {
        query[key] = capitalize(value);
      }

      const features = new APIfeatures(Provider.find(), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const providers = await features.query;

      const data = providers.map((provider) =>
        formatProviderResponse(provider)
      );

      return res.status(200).json({
        results: providers.length,
        providers: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async getProvider(req, res, next) {
    try {
      const provider = await Provider.findById(req.params.id);
      if (!provider) {
        return res
          .status(404)
          .json({ error: 'Provider with this ID does not exist' });
      }

      return res
        .status(200)
        .json({ provider: formatProviderResponse(provider) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async updateProvider(req, res, next) {
    try {
      const providerId = req.params.id;
      if (!providerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updatedProvider = await Provider.findByIdAndUpdate(
        { _id: providerId },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedProvider) {
        return res
          .status(404)
          .json({ error: 'Provider with this ID does not exist' });
      }
      return res
        .status(200)
        .json({ provider: formatProviderResponse(updatedProvider) });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async deleteProvider(req, res, next) {
    try {
      const providerId = req.params.id;

      if (!providerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const provider = await Provider.findByIdAndDelete(providerId);

      if (!provider) {
        return res
          .status(404)
          .json({ error: 'Provider with this ID does not exist' });
      }

      return res.status(200).json({ status: 'success' });
    } catch (err) {
      return res.status(500).json({ error: 'Server Error' });
    }
  }

  static async searchProvider(req, res, next) {
    try {
      const providerId = req.user.id;

      if (!providerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const location = req.body.location;

      const providers = await Provider.find({
        location: { $regex: /cal/i },
      });

      const data = providers.map((provider) =>
        formatProviderResponse(provider)
      );

      return res.status(200).json({
        results: providers.length,
        providers: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Server Error' });
    }
  }
}

module.exports = ProviderController;
