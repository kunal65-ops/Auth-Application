const { body } = require('express-validator');
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{}|;:',.<>/]).{8,50}$/;
const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('dob')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 50 })
    .withMessage('Password must be between 8 and 50 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
    )
];
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];
module.exports = {
  signupValidator,
  loginValidator
};