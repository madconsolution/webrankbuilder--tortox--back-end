const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const { check } = require("express-validator");

const router = express.Router();

// Validation Middleware
const validateRegister = [
  check("username", "Name is required").not().isEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

// Authentication Routes
router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

module.exports = router;
