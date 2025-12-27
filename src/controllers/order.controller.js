const orderService = require("../services/orders.service");
const { asyncHandler } = require("../utils/asyncHandler");

exports.createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(req.user._id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(201, result.data, "Order created successfully");
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user.role === "customer" ? req.user._id : null;
  const result = await orderService.getOrderById(req.params.id, userId);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Order fetched successfully");
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Orders fetched successfully");
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, paymentMode } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (paymentStatus) filters.paymentStatus = paymentStatus;
  if (paymentMode) filters.paymentMode = paymentMode;

  const result = await orderService.getAllOrders(filters);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "All orders fetched successfully");
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updateOrderStatus(req.params.id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Order status updated successfully");
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updatePaymentStatus(req.params.id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Payment status updated successfully");
});

exports.getOrderStats = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderStats();
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Order stats fetched successfully");
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const result = await orderService.cancelOrder(
    req.params.id, 
    req.user._id,
    req.user.role
  );
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, result.message || "Order cancelled successfully");
});