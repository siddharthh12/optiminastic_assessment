const pool = require('../config/db');

/**
 * Middleware to validate if a client exists based on the client-id header.
 */
const validateClient = async (req, res, next) => {
    const clientId = req.headers['client-id'];

    if (!clientId) {
        return res.status(400).json({
            success: false,
            error: 'client-id header is required'
        });
    }

    try {
        const [clients] = await pool.query('SELECT id FROM clients WHERE id = ?', [clientId]);

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        // Attach client ID to request object for use in controllers
        req.clientId = clientId;
        next();
    } catch (error) {
        console.error('Client Validation Middleware Error:', error.message);
        next(error); // Pass to global error handler
    }
};

module.exports = validateClient;
