const promoService = require("../services/promos.service");
const { asyncHandler } = require("../utils/asyncHandler");

exports.createPromo = asyncHandler(async (req, res) => {
  const result = await promoService.createPromo(req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(201, result.data, "Promo created successfully");
});

exports.getAllPromos = asyncHandler(async (req, res) => {
  const { active, discountType } = req.query;
  const filters = {};

  if (active !== undefined) filters.active = active === "true";
  if (discountType) filters.discountType = discountType;

  const result = await promoService.getAllPromos(filters);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Promos fetched successfully");
});

exports.getPromoById = asyncHandler(async (req, res) => {
  const result = await promoService.getPromoById(req.params.id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Promo fetched successfully");
});

exports.updatePromo = asyncHandler(async (req, res) => {
  const result = await promoService.updatePromo(req.params.id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Promo updated successfully");
});

exports.deletePromo = asyncHandler(async (req, res) => {
  const result = await promoService.deletePromo(req.params.id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Promo deleted successfully");
});

exports.validatePromo = asyncHandler(async (req, res) => {
  const result = await promoService.validatePromo(req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Promo validated successfully");
});
