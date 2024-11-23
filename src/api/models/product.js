const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true }, // Product name
  brand: { type: String, required: true }, // Brand name
  images: [{ type: String, required: true }], // Array of image URLs
  description: { type: String, required: true }, // Product description
  price: { type: Number, required: true }, // Price of the product
  stock: { type: Number, required: true }, // Available stock
  sizes: [{ type: String, required: true }], // Array of sizes (e.g., S, M, L, XL)
  colors: [{ type: String, required: true }], // Array of available colors
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // Category (e.g., Men, Women, Kids)
  gender: { type: String, enum: ["Men", "Women", "Kids", "Unisex"], required: true }, // Gender target
});

module.exports = mongoose.model("Product", productSchema);
