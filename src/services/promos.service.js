const Promo = require("../models/promo.model");
const { serviceHandler } = require("../utils/asyncHandler");
const {
  createPromoSchema,
  updatePromoSchema,
  applyPromoSchema,
} = require("../validations/promos.validation");

// Create promo
exports.createPromo = serviceHandler(async (data) => {
  const { error } = createPromoSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  // Check if promo code already exists
  const existingPromo = await Promo.findOne({ code: data.code });
  if (existingPromo) {
    return {
      success: false,
      statusCode: 400,
      message: "Promo code already exists",
    };
  }

  const promo = new Promo(data);
  await promo.save();
  
  return { success: true, statusCode: 201, data: promo };
});

// Get all promos
exports.getAllPromos = serviceHandler(async (filters = {}) => {
  const query = {};

  if (filters.active !== undefined) {
    query.active = filters.active;
  }

  if (filters.discountType) {
    query.discountType = filters.discountType;
  }

  const promos = await Promo.find(query).sort({ createdAt: -1 });
  return { success: true, statusCode: 200, data: promos };
});

// Get promo by ID
exports.getPromoById = serviceHandler(async (promoId) => {
  const promo = await Promo.findById(promoId);
  
  if (!promo) {
    return { success: false, statusCode: 404, message: "Promo not found" };
  }
  
  return { success: true, statusCode: 200, data: promo };
});

// Get promo by code
exports.getPromoByCode = serviceHandler(async (code) => {
  const promo = await Promo.findOne({ code: code.toUpperCase() });
  
  if (!promo) {
    return { success: false, statusCode: 404, message: "Promo not found" };
  }
  
  return { success: true, statusCode: 200, data: promo };
});

// Update promo
exports.updatePromo = serviceHandler(async (promoId, updateData) => {
  const { error } = updatePromoSchema.validate(updateData);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const promo = await Promo.findByIdAndUpdate(promoId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!promo) {
    return { success: false, statusCode: 404, message: "Promo not found" };
  }

  return { success: true, statusCode: 200, data: promo };
});

// Delete promo
exports.deletePromo = serviceHandler(async (promoId) => {
  const promo = await Promo.findByIdAndDelete(promoId);
  
  if (!promo) {
    return { success: false, statusCode: 404, message: "Promo not found" };
  }
  
  return { success: true, statusCode: 200, data: promo };
});

// Validate promo
exports.validatePromo = serviceHandler(async (data) => {
  const { error } = applyPromoSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { code, orderAmount } = data;

  const promo = await Promo.findOne({
    code: code.toUpperCase(),
    active: true,
  });

  if (!promo) {
    return { success: false, statusCode: 400, message: "Invalid promo code" };
  }

  // Check validity period
  const now = new Date();
  if (now < promo.validFrom || now > promo.validTo) {
    return {
      success: false,
      statusCode: 400,
      message: "Promo code has expired",
    };
  }

  // Check usage limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return {
      success: false,
      statusCode: 400,
      message: "Promo code usage limit reached",
    };
  }

  // Check minimum order amount
  if (orderAmount < promo.minOrderAmount) {
    return {
      success: false,
      statusCode: 400,
      message: `Minimum order amount of ₹${promo.minOrderAmount} required`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (promo.discountType === "percentage") {
    discount = Math.round((orderAmount * promo.discountValue) / 100);
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else if (promo.discountType === "fixed") {
    discount = promo.discountValue;
  } else if (promo.discountType === "free-shipping") {
    discount = 100; // Delivery charges
  }

  return { success: true, statusCode: 200, data: { valid: true, discount, promo } };
});
