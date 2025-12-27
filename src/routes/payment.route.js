const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createCheckoutSession,
  verifyPayment,
} = require("../controllers/payment.controller");

// Create Stripe checkout session
router.post("/create-checkout-session", verifyJWT, createCheckoutSession);

// Verify payment
router.post("/verify-payment", verifyJWT, verifyPayment);

module.exports = router;
