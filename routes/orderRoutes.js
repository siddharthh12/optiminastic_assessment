const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validateClient = require('../middleware/validateClient');

// Order routes
router.post('/orders', validateClient, orderController.createOrder);
router.get('/orders/:order_id', validateClient, orderController.getOrderDetails);

module.exports = router;
