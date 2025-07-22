const express = require("express");
const router = express.Router();

const {
  createInquiry,
  getAllInquiries,
  getInquiriesByProduct,
  updateInquiryStatus,
} = require("../controllers/inquiryController");

// Public: submit inquiry
router.post("/", createInquiry);

// Admin routes (add auth middleware as needed)
router.get("/", getAllInquiries);
router.get("/product/:productId", getInquiriesByProduct);
router.put("/:id/status", updateInquiryStatus);

module.exports = router;
