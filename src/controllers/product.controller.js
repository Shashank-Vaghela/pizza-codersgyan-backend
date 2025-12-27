const productService = require("../services/products.service");
const { asyncHandler } = require("../utils/asyncHandler");

exports.createProduct = asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(201, result.data, "Product created successfully");
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const { category, published, search } = req.query;
  const filters = {};

  if (category) filters.category = category;
  if (published !== undefined) filters.published = published === "true";
  if (search) filters.search = search;

  const result = await productService.getAllProducts(filters);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Products fetched successfully");
});

exports.getProductById = asyncHandler(async (req, res) => {
  const result = await productService.getProductById(req.params.id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Product fetched successfully");
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const result = await productService.updateProduct(req.params.id, req.body);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Product updated successfully");
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Product deleted successfully");
});

exports.getPublishedProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const result = await productService.getPublishedProducts(category);
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Published products fetched successfully");
});
