const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true, unique: true }, // Category name (e.g., Men, Women, Kids)
  description: { type: String }, // Description of the category
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // For subcategories
});

module.exports = mongoose.model("Category", categorySchema);
