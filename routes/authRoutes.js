const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('email').trim().toLowerCase().isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/)
  ],
  validationMiddleware,
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().toLowerCase().isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validationMiddleware,
  authController.login
);

module.exports = router;
