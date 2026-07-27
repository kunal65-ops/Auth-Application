const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstErrorMessage = errorArray[0].msg;
    return next(new ApiError(400, firstErrorMessage, errorArray));
  }
  next();
};
module.exports = validate;