const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register user/admin
router.post("/register", register);

// Login
router.post("/login", login);

// Get user profile (protected)
router.get("/profile", authMiddleware, getProfile);

// Update user profile (protected)
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
