/* eslint-disable comma-dangle */
const express = require('express');
const AppointementController = require('../controllers/AppointmentController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.use(AuthController.protect);
router.route('/').post(AppointementController.bookAppointement);
router.post('/cancel', AppointementController.cancelAppointement);

//   .get(ProviderController.getAllProvider);

// router
//   .route('/:id')
//   .get(ProviderController.getProvider)
//   .patch(ProviderController.updateProvider)
//   .delete(ProviderController.deleteProvider);

module.exports = router;
