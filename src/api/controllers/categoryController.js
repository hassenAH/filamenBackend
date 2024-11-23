const Category = require("../models/Category");
const mongoose = require("mongoose");

// Create a Category
exports.createCategory = async (req, res) => {
  const { name, description, parentCategory } = req.body;

  try {
    const category = new Category({
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      parentCategory,
    });

    await category.save();
    res.status(201).json({ message: "Category Created", category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory", "name");
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
