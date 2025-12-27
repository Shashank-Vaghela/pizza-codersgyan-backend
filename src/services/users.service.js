const User = require("../models/user.model");
const { serviceHandler } = require("../utils/asyncHandler");
const { generateToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../utils/email");
const crypto = require("crypto");
const {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} = require("../validations/users.validation");

// Register new user
exports.registerUser = serviceHandler(async (data) => {
  const { error } = registerUserSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { firstName, lastName, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, statusCode: 400, message: "Email already exists" };
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role: "customer",
  });

  await user.save();

  const userData = user.toObject();
  delete userData.password;

  return { success: true, statusCode: 201, data: userData };
});

// Login user
exports.loginUser = serviceHandler(async ({ email, password }) => {
  const { error } = loginUserSchema.validate({ email, password });
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const user = await User.findOne({ email, status: true }).select("+password");

  if (!user) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid email or password",
    };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid email or password",
    };
  }

  const accessToken = generateToken(user);
  if (!accessToken) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to generate access token",
    };
  }

  const userData = user.toObject();
  delete userData.password;

  return {
    success: true,
    statusCode: 200,
    data: { user: userData, accessToken },
  };
});

// Get current user
exports.getCurrentUser = serviceHandler(async (userId) => {
  const user = await User.findOne({ _id: userId, status: true }).select(
    "-password"
  );

  if (!user) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  return { success: true, statusCode: 200, data: user };
});

// Update user profile
exports.updateUserProfile = serviceHandler(async (userId, data) => {
  const { error } = updateUserSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const user = await User.findById(userId);
  if (!user) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  // Check if phone is being updated and if it's already taken
  if (data.phone && data.phone !== user.phone) {
    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      return {
        success: false,
        statusCode: 400,
        message: "Phone number already exists",
      };
    }
  }

  // Update user fields
  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;
  if (data.phone) user.phone = data.phone;
  if (data.addresses) user.addresses = data.addresses;

  await user.save();

  const userData = user.toObject();
  delete userData.password;

  return { success: true, statusCode: 200, data: userData };
});

// Request password reset
exports.requestPasswordReset = serviceHandler(async (email) => {
  if (!email) {
    return { success: false, statusCode: 400, message: "Email is required" };
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal that user doesn't exist for security
    return { 
      success: true, 
      statusCode: 200, 
      message: "If the email exists, a password reset link has been sent" 
    };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save hashed token and expiry (1 hour)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email
  const emailResult = await sendPasswordResetEmail(
    user.email,
    resetToken,
    user.firstName
  );

  if (!emailResult.success) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to send reset email. Please try again later.",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Password reset email sent successfully",
  };
});

// Reset password with token
exports.resetPassword = serviceHandler(async (token, newPassword) => {
  if (!token || !newPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Token and new password are required",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      statusCode: 400,
      message: "Password must be at least 6 characters long",
    };
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid or expired reset token",
    };
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return {
    success: true,
    statusCode: 200,
    message: "Password reset successfully",
  };
});
