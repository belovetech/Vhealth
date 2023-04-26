/* eslint-disable comma-dangle */
const express = require('express');
const ProviderController = require('../controllers/ProviderController');
const AuthController = require('../controllers/AuthController');
const restrictTo = require('../utils/restrictTo');

const router = express.Router();

// AUTHENTICATION AND AUTHORIZATION
router.use(AuthController.protect);

router.post('/location', ProviderController.searchProvider);
router.route('/').get(ProviderController.getAllProvider);

router
  .route('/:id')
  .get(ProviderController.getProvider)
  .patch(ProviderController.updateProvider)
  .delete(ProviderController.deleteProvider);

router.use(restrictTo(['admin', 'moderator']));
router.route('/').post(ProviderController.createProvider);
module.exports = router;
