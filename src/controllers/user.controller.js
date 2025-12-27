const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
} = require("../services/users.service");
const { asyncHandler } = require("../utils/asyncHandler");

// Register new user
exports.registerUser = asyncHandler(async (req, res) => {
  const response = await registerUser(req.body);
  if (!response.success) {
    return res.error(response.statusCode, response.message);
  }
  return res.success(201, response.data, "User registered successfully");
});

// Login user
exports.loginUser = asyncHandler(async (req, res) => {
  const response = await loginUser(req.body);
  if (!response.success) {
    return res.error(response.statusCode, response.message);
  }
  return res.success(200, response.data, "User logged in successfully");
});

// Get current user
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const response = await getCurrentUser(req.user._id);
  if (!response.success) {
    return res.error(404, "User not found");
  }
  return res.success(200, response.data, "User fetched successfully");
});

// Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const response = await updateUserProfile(req.user._id, req.body);
  if (!response.success) {
    return res.error(response.statusCode, response.message);
  }
  return res.success(200, response.data, "Profile updated successfully");
});

// Request password reset
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const response = await requestPasswordReset(email);
  if (!response.success) {
    return res.error(response.statusCode, response.message);
  }
  return res.success(200, null, response.message);
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const response = await resetPassword(token, newPassword);
  if (!response.success) {
    return res.error(response.statusCode, response.message);
  }
  return res.success(200, null, response.message);
});
