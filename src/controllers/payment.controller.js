const paymentService = require("../services/payment.service");
const { asyncHandler } = require("../utils/asyncHandler");

// Create Stripe checkout session
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const result = await paymentService.createCheckoutSession(req.user._id, orderId);

  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }

  return res.success(200, result.data, "Checkout session created successfully");
});

// Verify payment and update order
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId, orderId } = req.body;
  const result = await paymentService.verifyPayment(sessionId, orderId);

  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }

  return res.success(200, result.data, "Payment verified successfully");
});
