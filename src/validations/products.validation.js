const Joi = require("joi");

// Create product validation schema
exports.createProductSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  category: Joi.string().valid("pizza", "beverages").required().messages({
    "any.only": "Category must be either pizza or beverages",
    "any.required": "Category is required",
  }),
  image: Joi.string().allow("").optional(),
  pricing: Joi.object().required().messages({
    "any.required": "Pricing is required",
  }),
  toppings: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.string().allow("").optional(),
      })
    )
    .optional(),
  attributes: Joi.object({
    isHit: Joi.boolean().optional(),
    spiciness: Joi.string().valid("non-spicy", "spicy").optional(),
    alcohol: Joi.string().valid("non-alcoholic", "alcoholic").optional(),
  }).optional(),
  published: Joi.boolean().optional(),
});

// Update product validation schema
exports.updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().optional(),
  category: Joi.string().valid("pizza", "beverages").optional(),
  image: Joi.string().allow("").optional(),
  pricing: Joi.object().optional(),
  toppings: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.string().allow("").optional(),
      })
    )
    .optional(),
  attributes: Joi.object({
    isHit: Joi.boolean().optional(),
    spiciness: Joi.string().valid("non-spicy", "spicy").optional(),
    alcohol: Joi.string().valid("non-alcoholic", "alcoholic").optional(),
  }).optional(),
  published: Joi.boolean().optional(),
});
