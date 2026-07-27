const ApiError = require('../utils/ApiError');
const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }
  const response = {
    success: false,
    message: error.message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && { errors: error.errors, stack: error.stack })
  };
  return res.status(error.statusCode || 500).json(response);
};
module.exports = errorHandler;