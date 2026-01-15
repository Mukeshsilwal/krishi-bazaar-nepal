import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Truck, Calendar, FileText, AlertCircle } from 'lucide-react';
import vehicleService from '../services/vehicleService';
import shipmentService from '../services/shipmentService';
import { toast } from 'sonner';

/**
 * Vehicle booking form page.
 *
 * Business Rules:
 * - Can only book when shipment status is CREATED.
 * - Vehicle type selection is required.
 * - Pickup datetime must be in the future.
 * - Estimated cost is calculated by backend.
 *
 * Important:
 * - Booking automatically updates shipment status to ASSIGNED.
 * - Only shipment owner (buyer) can book vehicle.
 * - Form validates all inputs before submission.
 */
const BookVehiclePage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: '',
        pickupDateTime: '',
        notes: ''
    });

    const vehicleTypes = [
        { value: 'TRACTOR', labelEn: 'Tractor', labelNe: 'ट्र्याक्टर', descEn: 'For farm-to-market transport', descNe: 'खेतबाट बजारसम्म ढुवानी' },
        { value: 'PICKUP', labelEn: 'Pickup', labelNe: 'पिकअप', descEn: 'Small to medium loads', descNe: 'सानो देखि मध्यम भार' },
        { value: 'TRUCK', labelEn: 'Truck', labelNe: 'ट्रक', descEn: 'Large loads, long distance', descNe: 'ठूलो भार, लामो दूरी' },
        { value: 'TEMPO', labelEn: 'Tempo', labelNe: 'टेम्पो', descEn: 'Small loads, urban delivery', descNe: 'सानो भार, शहरी डेलिभरी' },
        { value: 'MINI_TRUCK', labelEn: 'Mini Truck', labelNe: 'मिनी ट्रक', descEn: 'Medium loads, versatile', descNe: 'मध्यम भार, बहुमुखी' }
    ];

    useEffect(() => {
        fetchShipmentDetails();
    }, [orderId]);

    const fetchShipmentDetails = async () => {
        try {
            setLoading(true);
            const response = await shipmentService.getShipmentByOrderId(orderId);

            if (response.code === 0) {
                setShipment(response.data);

                // Check if shipment can be booked
                if (response.data.status !== 'CREATED') {
                    toast.error(language === 'ne'
                        ? 'यो ढुवानीको लागि सवारी बुक गर्न सकिँदैन'
                        : 'Cannot book vehicle for this shipment');
                    navigate(`/orders/${orderId}/shipment`);
                }
            } else {
                toast.error(language === 'ne' ? 'ढुवानी फेला परेन' : 'Shipment not found');
                navigate('/orders');
            }
        } catch (err) {
            console.error('Error fetching shipment:', err);
            toast.error(language === 'ne' ? 'त्रुटि भयो' : 'An error occurred');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.vehicleType) {
            toast.error(language === 'ne' ? 'सवारीको प्रकार छान्नुहोस्' : 'Please select vehicle type');
            return;
        }

        if (!formData.pickupDateTime) {
            toast.error(language === 'ne' ? 'उठाउने मिति र समय छान्नुहोस्' : 'Please select pickup date and time');
            return;
        }

        // Validate pickup datetime is in the future
        const pickupDate = new Date(formData.pickupDateTime);
        if (pickupDate <= new Date()) {
            toast.error(language === 'ne'
                ? 'उठाउने मिति भविष्यमा हुनुपर्छ'
                : 'Pickup date must be in the future');
            return;
        }

        try {
            setSubmitting(true);
            const response = await vehicleService.bookVehicle(shipment.id, formData);

            if (response.code === 0) {
                toast.success(language === 'ne'
                    ? 'सवारी सफलतापूर्वक बुक गरियो!'
                    : 'Vehicle booked successfully!');
                navigate(`/orders/${orderId}/shipment`);
            } else {
                toast.error(response.message || (language === 'ne' ? 'बुकिङ असफल भयो' : 'Booking failed'));
            }
        } catch (err) {
            console.error('Error booking vehicle:', err);
            toast.error(language === 'ne'
                ? 'सवारी बुक गर्न असफल भयो'
                : 'Failed to book vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-96 bg-white rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {language === 'ne' ? 'सवारी बुक गर्नुहोस्' : 'Book a Vehicle'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ne'
                            ? 'आफ्नो ढुवानीको लागि सवारी छान्नुहोस्'
                            : 'Select a vehicle for your shipment delivery'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Vehicle Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {language === 'ne' ? 'सवारीको प्रकार' : 'Vehicle Type'} *
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {vehicleTypes.map((vehicle) => (
                                <label
                                    key={vehicle.value}
                                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${formData.vehicleType === vehicle.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="vehicleType"
                                        value={vehicle.value}
                                        checked={formData.vehicleType === vehicle.value}
                                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                        className="mt-1"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800">
                                                {language === 'ne' ? vehicle.labelNe : vehicle.labelEn}
                                            </span>
                                            <Truck className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {language === 'ne' ? vehicle.descNe : vehicle.descEn}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Pickup DateTime */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'ne' ? 'उठाउने मिति र समय' : 'Pickup Date & Time'} *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={formData.pickupDateTime}
                                onChange={(e) => setFormData({ ...formData, pickupDateTime: e.target.value })}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {language === 'ne'
                                ? 'कृपया भविष्यको मिति र समय छान्नुहोस्'
                                : 'Please select a future date and time'}
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'ne' ? 'टिप्पणी (वैकल्पिक)' : 'Notes (Optional)'}
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={language === 'ne'
                                    ? 'विशेष निर्देशन वा आवश्यकताहरू...'
                                    : 'Special instructions or requirements...'}
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">
                                    {language === 'ne' ? 'महत्वपूर्ण जानकारी:' : 'Important Information:'}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        {language === 'ne'
                                            ? 'अनुमानित लागत स्वचालित रूपमा गणना गरिनेछ'
                                            : 'Estimated cost will be calculated automatically'}
                                    </li>
                                    <li>
                                        {language === 'ne'
                                            ? 'चालक विवरण पछि तोकिनेछ'
                                            : 'Driver details will be assigned later'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/orders/${orderId}/shipment`)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={submitting}
                        >
                            {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting
                                ? (language === 'ne' ? 'बुक गर्दै...' : 'Booking...')
                                : (language === 'ne' ? 'सवारी बुक गर्नुहोस्' : 'Book Vehicle')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookVehiclePage;
