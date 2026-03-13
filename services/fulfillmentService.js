const axios = require('axios');

/**
 * Calls an external fulfillment API to create a fulfillment record.
 * @param {number} clientId - The ID of the client.
 * @param {number} orderId - The ID of the order.
 * @returns {Promise<number>} - The fulfillment ID returned by the external service.
 */
async function createFulfillment(clientId, orderId) {
    try {
        const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
            userId: clientId,
            title: orderId
        });

        // The external API returns an object containing an id
        return response.data.id;
    } catch (error) {
        console.error('Fulfillment Service Error:', error.message);
        throw new Error('Fulfillment API call failed');
    }
}

module.exports = {
    createFulfillment
};
