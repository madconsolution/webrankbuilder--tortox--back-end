const express = require("express");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductByUserId,
} = require("../controllers/ProductController"); // ✅ Ensure this path is correct

const protect = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload up to 5 images per car listing
router.post("/", protect, uploadMiddleware("cars", true, 5), addProduct);
router.put("/:id", protect, uploadMiddleware("cars", true, 5), updateProduct);
router.get("/uid/:id", getProductByUserId);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
