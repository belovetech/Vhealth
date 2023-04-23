/* eslint-disable comma-dangle */
const express = require('express');
const AuthController = require('../controllers/AuthController');
const PatientController = require('../controllers/PatientController');

const router = express.Router();

router.use(AuthController.protect);
router.get('/getMe', PatientController.getMe, PatientController.getPatient);
router.patch('/updateMe', PatientController.updateMe);
router.delete('/deleteMe', PatientController.deleteMe);

router
  .route('/')
  .post(PatientController.createPatient)
  .get(PatientController.getAllPatients);

router
  .route('/:id')
  .get(PatientController.getPatient)
  .patch(PatientController.updatePatient)
  .delete(PatientController.deletePatient);

module.exports = router;
