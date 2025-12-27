const Stripe = require("stripe");
const appConfig = require("../config/appConfig");
const Order = require("../models/order.model");
const { serviceHandler } = require("../utils/asyncHandler");

// Initialize Stripe
const stripe = new Stripe(appConfig.stripe.secretKey);

// Create Stripe checkout session
exports.createCheckoutSession = serviceHandler(async (userId, orderId) => {
  if (!orderId) {
    return { success: false, statusCode: 400, message: "Order ID is required" };
  }

  // Fetch order details
  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, statusCode: 404, message: "Order not found" };
  }

  // Check if order belongs to the user
  if (order.user.toString() !== userId.toString()) {
    return { success: false, statusCode: 403, message: "Unauthorized access to order" };
  }

  // Create line items for Stripe
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: item.name,
        description: Object.values(item.customization).join(", "),
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100), // Convert to paise
    },
    quantity: item.quantity,
  }));

  // Add taxes as a line item
  if (order.pricing.taxes > 0) {
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Taxes (18%)",
        },
        unit_amount: Math.round(order.pricing.taxes * 100),
      },
      quantity: 1,
    });
  }

  // Add delivery charges as a line item
  if (order.pricing.deliveryCharges > 0) {
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: Math.round(order.pricing.deliveryCharges * 100),
      },
      quantity: 1,
    });
  }

  // Add discount as a negative line item if applicable
  if (order.pricing.discount > 0) {
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: `Discount (${order.promoCode})`,
        },
        unit_amount: -Math.round(order.pricing.discount * 100),
      },
      quantity: 1,
    });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appConfig.frontendUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${appConfig.frontendUrl}/checkout`,
      customer_email: order.customer.email,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
      },
    });

    return {
      success: true,
      statusCode: 200,
      data: { sessionId: session.id, url: session.url },
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create checkout session",
    };
  }
});

// Verify payment and update order
exports.verifyPayment = serviceHandler(async (sessionId, orderId) => {
  if (!sessionId || !orderId) {
    return {
      success: false,
      statusCode: 400,
      message: "Session ID and Order ID are required",
    };
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update order payment status
      const order = await Order.findById(orderId);
      if (!order) {
        return { success: false, statusCode: 404, message: "Order not found" };
      }

      order.paymentStatus = "PAID";
      order.stripeSessionId = sessionId;
      await order.save();

      return { success: true, statusCode: 200, data: { order } };
    } else {
      return { success: false, statusCode: 400, message: "Payment not completed" };
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to verify payment",
    };
  }
});

// Create refund for cancelled order
exports.createRefund = serviceHandler(async (orderId) => {
  if (!orderId) {
    return { success: false, statusCode: 400, message: "Order ID is required" };
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, statusCode: 404, message: "Order not found" };
    }

    // Check if order is paid
    if (order.paymentStatus !== "PAID") {
      return { 
        success: false, 
        statusCode: 400, 
        message: "Cannot refund unpaid order" 
      };
    }

    // Check if order is cancelled
    if (order.status !== "Cancelled") {
      return { 
        success: false, 
        statusCode: 400, 
        message: "Can only refund cancelled orders" 
      };
    }

    // Check if already refunded
    if (order.refund.status === "COMPLETED") {
      return { 
        success: false, 
        statusCode: 400, 
        message: "Order already refunded" 
      };
    }

    // Check if payment was made through Stripe
    if (!order.stripeSessionId) {
      return { 
        success: false, 
        statusCode: 400, 
        message: "No Stripe payment found for this order" 
      };
    }

    // Retrieve the session to get payment intent
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    
    if (!session.payment_intent) {
      return { 
        success: false, 
        statusCode: 400, 
        message: "No payment intent found" 
      };
    }

    // Update refund status to pending
    order.refund.status = "PENDING";
    await order.save();

    // Create refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
      amount: Math.round(order.pricing.total * 100), // Convert to paise
      reason: "requested_by_customer",
      metadata: {
        orderId: orderId.toString(),
      },
    });

    // Update order with refund details
    order.refund.stripeRefundId = refund.id;
    order.refund.amount = order.pricing.total;
    order.refund.status = refund.status === "succeeded" ? "COMPLETED" : "PENDING";
    order.refund.refundedAt = new Date();
    
    // Update payment status to REFUNDED if refund is completed
    if (refund.status === "succeeded") {
      order.paymentStatus = "REFUNDED";
    }
    
    await order.save();

    return {
      success: true,
      statusCode: 200,
      data: { 
        refund,
        order,
        message: "Refund processed successfully. Amount will be credited within 5-7 business days."
      },
    };
  } catch (error) {
    console.error("Refund error:", error);
    
    // Update order refund status to failed
    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.refund.status = "FAILED";
        await order.save();
      }
    } catch (updateError) {
      console.error("Failed to update refund status:", updateError);
    }

    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to process refund",
    };
  }
});
