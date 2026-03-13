const pool = require('../config/db');
const { createFulfillment } = require('../services/fulfillmentService');

// @desc    Create a new order by deducting from wallet and fulfilling it
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
    const clientId = req.clientId; // From validateClient middleware
    const { amount } = req.body;

    // 2. Validate request
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid amount'
        });
    }

    // 3. Start a database transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 4. Check wallet balance
        const [wallets] = await connection.query('SELECT balance FROM wallets WHERE client_id = ? FOR UPDATE', [clientId]);

        if (wallets.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Wallet not found'
            });
        }

        const currentBalance = parseFloat(wallets[0].balance);
        if (currentBalance < amount) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Insufficient wallet balance'
            });
        }

        // 5. Deduct wallet balance
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE client_id = ?', [amount, clientId]);

        // 6. Insert order record
        const [result] = await connection.query(
            'INSERT INTO orders (client_id, amount, status) VALUES (?, ?, ?)',
            [clientId, amount, 'created']
        );

        const orderId = result.insertId;

        // Call External Fulfillment Service
        let fulfillmentId;
        try {
            fulfillmentId = await createFulfillment(clientId, orderId);
        } catch (fulfillmentError) {
            await connection.rollback();
            return res.status(500).json({
                success: false,
                error: 'Fulfillment service failed, order cancelled'
            });
        }

        // 7. Update the order record with fulfillment id and status fulfilled
        await connection.query(
            'UPDATE orders SET fulfillment_id = ?, status = ? WHERE id = ?',
            [fulfillmentId, 'fulfilled', orderId]
        );

        // Commit the transaction
        await connection.commit();

        // 8. Return success response
        res.status(201).json({
            success: true,
            data: {
                message: "Order created successfully",
                order_id: orderId,
                fulfillment_id: fulfillmentId
            }
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Get order details
// @route   GET /api/orders/:order_id
exports.getOrderDetails = async (req, res, next) => {
    const { order_id } = req.params;
    const clientId = req.clientId; // From validateClient middleware

    if (!order_id) {
        return res.status(400).json({
            success: false,
            error: 'order_id param is required'
        });
    }

    try {
        // 3. Fetch order from database
        const [orders] = await pool.query(
            'SELECT id, client_id, amount, status, fulfillment_id FROM orders WHERE id = ? AND client_id = ?',
            [order_id, clientId]
        );

        // 4. If order does not exist
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // 5. If order exists return
        const order = orders[0];
        res.status(200).json({
            success: true,
            data: {
                order_id: order.id,
                client_id: order.client_id,
                amount: order.amount,
                status: order.status,
                fulfillment_id: order.fulfillment_id
            }
        });
    } catch (error) {
        next(error);
    }
};
