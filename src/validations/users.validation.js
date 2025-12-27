const Joi = require("joi");

// User registration validation schema
exports.registerUserSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50).messages({
    "string.empty": "First name is required",
    "string.min": "First name should have at least 2 characters",
    "string.max": "First name should not exceed 50 characters",
  }),
  lastName: Joi.string().required().trim().min(2).max(50).messages({
    "string.empty": "Last name is required",
    "string.min": "Last name should have at least 2 characters",
    "string.max": "Last name should not exceed 50 characters",
  }),
  email: Joi.string().required().email().max(100).messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
    "string.max": "Email should not exceed 100 characters",
  }),
  password: Joi.string().required().min(6).messages({
    "string.empty": "Password is required",
    "string.min": "Password should have at least 6 characters",
  }),
});

// User login validation schema
exports.loginUserSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// Update user profile validation schema
exports.updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "First name should have at least 2 characters",
    "string.max": "First name should not exceed 50 characters",
  }),
  lastName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "Last name should have at least 2 characters",
    "string.max": "Last name should not exceed 50 characters",
  }),
  phone: Joi.string()
    .min(10)
    .max(15)
    .pattern(/^[0-9]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number can only contain numbers",
      "string.min": "Phone number should have at least 10 digits",
      "string.max": "Phone number should not exceed 15 digits",
    }),
  addresses: Joi.array()
    .items(
      Joi.object({
        address: Joi.string().trim().required(),
        isDefault: Joi.boolean().default(false),
      })
    )
    .optional(),
});
