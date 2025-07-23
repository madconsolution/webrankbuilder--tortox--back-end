const Product = require("../models/Product");
const slugify = require("../utils/slugify");

// Remove deleted images from disk
const fs = require("fs");
const path = require("path");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, isFeatured, status } =
      req.body;

    const images = req.files?.map((file) => file.path) || [];
    const slug = await slugify(name);

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      isFeatured: isFeatured === "true",
      status: status || "active",
      images,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newImages = req.files?.map((file) => file.path) || [];
    const existingImages = JSON.parse(req.body.existingImages || "[]");
    const finalImages = [...existingImages, ...newImages];

    const removedImages = product.images.filter(
      (img) => !finalImages.includes(img)
    );
    removedImages.forEach((imgPath) => {
      try {
        fs.unlinkSync(path.resolve(imgPath));
      } catch (err) {
        console.warn(`Failed to delete ${imgPath}:`, err.message);
      }
    });

    const { name, description, price, category, stock, isFeatured, status } =
      req.body;

    if (name && name !== product.name) {
      product.name = name;
      product.slug = await slugify(name);
    }

    Object.assign(product, {
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      stock: stock || product.stock,
      isFeatured:
        isFeatured !== undefined ? isFeatured === "true" : product.isFeatured,
      status: status || product.status,
      images: finalImages,
    });

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete image files from disk
    product.images.forEach((imagePath) => {
      const fullPath = path.resolve(imagePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn(`Failed to delete image ${imagePath}:`, err.message);
      }
    });

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product and images deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true });
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
