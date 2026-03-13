# Wallet Transaction & Order Management System

A Node.js backend system built with Express and MySQL for managing client wallets, recording transactions, and processing orders with external fulfillment integration.

## Features

- **Wallet Management**: Credit and debit operations for client wallets.
- **Transaction Ledger**: Automatic recording of all wallet movements in a ledger for auditing.
- **Order Processing**: Atomic order creation with wallet balance deduction.
- **External Fulfillment**: Integration with an external API to fulfill orders.
- **Robustness**: Centralized error handling and client validation middleware.
- **Standardized API**: Consistent response formats across all endpoints.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2/promise` with connection pooling)
- **External Requests**: Axios
- **Environment Variables**: Dotenv
- **Development**: Nodemon

## Project Structure

```text
optiminastic_assignment
│
├── config
│   └── db.js               # Database connection pool configuration
│
├── controllers
│   ├── walletController.js  # Logic for wallet credit, debit, and balance
│   └── orderController.js   # Logic for order creation and retrieval
│
├── routes
│   ├── walletRoutes.js      # Wallet API route definitions
│   └── orderRoutes.js       # Order API route definitions
│
├── services
│   └── fulfillmentService.js # External fulfillment API integration
│
├── middleware
│   ├── validateClient.js    # Client existence check middleware
│   └── errorHandler.js      # Global error handling middleware
│
├── app.js                   # Express app setup and middleware registration
├── server.js                # Server entry point and DB connection test
├── schema.sql               # Database schema and sample data
├── .env                     # Environment variables (DB credentials, PORT)
└── package.json            # Node.js dependencies and scripts
```

## Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed. Run the provided SQL script to create the database and tables:
```bash
mysql -u root -p < schema.sql
```

### 2. Environment Configuration
Create a `.env` file in the root directory and configure your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wallet_system
```

### 3. Installation
```bash
npm install
```

### 4. Running the Project
Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

### Wallet APIs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/wallet/credit` | Credit funds to a client's wallet. |
| `POST` | `/api/admin/wallet/debit` | Debit funds from a client's wallet. |
| `GET` | `/api/wallet/balance` | Get current balance. Requires `client-id` header. |

### Order APIs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Create an order. Requires `client-id` header. |
| `GET` | `/api/orders/:order_id` | Get order details. Requires `client-id` header. |

### Standard Response Formats

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message details"
}
```

## Validation & Security

- **Transactions**: All financial and order operations use database transactions to ensure data atomicity.
- **Middleware**: The `validateClient` middleware ensures that only valid clients can perform operations.
- **Error Handling**: A global error handler catches any unexpected server issues and returns a structured response.
