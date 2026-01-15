import api from '@/services/api';

/**
 * Vehicle booking API service.
 *
 * Business Rules:
 * - Vehicle can only be booked when shipment status is CREATED.
 * - Only one active booking per shipment.
 * - Booking requires vehicle type and pickup datetime.
 *
 * Important:
 * - Booking automatically updates shipment status to ASSIGNED.
 * - Estimated cost is calculated by backend based on vehicle type.
 * - Only shipment owner (buyer) can book vehicle.
 */
const vehicleService = {
    /**
     * Books a vehicle for a shipment.
     *
     * @param {string} shipmentId - UUID of the shipment
     * @param {Object} bookingData - Booking details
     * @param {string} bookingData.vehicleType - Type of vehicle (TRACTOR, PICKUP, TRUCK, TEMPO, MINI_TRUCK)
     * @param {string} bookingData.pickupDateTime - ISO datetime string
     * @param {string} bookingData.notes - Optional notes
     * @returns {Promise<Object>} Booking confirmation
     */
    bookVehicle: async (shipmentId, bookingData) => {
        const response = await api.post(`/api/vehicle-bookings/shipment/${shipmentId}`, bookingData);
        return response.data;
    },

    /**
     * Retrieves vehicle booking details for a shipment.
     *
     * @param {string} shipmentId - UUID of the shipment
     * @returns {Promise<Object>} Booking details
     */
    getBookingByShipment: async (shipmentId) => {
        const response = await api.get(`/api/vehicle-bookings/shipment/${shipmentId}`);
        return response.data;
    },

    /**
     * Cancels a vehicle booking.
     *
     * @param {string} bookingId - UUID of the booking
     * @returns {Promise<Object>} Cancellation confirmation
     */
    cancelBooking: async (bookingId) => {
        const response = await api.delete(`/api/vehicle-bookings/${bookingId}`);
        return response.data;
    },
};

export default vehicleService;
