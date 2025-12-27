const { Router } = require("express");
const {
  createPromo,
  getAllPromos,
  getPromoById,
  updatePromo,
  deletePromo,
  validatePromo,
} = require("../controllers/promo.controller");
const { checkRole } = require("../middlewares/auth.middleware");

const promoRoutes = Router();

// Customer routes
promoRoutes.post("/validate", checkRole(["customer"]), validatePromo);

// Admin routes
promoRoutes.post("/", checkRole(["admin"]), createPromo);

promoRoutes.get("/", checkRole(["admin"]), getAllPromos);

promoRoutes.get("/:id", checkRole(["admin"]), getPromoById);

promoRoutes.put("/:id", checkRole(["admin"]), updatePromo);

promoRoutes.delete("/:id", checkRole(["admin"]), deletePromo);

module.exports = promoRoutes;
