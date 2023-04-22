/* eslint-disable comma-dangle */
const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.use(AuthController.protect);
router.get('/getMe', UserController.getMe, UserController.getUser);
router.patch('/updateMe', UserController.updateMe);
router.delete('/deleteMe', UserController.deleteMe);

router
  .route('/')
  .post(UserController.createUser)
  .get(UserController.getAllUsers);

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = router;
