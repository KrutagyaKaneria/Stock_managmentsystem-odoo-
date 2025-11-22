import * as productService from "../services/product.services.js";
import { success, fail } from "../utils/response.js";

// GET /api/v1/products
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return success(res, products, "Products fetched successfully");
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/products
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return success(res, product, "Product created");
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    if (!product) return fail(res, "Product not found", 404);
    return success(res, product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      parseInt(req.params.id),
      req.body
    );
    return success(res, product, "Product updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    return success(res, null, "Product deleted");
  } catch (err) {
    next(err);
  }
};
