/* eslint-disable comma-dangle */
const express = require('express');
const ProviderController = require('../controllers/ProviderController');
const AuthController = require('../controllers/AuthController');
const restrictTo = require('../utils/restrictTo');

const router = express.Router();

router.use(AuthController.protect);
router.use(restrictTo(['admin', 'moderator']));

router.post('/location', ProviderController.searchProvider);
router
  .route('/')
  .post(ProviderController.createProvider)
  .get(ProviderController.getAllProvider);

router
  .route('/:id')
  .get(ProviderController.getProvider)
  .patch(ProviderController.updateProvider)
  .delete(ProviderController.deleteProvider);

module.exports = router;
