const Joi = require("joi");

// Create promo validation schema
exports.createPromoSchema = Joi.object({
  code: Joi.string().required().uppercase().trim().messages({
    "string.empty": "Promo code is required",
    "any.required": "Promo code is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  discountType: Joi.string()
    .valid("percentage", "fixed", "free-shipping")
    .required()
    .messages({
      "any.only": "Discount type must be percentage, fixed, or free-shipping",
      "any.required": "Discount type is required",
    }),
  discountValue: Joi.number().min(0).when("discountType", {
    is: Joi.string().valid("percentage", "fixed"),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  minOrderAmount: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  validFrom: Joi.date().required().messages({
    "any.required": "Valid from date is required",
  }),
  validTo: Joi.date().greater(Joi.ref("validFrom")).required().messages({
    "date.greater": "Valid to date must be after valid from date",
    "any.required": "Valid to date is required",
  }),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  active: Joi.boolean().optional(),
});

// Update promo validation schema
exports.updatePromoSchema = Joi.object({
  code: Joi.string().uppercase().trim().optional(),
  description: Joi.string().optional(),
  discountType: Joi.string().valid("percentage", "fixed", "free-shipping").optional(),
  discountValue: Joi.number().min(0).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  validFrom: Joi.date().optional(),
  validTo: Joi.date().optional(),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  active: Joi.boolean().optional(),
});

// Apply promo validation schema
exports.applyPromoSchema = Joi.object({
  code: Joi.string().required().uppercase().trim().messages({
    "string.empty": "Promo code is required",
    "any.required": "Promo code is required",
  }),
  orderAmount: Joi.number().min(0).required().messages({
    "any.required": "Order amount is required",
  }),
});
