const { Router } = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublishedProducts,
} = require("../controllers/product.controller");
const { checkRole } = require("../middlewares/auth.middleware");

const productRoutes = Router();

// Public routes
productRoutes.get("/published", getPublishedProducts);

// Protected routes - Admin only
productRoutes.post("/", checkRole(["admin"]), createProduct);

productRoutes.get("/", checkRole(["admin"]), getAllProducts);

productRoutes.get("/:id", checkRole(["admin"]), getProductById);

productRoutes.put("/:id", checkRole(["admin"]), updateProduct);

productRoutes.delete("/:id", checkRole(["admin"]), deleteProduct);

module.exports = productRoutes;
