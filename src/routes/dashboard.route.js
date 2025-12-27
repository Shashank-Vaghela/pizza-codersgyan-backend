const { Router } = require("express");
const { getDashboardData } = require("../controllers/dashboard.controller");
const { checkRole } = require("../middlewares/auth.middleware");

const dashboardRoutes = Router();

// Admin only - Get dashboard data
dashboardRoutes.get("/", checkRole(["admin"]), getDashboardData);

module.exports = dashboardRoutes;
