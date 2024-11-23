const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { generateInvoice } = require("./invoiceController");

// Place an Order
exports.createOrder = async (req, res) => {
  const { userId, products } = req.body;

  try {
    let totalAmount = 0;

    // Check product stock and calculate total amount
    const updatedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product ${item.productId} not found.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}.`);
        }

        product.stock -= item.quantity; // Reduce stock
        await product.save();

        totalAmount += product.price * item.quantity;

        return {
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    // Create the order
    const order = new Order({
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      products: updatedProducts,
      totalAmount,
    });

    await order.save();

    // Generate an invoice
    await generateInvoice(order._id);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Orders for a Specific User
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.find({ user: userId }).populate("products.product", "title price");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "title price");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Order Status (Admin)
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
