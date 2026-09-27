const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "user", phone, location, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (phone && !/^\+91[6-9]\d{9}$/.test(phone)) return res.status(400).json({ message: "Enter a valid Indian mobile number" });

    const normalizedRole = (role || "user").toString().toLowerCase();
    const finalRole = normalizedRole === "user" ? "user" : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already registered. Please login instead." });

    let phoneCheck = phone;
    if (phoneCheck) {
      const existingPhoneUser = await User.findOne({ phone: phoneCheck });
      if (existingPhoneUser) return res.status(400).json({ message: "Phone number already registered" });
    }

    const defaultPhone = phone || "+910000000000";
    const defaultLocation = location || "Unknown";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      phone: phone || defaultPhone,
      location: location || defaultLocation,
      state,
      optInSMS: true
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not registered. Please register first." });
    if (user.role === 'admin') return res.status(403).json({ message: "Admin access has been removed" });
    if (role === 'rescue' && user.role !== 'rescue_team') return res.status(403).json({ message: "Rescue team credentials required" });
    if (role !== 'rescue' && user.role === 'rescue_team') return res.status(403).json({ message: "Use the rescue team login" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect email or password." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, role: user.role, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email is being changed and if new email already exists
    const existingUser = await User.findById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only check for duplicate email if email is being changed
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change user password (current + new)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Provide currentPassword and newPassword" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Change user email (must be unique)
exports.changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: "Provide newEmail" });

    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.findByIdAndUpdate(req.user.id, { email: newEmail }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Email updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
