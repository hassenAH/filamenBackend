const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// Récupérer toutes les factures
router.get("/invoices", invoiceController.getAllInvoices);

// Analyser les ventes
router.get("/analytics", invoiceController.getSalesAnalytics);

module.exports = router;
