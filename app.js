const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const walletRoutes = require('./routes/walletRoutes');
const orderRoutes = require('./routes/orderRoutes');
app.use('/api', walletRoutes);
app.use('/api', orderRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Wallet Transaction System API Running');
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
