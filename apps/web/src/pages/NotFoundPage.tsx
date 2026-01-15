import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const NotFoundPage: React.FC = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 404 Illustration */}
                <div className="text-9xl font-bold text-green-100 mb-4">404</div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'ne' ? 'पृष्ठ फेला परेन' : 'Page Not Found'}
                </h1>

                <p className="text-gray-600 mb-8">
                    {language === 'ne'
                        ? 'माफ गर्नुहोस्, तपाईंले खोज्नुभएको पृष्ठ अवस्थित छैन वा सारियो।'
                        : 'Sorry, the page you are looking for does not exist or has been moved.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <Home className="w-4 h-4" />
                        {language === 'ne' ? 'गृहपृष्ठमा जानुहोस्' : 'Go to Home'}
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'ne' ? 'पछाडि जानुहोस्' : 'Go Back'}
                    </button>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        {language === 'ne' ? 'यी पृष्ठहरू उपयोगी हुन सक्छन्:' : 'These pages might be helpful:'}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link to="/marketplace" className="text-green-600 hover:text-green-700 hover:underline text-sm">
                            {language === 'ne' ? 'बजार' : 'Marketplace'}
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/prices" className="text-green-600 hover:text-green-700 hover:underline text-sm">
                            {language === 'ne' ? 'बजार मूल्य' : 'Market Prices'}
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/diagnosis" className="text-green-600 hover:text-green-700 hover:underline text-sm">
                            {language === 'ne' ? 'रोग निदान' : 'Diagnosis'}
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/contact" className="text-green-600 hover:text-green-700 hover:underline text-sm">
                            {language === 'ne' ? 'सम्पर्क' : 'Contact'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
