const pool = require('../config/db');

// @desc    Credit wallet amount
// @route   POST /api/admin/wallet/credit
exports.creditWallet = async (req, res, next) => {
    const { client_id, amount } = req.body;

    // Validation
    if (!client_id || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid client_id and amount > 0 are required'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if wallet exists
        const [wallets] = await connection.query('SELECT id, balance FROM wallets WHERE client_id = ?', [client_id]);
        
        if (wallets.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Wallet not found for this client'
            });
        }

        // Increase wallet balance
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE client_id = ?', [amount, client_id]);

        // Insert ledger entry
        await connection.query(
            'INSERT INTO wallet_ledger (client_id, type, amount, description) VALUES (?, ?, ?, ?)',
            [client_id, 'credit', amount, 'Admin wallet credit']
        );

        // Fetch updated balance
        const [updatedWallets] = await connection.query('SELECT balance FROM wallets WHERE client_id = ?', [client_id]);

        await connection.commit();

        res.status(200).json({
            success: true,
            data: {
                message: 'Wallet credited successfully',
                updated_balance: updatedWallets[0].balance
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Debit wallet amount
// @route   POST /api/admin/wallet/debit
exports.debitWallet = async (req, res, next) => {
    const { client_id, amount } = req.body;

    // Validation
    if (!client_id || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid client_id and amount > 0 are required'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Fetch current wallet balance
        const [wallets] = await connection.query('SELECT balance FROM wallets WHERE client_id = ? FOR UPDATE', [client_id]);

        if (wallets.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Wallet not found for this client'
            });
        }

        const currentBalance = wallets[0].balance;

        if (currentBalance < amount) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Insufficient wallet balance'
            });
        }

        // Deduct wallet balance
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE client_id = ?', [amount, client_id]);

        // Insert ledger entry
        await connection.query(
            'INSERT INTO wallet_ledger (client_id, type, amount, description) VALUES (?, ?, ?, ?)',
            [client_id, 'debit', amount, 'Admin wallet debit']
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            data: {
                message: 'Wallet debited successfully'
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
exports.getBalance = async (req, res, next) => {
    const clientId = req.clientId; // From validateClient middleware

    try {
        const [wallets] = await pool.query('SELECT balance FROM wallets WHERE client_id = ?', [clientId]);

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Wallet not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                balance: wallets[0].balance
            }
        });
    } catch (error) {
        next(error);
    }
};
