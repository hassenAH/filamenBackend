const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");


const { sendVerificationEmail } = require("../utils/email");
// Generate Access Token
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" }); // Access token expires in 15 minutes
  };
  
  // Generate Refresh Token
  const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }); // Refresh token expires in 7 days
  };
// Register User and Send Verification Email
exports.registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password,
      name,
    });

    await user.save();

    // Generate a verification token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send verification email
    await sendVerificationEmail(user.email, token);

    res.status(201).json({
      message: "User registered. Please verify your email to activate your account.",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Activate the user account
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.verified) {
        return res.status(400).json({ message: "Email is already verified." });
      }
  
      user.verified = true;
      await user.save();
  
      res.status(200).json({ message: "Email successfully verified. You can now log in." });
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  };
  
  exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
      if (!user.verified) {
        return res.status(401).json({ message: "Email not verified. Please verify your email." });
      }
  
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
  
      // Save refresh token in the user's document
      user.refreshTokens.push(refreshToken);
      await user.save();
  
      res.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
exports.getUserProfile = (req, res) => {
    try {
      // The user object is attached to the req object by the authenticate middleware
      const user = req.user;
  
      // Return user information (excluding sensitive fields like password)
      res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving user profile", error: err.message });
    }
  };
  exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
  
    try {
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
      }
  
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
      // Check if the refresh token exists in the user's document
      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
  
      // Generate a new access token
      const newAccessToken = generateAccessToken(user._id);
  
      res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
      res.status(403).json({ message: "Invalid or expired refresh token", error: err.message });
    }
  };
  
  exports.completeUserProfile = async (req, res) => {
    try {
      const userId = req.user._id; // Extract user ID from the authenticated request
      const { phone, address, dateOfBirth, gender } = req.body;
  
      // Find and update the user's profile
      const user = await User.findByIdAndUpdate(
        userId,
        {
          profile: {
            phone,
            address,
            dateOfBirth,
            gender,
          },
        },
        { new: true } // Return the updated document
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          name: user.name,
          email: user.email,
          profile: user.profile,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  exports.updatePassword = async (req, res) => {
    try {
      const userId = req.user._id; // Extract user ID from authenticated request
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old and new passwords are required" });
      }
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify the old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  exports.logoutUser = async (req, res) => {
    const { refreshToken } = req.body;
  
    try {
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
      }
  
      // Find the user and remove the refresh token
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (!user) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
  
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
  
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  