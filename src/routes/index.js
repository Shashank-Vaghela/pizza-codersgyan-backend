const userRoutes = require("./user.route");
const productRoutes = require("./product.route");
const cartRoutes = require("./cart.route");
const orderRoutes = require("./order.route");
const promoRoutes = require("./promo.route");
const uploadRoutes = require("./upload.route");
const paymentRoutes = require("./payment.route");
const dashboardRoutes = require("./dashboard.route");

const mainRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/promos", promoRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/dashboard", dashboardRoutes);
};

module.exports = mainRoutes;
