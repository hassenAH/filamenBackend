const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Place an Order
router.post("/create", orderController.createOrder);

// Get Orders for a Specific User
router.get("/user/:userId", orderController.getUserOrders);

// Get All Orders (Admin)
router.get("/", orderController.getAllOrders);

// Update Order Status
router.patch("/status", orderController.updateOrderStatus);

module.exports = router;
