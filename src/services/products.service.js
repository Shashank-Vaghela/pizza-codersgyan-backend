const Product = require("../models/product.model");
const { serviceHandler } = require("../utils/asyncHandler");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validations/products.validation");

// Create product
exports.createProduct = serviceHandler(async (data) => {
  const { error } = createProductSchema.validate(data);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const product = new Product(data);
  await product.save();

  return { success: true, statusCode: 201, data: product };
});

// Get all products
exports.getAllProducts = serviceHandler(async (filters = {}) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.published !== undefined) {
    query.published = filters.published;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  return { success: true, statusCode: 200, data: products };
});

// Get product by ID
exports.getProductById = serviceHandler(async (productId) => {
  const product = await Product.findById(productId);
  
  if (!product) {
    return { success: false, statusCode: 404, message: "Product not found" };
  }

  return { success: true, statusCode: 200, data: product };
});

// Update product
exports.updateProduct = serviceHandler(async (productId, updateData) => {
  const { error } = updateProductSchema.validate(updateData);
  if (error) {
    return { success: false, statusCode: 400, message: error.message };
  }

  const product = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return { success: false, statusCode: 404, message: "Product not found" };
  }

  return { success: true, statusCode: 200, data: product };
});

// Delete product
exports.deleteProduct = serviceHandler(async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  
  if (!product) {
    return { success: false, statusCode: 404, message: "Product not found" };
  }

  return { success: true, statusCode: 200, data: product };
});

// Get published products
exports.getPublishedProducts = serviceHandler(async (category = null) => {
  const query = { published: true };
  if (category) {
    query.category = category;
  }
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  return { success: true, statusCode: 200, data: products };
});
