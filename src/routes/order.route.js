const { Router } = require("express");
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
  getSalesData,
} = require("../controllers/order.controller");
const { verifyJWT, checkRole } = require("../middlewares/auth.middleware");

const orderRoutes = Router();

// IMPORTANT: Specific routes must come before parameterized routes

// Customer routes - specific paths first
orderRoutes.get("/my-orders", checkRole(["customer"]), getUserOrders);

orderRoutes.post("/", checkRole(["customer"]), createOrder);

// Admin routes - specific paths
orderRoutes.get("/stats/overview", checkRole(["admin"]), getOrderStats);

orderRoutes.get("/", checkRole(["admin"]), getAllOrders);

orderRoutes.put("/:id/status", checkRole(["admin"]), updateOrderStatus);

orderRoutes.put("/:id/payment-status", checkRole(["admin"]), updatePaymentStatus);

// Generic routes - parameterized paths last
orderRoutes.get("/:id", verifyJWT, getOrderById);

module.exports = orderRoutes;
