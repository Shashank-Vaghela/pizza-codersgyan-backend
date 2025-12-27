const Joi = require("joi");

// Add to cart validation schema
exports.addToCartSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
  customization: Joi.object().required().messages({
    "any.required": "Customization is required",
  }),
  quantity: Joi.number().integer().min(1).optional().messages({
    "number.min": "Quantity must be at least 1",
  }),
});

// Update cart item validation schema
exports.updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});
