const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true }, // Total after tax and discount
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
