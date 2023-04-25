/* eslint-disable comma-dangle */
const express = require('express');
const restrictTo = require('../utils/restrictTo');
const AppointementController = require('../controllers/AppointmentController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.use(AuthController.protect);
router.route('/').post(AppointementController.bookAppointement);
router.post('/cancel', AppointementController.cancelAppointement);

router.use(restrictTo(['admin', 'moderator']));
router.get('/', AppointementController.getAllAppointment);

module.exports = router;
