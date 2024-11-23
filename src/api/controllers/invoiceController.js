const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.generateInvoice = async (orderId) => {
  try {
    // Récupérer la commande
    const order = await Order.findById(orderId).populate("products.product");

    if (!order) {
      throw new Error("Commande introuvable");
    }

    // Calculer les montants
    const totalAmount = order.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = totalAmount * 0.2; // Exemple : 20% de TVA
    const discount = 0; // À personnaliser si nécessaire
    const finalAmount = totalAmount + tax - discount;

    // Créer la facture
    const invoice = new Invoice({
      _id: new mongoose.Types.ObjectId(),
      orderId: order._id,
      userId: order.user,
      products: order.products.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      tax,
      discount,
      finalAmount,
    });

    await invoice.save();
    console.log("Facture générée pour la commande :", orderId);
  } catch (err) {
    console.error("Erreur lors de la génération de la facture :", err.message);
  }
};
exports.getAllInvoices = async (req, res) => {
    try {
      const invoices = await Invoice.find().populate("userId", "name email").populate("products.productId", "title");
      res.status(200).json(invoices);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getSalesAnalytics = async (req, res) => {
    try {
      // Total des ventes
      const totalSales = await Invoice.aggregate([
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]);
  
      // Produits les plus vendus
      const topProducts = await Invoice.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]);
  
      res.status(200).json({
        totalSales: totalSales[0]?.total || 0,
        topProducts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  