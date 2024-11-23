const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the user from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};

module.exports = authenticate;
