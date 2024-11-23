const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who placed the order
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Product reference
      quantity: { type: Number, required: true }, // Quantity of the product
    },
  ],
  totalAmount: { type: Number, required: true }, // Total price of the order
  status: { type: String, default: "Pending" }, // Order status (Pending, Completed, Cancelled)
  createdAt: { type: Date, default: Date.now }, // Order creation date
});

module.exports = mongoose.model("Order", orderSchema);
