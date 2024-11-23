const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure dynamic storage for product folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productName = req.body.title; // Get the product name from the request body
    if (!productName) {
      return cb(new Error("Product name (title) is required"), null);
    }

    // Sanitize product name to prevent invalid folder names
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();

    // Define the folder path
    const dir = path.join("assets", sanitizedProductName, "images");

    // Create the directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir); // Use the dynamically created folder as the destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save file with a unique name
  },
});

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Configure multer to handle multiple images
const upload = multer({
  storage,
  fileFilter,
}).array("images", 10); // Accept up to 10 images

module.exports = upload;
