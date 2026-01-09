import { useNavigate } from 'react-router-dom';

export default function PaymentFailurePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">भुक्तानी असफल भयो</h2>
                <p className="text-gray-600 mb-6">
                    माफ गर्नुहोस्, तपाईंको भुक्तानी प्रक्रिया पूरा हुन सकेन। कृपया पुनः प्रयास गर्नुहोस् वा अर्को माध्यम प्रयोग गर्नुहोस्।
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        अर्डरहरू
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        पुनः प्रयास गर्नुहोस्
                    </button>
                </div>
            </div>
        </div>
    );
}
