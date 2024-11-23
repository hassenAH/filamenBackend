const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const path = require("path");

exports.createProduct = async (req, res) => {
  const { title, brand, description, price, stock, sizes, colors, categoryId, gender } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get the paths of uploaded images
    const imagePaths = req.files.map((file) => path.join(file.destination, file.filename));

    // Create the product document
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      title,
      brand,
      images: imagePaths, // Save the image paths in the product
      description,
      price,
      stock,
      sizes: JSON.parse(sizes), // Convert JSON string to array
      colors: JSON.parse(colors), // Convert JSON string to array
      category: categoryId,
      gender,
    });

    await product.save();
    res.status(201).json({ message: "Product Created", product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    // Retrieve the server's base URL dynamically
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const products = await Product.find().populate("category", "name description");

    // Modify each product's images to include the full URL
    const productsWithImageUrls = products.map((product) => {
      const imagesWithFullUrl = product.images.map((image) => `${baseUrl}/${image}`);
      return {
        ...product._doc, // Spread the original product document
        images: imagesWithFullUrl, // Replace images with full URLs
      };
    });

    res.status(200).json(productsWithImageUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

