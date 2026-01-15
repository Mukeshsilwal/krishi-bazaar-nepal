import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Package, MapPin, Calendar, Truck, AlertCircle } from 'lucide-react';
import shipmentService from '../services/shipmentService';
import vehicleService from '../services/vehicleService';
import { toast } from 'sonner';

/**
 * Displays shipment details and provides vehicle booking CTA.
 *
 * Design Notes:
 * - Shows shipment status with visual timeline.
 * - "Book Vehicle" button only appears when status is CREATED.
 * - Tracking information displayed for all statuses.
 *
 * Important:
 * - Shipment is auto-created after payment success.
 * - If no shipment exists, shows error message.
 * - Bilingual support for Nepali farmers/buyers.
 */
const ShipmentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [shipment, setShipment] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchShipmentDetails();
    }, [orderId]);

    const fetchShipmentDetails = async () => {
        try {
            setLoading(true);
            const response = await shipmentService.getShipmentByOrderId(orderId);

            if (response.code === 0) {
                setShipment(response.data);

                // Fetch vehicle booking if shipment is assigned or later
                if (response.data.status !== 'CREATED') {
                    try {
                        const bookingResponse = await vehicleService.getBookingByShipment(response.data.id);
                        if (bookingResponse.code === 0) {
                            setBooking(bookingResponse.data);
                        }
                    } catch (err) {
                        // Booking might not exist, ignore error
                    }
                }
            } else {
                setError(language === 'ne' ? 'ढुवानी जानकारी फेला परेन' : 'Shipment not found');
            }
        } catch (err) {
            console.error('Error fetching shipment:', err);
            setError(language === 'ne' ? 'ढुवानी जानकारी लोड गर्न असफल' : 'Failed to load shipment details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CREATED': return 'bg-blue-100 text-blue-700';
            case 'ASSIGNED': return 'bg-yellow-100 text-yellow-700';
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-700';
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        if (language === 'ne') {
            switch (status) {
                case 'CREATED': return 'सिर्जना गरिएको';
                case 'ASSIGNED': return 'सवारी तोकिएको';
                case 'IN_TRANSIT': return 'बाटोमा';
                case 'DELIVERED': return 'डेलिभर भएको';
                case 'CANCELLED': return 'रद्द गरिएको';
                default: return status;
            }
        }
        return status.replace('_', ' ');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-white rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg p-8 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {error || (language === 'ne' ? 'ढुवानी फेला परेन' : 'Shipment Not Found')}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {language === 'ne'
                                ? 'यो अर्डरको लागि ढुवानी जानकारी उपलब्ध छैन।'
                                : 'Shipment information is not available for this order.'}
                        </p>
                        <Link to="/orders" className="text-blue-600 hover:underline">
                            {language === 'ne' ? 'अर्डरहरूमा फर्कनुहोस्' : 'Back to Orders'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {language === 'ne' ? 'ढुवानी विवरण' : 'Shipment Details'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ne' ? 'ट्र्याकिङ कोड:' : 'Tracking Code:'}
                        <span className="font-mono font-semibold ml-2">{shipment.trackingCode}</span>
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {language === 'ne' ? 'स्थिति' : 'Status'}
                        </h2>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusText(shipment.status)}
                        </span>
                    </div>

                    {/* Locations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-green-600 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">
                                    {language === 'ne' ? 'उठाउने स्थान' : 'Pickup Location'}
                                </p>
                                <p className="font-medium text-gray-800">{shipment.sourceLocation}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">
                                    {language === 'ne' ? 'गन्तव्य स्थान' : 'Destination'}
                                </p>
                                <p className="font-medium text-gray-800">{shipment.destinationLocation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Booking CTA */}
                    {shipment.status === 'CREATED' && !booking && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Truck className="h-5 w-5 text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900 mb-1">
                                        {language === 'ne' ? 'सवारी बुक गर्नुहोस्' : 'Book a Vehicle'}
                                    </h3>
                                    <p className="text-sm text-blue-700 mb-3">
                                        {language === 'ne'
                                            ? 'आफ्नो ढुवानीको लागि सवारी बुक गर्नुहोस्'
                                            : 'Book a vehicle for your shipment delivery'}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/orders/${orderId}/shipment/book-vehicle`)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {language === 'ne' ? 'सवारी बुक गर्नुहोस्' : 'Book Vehicle'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Details (if booked) */}
                    {booking && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">
                                {language === 'ne' ? 'सवारी विवरण' : 'Vehicle Details'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {language === 'ne' ? 'सवारीको प्रकार' : 'Vehicle Type'}
                                    </p>
                                    <p className="font-medium text-gray-800">{booking.vehicleType}</p>
                                </div>
                                {booking.estimatedCost && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {language === 'ne' ? 'अनुमानित लागत' : 'Estimated Cost'}
                                        </p>
                                        <p className="font-medium text-gray-800">रु. {booking.estimatedCost}</p>
                                    </div>
                                )}
                                {booking.driverName && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {language === 'ne' ? 'चालकको नाम' : 'Driver Name'}
                                        </p>
                                        <p className="font-medium text-gray-800">{booking.driverName}</p>
                                    </div>
                                )}
                                {booking.driverContact && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {language === 'ne' ? 'चालकको सम्पर्क' : 'Driver Contact'}
                                        </p>
                                        <p className="font-medium text-gray-800">{booking.driverContact}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <Link
                    to="/orders"
                    className="inline-flex items-center text-blue-600 hover:underline"
                >
                    ← {language === 'ne' ? 'अर्डरहरूमा फर्कनुहोस्' : 'Back to Orders'}
                </Link>
            </div>
        </div>
    );
};

export default ShipmentPage;
