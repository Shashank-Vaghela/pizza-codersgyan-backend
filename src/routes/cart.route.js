const { Router } = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const { checkRole } = require("../middlewares/auth.middleware");

const cartRoutes = Router();

// All cart routes require customer role
cartRoutes.get("/", checkRole(["customer"]), getCart);

cartRoutes.post("/", checkRole(["customer"]), addToCart);

cartRoutes.put("/:itemId", checkRole(["customer"]), updateCartItem);

cartRoutes.delete("/:itemId", checkRole(["customer"]), removeFromCart);

cartRoutes.delete("/", checkRole(["customer"]), clearCart);

module.exports = cartRoutes;
