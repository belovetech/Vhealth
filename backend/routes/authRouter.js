const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

// AUTHENTICATION
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

router.use(AuthController.protect);
router.patch('/updatePassword', AuthController.updatePassword);

module.exports = router;
