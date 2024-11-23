const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middlewares/uploadMiddleware");

// Create Product with Multiple Images
router.post("/create", upload, productController.createProduct);

// Get All Products
router.get("/", productController.getAllProducts);

module.exports = router;
