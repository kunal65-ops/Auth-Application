const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const getProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: req.user },
      'User profile fetched successfully'
    )
  );
});
const getDashboard = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
        dashboardInfo: {
          welcomeMessage: `Welcome back, ${req.user.email}!`,
          systemStatus: 'Operational',
          accessTime: new Date().toISOString()
        }
      },
      'Welcome to the protected dashboard'
    )
  );
});
module.exports = {
  getProfile,
  getDashboard
};