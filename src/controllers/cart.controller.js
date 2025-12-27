const cartService = require("../services/cart.service");
const { asyncHandler } = require("../utils/asyncHandler");

exports.getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req.user._id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Cart fetched successfully");
});

exports.addToCart = asyncHandler(async (req, res) => {
  const result = await cartService.addToCart(req.user._id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Item added to cart successfully");
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.updateCartItem(
    req.user._id,
    req.params.itemId,
    req.body
  );
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Cart item updated successfully");
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const result = await cartService.removeFromCart(
    req.user._id,
    req.params.itemId
  );
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Item removed from cart successfully");
});

exports.clearCart = asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req.user._id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Cart cleared successfully");
});
