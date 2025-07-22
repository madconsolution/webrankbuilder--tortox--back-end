require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const contactRoutes = require("./routes/contactRoutes"); // NEW
const errorHandler = require("./middleware/errorMiddleware");
const http = require("http");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB();

app.use(express.json());
// app.use(cors());
app.use(
  cors({
    exposedHeaders: ["Content-Range"],
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/contact", contactRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler);

module.exports = { app, server };

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
