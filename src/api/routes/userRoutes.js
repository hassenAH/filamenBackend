const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");
router.post("/register", userController.registerUser);
// Login User
router.post("/login", userController.loginUser);

// Refresh Token
router.post("/refresh-token", userController.refreshToken);

// Logout User
router.post("/logout", userController.logoutUser);
// Verify Email
router.get("/verify-email", userController.verifyEmail);
// Get User Profile (Protected Route)
router.get("/profile", authenticate, userController.getUserProfile);
router.put("/complete-profile", authenticate, userController.completeUserProfile);
router.put("/update-password", authenticate, userController.updatePassword);
module.exports = router;
