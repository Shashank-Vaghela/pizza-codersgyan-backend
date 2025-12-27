const Joi = require("joi");

// Create order validation schema
exports.createOrderSchema = Joi.object({
  customer: Joi.object({
    firstName: Joi.string().required().messages({
      "string.empty": "First name is required",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().messages({
      "string.empty": "Last name is required",
      "any.required": "Last name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
  }).required(),
  deliveryAddress: Joi.string().required().messages({
    "string.empty": "Delivery address is required",
    "any.required": "Delivery address is required",
  }),
  paymentMode: Joi.string().valid("card", "cash").required().messages({
    "any.only": "Payment mode must be either card or cash",
    "any.required": "Payment mode is required",
  }),
  comment: Joi.string().allow("").optional(),
  promoCode: Joi.string().allow("").optional(),
});

// Update order status validation schema
exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Received", "Confirmed", "Prepared", "Out for delivery", "Delivered")
    .required()
    .messages({
      "any.only": "Invalid order status",
      "any.required": "Status is required",
    }),
});

// Update payment status validation schema
exports.updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string().valid("PENDING", "PAID", "FAILED").required().messages({
    "any.only": "Invalid payment status",
    "any.required": "Payment status is required",
  }),
});
