const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const validateClient = require('../middleware/validateClient');

// Admin routes (no validateClient middleware as these are for admin/internal use)
router.post('/admin/wallet/credit', walletController.creditWallet);
router.post('/admin/wallet/debit', walletController.debitWallet);

// Client routes
router.get('/wallet/balance', validateClient, walletController.getBalance);

module.exports = router;
