const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
} = require("../controllers/productController");

const uploadMiddleware = require("../middleware/uploadMiddleware");

// CRUD + custom routes
router.post("/", uploadMiddleware("products", true, 5), createProduct);
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.put("/:id", uploadMiddleware("products", true, 5), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
