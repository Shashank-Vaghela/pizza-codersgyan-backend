const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createCheckoutSession,
  verifyPayment,
  createRefund,
} = require("../controllers/payment.controller");

// Create Stripe checkout session
router.post("/create-checkout-session", verifyJWT, createCheckoutSession);

// Verify payment
router.post("/verify-payment", verifyJWT, verifyPayment);

// Create refund (admin only)
router.post("/refund", verifyJWT, createRefund);

module.exports = router;
