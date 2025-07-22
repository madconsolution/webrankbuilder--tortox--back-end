const Inquiry = require("../models/Inquiry");
const product = require("../models/Product");

// Create a new inquiry (supports dynamic or static products)
exports.createInquiry = async (req, res) => {
  try {
    const {
      productId, // optional (only for dynamic products)
      productName, // required (snapshot)
      productPrice, // required (snapshot)
      name,
      email,
      phone,
      message,
    } = req.body;

    // If productId provided, confirm it exists (optional)
    if (productId) {
      const productExists = await product.findById(productId);
      if (!productExists) {
        return res.status(404).json({ error: "Product not found" });
      }
    }

    const inquiry = await Inquiry.create({
      product: productId || null,
      productName,
      productPrice,
      name,
      email,
      phone,
      message,
      inquiryDate: new Date(),
    });

    res
      .status(201)
      .json({ message: "Inquiry submitted successfully", inquiry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all inquiries with pagination and optional status filter
exports.getAllInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status; // optional: filter by status

    const query = status ? { status } : {};

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate("product", "name slug price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Inquiry.countDocuments(query),
    ]);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      data: inquiries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get inquiries by product ID (dynamic products only)
exports.getInquiriesByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const inquiries = await Inquiry.find({ product: productId }).sort({
      createdAt: -1,
    });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update inquiry status (admin)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });

    inquiry.status = req.body.status || inquiry.status;
    await inquiry.save();

    res.json({ message: "Status updated", inquiry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
