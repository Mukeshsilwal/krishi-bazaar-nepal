import api from '@/services/api';

/**
 * Shipment API service for fetching and tracking shipments.
 *
 * Important:
 * - All responses use response.data.code === 0 pattern.
 * - Errors are mapped to user-friendly messages via resolveUserMessage.
 * - Shipment data is NOT cached (always fetch fresh status for accurate tracking).
 *
 * Design Notes:
 * - Shipments are automatically created after payment success.
 * - Buyers can track shipments using orderId or tracking code.
 * - Tracking by tracking code is public (no authentication required).
 */
const shipmentService = {
    /**
     * Retrieves shipment details by order ID.
     *
     * @param {string} orderId - UUID of the order
     * @returns {Promise<Object>} Shipment details
     */
    getShipmentByOrderId: async (orderId) => {
        const response = await api.get(`/api/logistics/shipments/${orderId}`);
        return response.data;
    },

    /**
     * Tracks shipment by tracking code (public access).
     *
     * @param {string} trackingCode - Unique tracking code (e.g., TRK-ABC12345)
     * @returns {Promise<Object>} Shipment tracking information
     */
    trackShipment: async (trackingCode) => {
        const response = await api.get(`/api/logistics/shipments/track/${trackingCode}`);
        return response.data;
    },
};

export default shipmentService;
