const Product = require("../models/Product");
const { sendEmail } = require("../services/emailService");
const {
  carListingApprovalEmailTemplate,
  newCarNotificationTemplate,
} = require("../services/emailTemplates");

// @desc    Add a new product
// @route   POST /api/products
const addProduct = async (req, res) => {
  try {
    const {
      make,
      model,
      priceUSD,
      priceSYP,
      year,
      kilometer,
      engineSize,
      location,
      transmission,
      fuelType,
      exteriorColor,
      interiorColor,
      selectedFeatures,
      description,
    } = req.body;

    // Handle image uploads
    const images = req.files ? req.files.map((file) => file.filename) : [];

    // Convert features to an array if it's a string
    const parsedFeatures =
      typeof selectedFeatures === "string"
        ? JSON.parse(selectedFeatures)
        : selectedFeatures;

    const product = new Product({
      user: req.user.id, // Ensure user is authenticated
      make,
      model,
      priceUSD,
      priceSYP,
      year,
      kilometer,
      engineSize,
      location,
      transmission,
      fuelType,
      exteriorColor,
      interiorColor,
      features: parsedFeatures,
      description,
      images,
    });

    await product.save();

    // Notify the admin after saving the car
    // const subject = "New Car Listed for Approval";
    // const html = newCarNotificationTemplate(
    //   make,
    //   model,
    //   priceUSD,
    //   req.user.email
    // );
    // await sendEmail(process.env.EMAIL_USER, subject, "", html);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product listing
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "username phone"
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    console.log("Cars from hit: ", product, "from request User: ", req.user);

    // Ensure the authenticated user is the owner of the car
    if (
      product.user._id.toString() !== req.user.id &&
      req?.user?.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update fields if provided
    product.make = req.body.make || product.make;
    product.model = req.body.model || product.model;
    product.priceUSD = req.body.priceUSD || product.priceUSD;
    product.priceSYP = req.body.priceSYP || product.priceSYP;
    product.year = req.body.year || product.year;
    product.kilometer = req.body.kilometer || product.kilometer;
    product.engineSize = req.body.engineSize || product.engineSize;
    product.location = req.body.location || product.location;
    product.transmission = req.body.transmission || product.transmission;
    product.fuelType = req.body.fuelType || product.fuelType;
    product.exteriorColor = req.body.exteriorColor || product.exteriorColor;
    product.interiorColor = req.body.interiorColor || product.interiorColor;
    product.features = req.body.features
      ? JSON.parse(req.body.features)
      : product.features;
    product.description = req.body.description || product.description;
    product.status = req.body.status || product.status;

    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.filename);
    }

    await product.save();

    // if (product.status !== "pending" || product.status !== "sold")
    // await approveproductListing(product?.user?.email, product.make);

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// const getCars = async (req, res) => {
//   try {
//     const cars = await Car.find().populate("user", "username email phone");
//     res.set("Content-Range", `cars 0-${cars.length}/${cars.length}`); // 👈 Required for React Admin
//     res.json({ success: true, data: cars });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getProducts = async (req, res) => {
  try {
    // Check if there's a filter in the request (e.g., ?status=available)
    const filter = req.query.status ? { status: req.query.status } : {};

    const products = await Product.find(filter)
      .populate("user", "username email phone")
      .sort({ createdAt: -1 });

    // Debugging: Log API response
    // console.log("products API Response:", products);

    // Ensure response structure
    const responseData = { success: true, data: products };

    // Ensure headers for React Admin pagination
    res.set(
      "Content-Range",
      `products 0-${products.length}/${products.length}`
    );
    res.set("Access-Control-Expose-Headers", "Content-Range");

    res.json(responseData); // ✅ Ensure response contains `data`
  } catch (error) {
    console.error("Error in getCars:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const getCars = async (req, res) => {
//   try {
//     const cars = await Car.find().populate("user", "username email phone");

//     res.json({
//       success: true,
//       data: cars.map((car) => ({
//         id: car._id, // Ensure there's an "id" field
//         make: car.make,
//         model: car.model,
//         priceUSD: car.priceUSD,
//         priceSYP: car.priceSYP,
//         year: car.year,
//         kilometer: car.kilometer,
//         engineSize: car.engineSize,
//         location: car.location,
//         transmission: car.transmission,
//         fuelType: car.fuelType,
//         exteriorColor: car.exteriorColor,
//         interiorColor: car.interiorColor,
//         selectedFeatures: car.selectedFeatures,
//         description: car.description,
//         images: car.images,
//         user: car.user, // Populated user info
//       })),
//       total: await Car.countDocuments(), // Add "total" field
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// @desc    Get a single car by ID
// @route   GET /api/cars/:id

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "username email phone"
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductByUserId = async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.id }).populate(
      "user",
      "username email"
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found for this user" });
    }

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }

    // Ensure the authenticated user is the owner of the product
    if (
      product.user._id.toString() !== req.user.id &&
      req?.user?.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveCarListing = async (carOwnerEmail, carTitle) => {
  const subject = "Your Car Listing is Approved!";
  const html = carListingApprovalEmailTemplate(carTitle);

  try {
    // Send the email
    await sendEmail(carOwnerEmail, subject, "", html);
  } catch (error) {
    // Log the error if the email failed to send
    console.error("Failed to send email", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductByUserId,
};
