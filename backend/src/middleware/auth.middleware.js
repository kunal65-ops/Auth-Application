const ApiError = require('../utils/ApiError');
const asyncHandler = require('./asyncHandler');
const { verifyAccessToken } = require('../utils/token.util');
const User = require('../models/user.model');
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header?.('Authorization') || req.headers?.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;
    const token = req.cookies?.accessToken || tokenFromHeader;
    if (!token) {
      throw new ApiError(401, 'Unauthorized request: Access token is missing');
    }
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      throw new ApiError(401, 'Unauthorized request: Invalid or expired access token');
    }
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid access token: User no longer exists');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});
module.exports = {
  verifyJWT
};