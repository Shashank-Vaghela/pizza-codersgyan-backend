const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const { serviceHandler } = require("../utils/asyncHandler");
const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validations/cart.validation");

// Helper function to calculate price
const calculatePrice = (product, customization) => {
  let price = 0;
  const pricing = Object.fromEntries(product.pricing);

  if (product.category === "pizza") {
    // Add size price
    if (customization.size && pricing[customization.size]) {
      price += pricing[customization.size];
    }
    // Add crust price
    if (customization.crust && pricing[customization.crust]) {
      price += pricing[customization.crust];
    }
  } else if (product.category === "beverages") {
    // Add size price
    if (customization.size && pricing[customization.size]) {
      price += pricing[customization.size];
    }
    // Add chilling price
    if (customization.chilling && pricing[customization.chilling]) {
      price += pricing[customization.chilling];
    }
  }

  return price;
};

// Get cart
exports.getCart = serviceHandler(async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
  }

  return { success: true, statusCode: 200, data: cart };
});

// Add to cart
exports.addToCart = serviceHandler(async (userId, data) => {
  const { error } = addToCartSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { productId, customization, quantity = 1 } = data;

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, statusCode: 404, message: "Product not found" };
  }

  if (!product.published) {
    return {
      success: false,
      statusCode: 400,
      message: "Product is not available",
    };
  }

  // Calculate price based on customization
  const price = calculatePrice(product, customization);

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if item with same customization already exists
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      JSON.stringify(Object.fromEntries(item.customization)) ===
        JSON.stringify(customization)
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      category: product.category,
      customization: new Map(Object.entries(customization)),
      price,
      quantity,
    });
  }

  await cart.save();
  await cart.populate("items.product");
  
  return { success: true, statusCode: 200, data: cart };
});

// Update cart item
exports.updateCartItem = serviceHandler(async (userId, itemId, data) => {
  const { error } = updateCartItemSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const { quantity } = data;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return { success: false, statusCode: 404, message: "Cart not found" };
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return { success: false, statusCode: 404, message: "Cart item not found" };
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  
  return { success: true, statusCode: 200, data: cart };
});

// Remove from cart
exports.removeFromCart = serviceHandler(async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return { success: false, statusCode: 404, message: "Cart not found" };
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();
  await cart.populate("items.product");
  
  return { success: true, statusCode: 200, data: cart };
});

// Clear cart
exports.clearCart = serviceHandler(async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return { success: false, statusCode: 404, message: "Cart not found" };
  }

  cart.items = [];
  await cart.save();
  
  return { success: true, statusCode: 200, data: cart };
});
