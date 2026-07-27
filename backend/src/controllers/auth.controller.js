const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const { getRefreshTokenCookieOptions } = require('../utils/token.util');
const signup = asyncHandler(async (req, res) => {
  const { name, dob, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.registerUser({
    name,
    dob,
    email,
    password
  });
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
  return res.status(201).json(
    new ApiResponse(
      201,
      { user, accessToken },
      'User registered successfully'
    )
  );
});
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser({
    email,
    password
  });
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
  return res.status(200).json(
    new ApiResponse(
      200,
      { user, accessToken },
      'Login successful'
    )
  );
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(
    incomingRefreshToken
  );
  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
  return res.status(200).json(
    new ApiResponse(
      200,
      { user, accessToken },
      'Token refreshed successfully'
    )
  );
});
const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const userId = req.user?._id;
  await authService.logoutUser(incomingRefreshToken, userId);
  const { maxAge, ...clearOptions } = getRefreshTokenCookieOptions();
  res.clearCookie('refreshToken', clearOptions);
  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'Logged out successfully'
    )
  );
});
module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout
};