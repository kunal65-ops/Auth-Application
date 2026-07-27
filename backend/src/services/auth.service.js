const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token.util');
class AuthService {
  async registerUser({ email, password }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }
    const user = new User({
      email,
      password
    });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }
  async loginUser({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }
  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token user');
    }
    if (user.refreshToken !== incomingRefreshToken) {
      user.refreshToken = null;
      await user.save();
      throw new ApiError(401, 'Refresh token has been revoked or reused');
    }
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();
    return {
      user: user.toJSON(),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
  async logoutUser(refreshToken, userId = null) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      return;
    }
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded?._id) {
          await User.findByIdAndUpdate(decoded._id, { refreshToken: null });
          return;
        }
      } catch (err) {
        await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
      }
    }
  }
}
module.exports = new AuthService();