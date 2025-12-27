const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Promo = require("../models/promo.model");
const { serviceHandler } = require("../utils/asyncHandler");
const {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} = require("../validations/orders.validation");

// Helper function to apply promo code
const applyPromoCode = async (code, orderAmount) => {
  const promo = await Promo.findOne({
    code: code.toUpperCase(),
    active: true,
  });

  if (!promo) {
    throw new Error("Invalid promo code");
  }

  // Check validity period
  const now = new Date();
  if (now < promo.validFrom || now > promo.validTo) {
    throw new Error("Promo code has expired");
  }

  // Check usage limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    throw new Error("Promo code usage limit reached");
  }

  // Check minimum order amount
  if (orderAmount < promo.minOrderAmount) {
    throw new Error(
      `Minimum order amount of ₹${promo.minOrderAmount} required`
    );
  }

  // Calculate discount
  let discount = 0;
  if (promo.discountType === "percentage") {
    discount = Math.round((orderAmount * promo.discountValue) / 100);
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else if (promo.discountType === "fixed") {
    discount = promo.discountValue;
  } else if (promo.discountType === "free-shipping") {
    discount = 100; // Delivery charges
  }

  // Increment usage count
  promo.usedCount += 1;
  await promo.save();

  return { discount, promo };
};

// Create order
exports.createOrder = serviceHandler(async (userId, data) => {
  const { error } = createOrderSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return { success: false, statusCode: 400, message: "Cart is empty" };
  }

  // Calculate pricing
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxes = Math.round(subtotal * 0.18); // 18% tax
  const deliveryCharges = 100;
  let discount = 0;

  // Apply promo code if provided
  if (data.promoCode) {
    try {
      const promoResult = await applyPromoCode(data.promoCode, subtotal);
      discount = promoResult.discount;
    } catch (err) {
      return { success: false, statusCode: 400, message: err.message };
    }
  }

  const total = subtotal + taxes + deliveryCharges - discount;

  // Create order
  const order = new Order({
    user: userId,
    customer: data.customer,
    items: cart.items.map((item) => ({
      product: item.product._id,
      name: item.name,
      image: item.image,
      category: item.category,
      customization: item.customization,
      price: item.price,
      quantity: item.quantity,
    })),
    deliveryAddress: data.deliveryAddress,
    paymentMode: data.paymentMode,
    paymentStatus: data.paymentMode === "card" ? "PAID" : "PENDING",
    comment: data.comment || "",
    pricing: {
      subtotal,
      taxes,
      deliveryCharges,
      discount,
      total,
    },
    promoCode: data.promoCode || "",
    status: "Received",
  });

  await order.save();

  // Clear cart after order
  cart.items = [];
  await cart.save();

  return { success: true, statusCode: 201, data: order };
});

// Get order by ID
exports.getOrderById = serviceHandler(async (orderId, userId = null) => {
  const query = { _id: orderId };
  if (userId) {
    query.user = userId;
  }

  const order = await Order.findOne(query).populate("items.product");

  if (!order) {
    return { success: false, statusCode: 404, message: "Order not found" };
  }

  return { success: true, statusCode: 200, data: order };
});

// Get user orders
exports.getUserOrders = serviceHandler(async (userId) => {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "items.product",
      select: "name image category",
    });
    
  return { success: true, statusCode: 200, data: orders };
});

// Get all orders
exports.getAllOrders = serviceHandler(async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.paymentMode) {
    query.paymentMode = filters.paymentMode;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName email")
    .populate("items.product");

  return { success: true, statusCode: 200, data: orders };
});

// Update order status
exports.updateOrderStatus = serviceHandler(async (orderId, data) => {
  const { error } = updateOrderStatusSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { status } = data;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  ).populate("items.product");

  if (!order) {
    return { success: false, statusCode: 404, message: "Order not found" };
  }

  return { success: true, statusCode: 200, data: order };
});

// Update payment status
exports.updatePaymentStatus = serviceHandler(async (orderId, data) => {
  const { error } = updatePaymentStatusSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { paymentStatus } = data;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus },
    { new: true, runValidators: true }
  ).populate("items.product");

  if (!order) {
    return { success: false, statusCode: 404, message: "Order not found" };
  }

  return { success: true, statusCode: 200, data: order };
});

// Get order stats
exports.getOrderStats = serviceHandler(async () => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$pricing.total" },
      },
    },
  ]);

  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    ordersByStatus,
  };

  return { success: true, statusCode: 200, data: stats };
});