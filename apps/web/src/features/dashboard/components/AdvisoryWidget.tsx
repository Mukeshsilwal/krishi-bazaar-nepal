import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sprout, ShieldAlert, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvisoryWidget = () => {
    const { language } = useLanguage();

    // In a real scenario, fetch these from an API (e.g. recent logs or cms content)
    // Using static data matching the reference for now as specific API might need parameters
    const advisories = [
        {
            titleNe: 'गहुँमा सिंचाइ तयारी',
            titleEn: 'Wheat Irrigation Prep',
            descNe: 'समयमै सिंचाइले उत्पादन बढाउँछ',
            descEn: 'Timely irrigation increases yield',
            icon: Droplets,
            color: 'bg-blue-100 text-blue-600',
            link: '/knowledge/wheat-irrigation'
        },
        {
            titleNe: 'किरा नियन्त्रण',
            titleEn: 'Pest Control',
            descNe: 'अव्यवस्थित किरा लाग्ने पहिलो अवस्था',
            descEn: 'Early signs of pest infestation',
            icon: ShieldAlert,
            color: 'bg-red-100 text-red-600',
            link: '/diagnosis'
        },
        {
            titleNe: 'जैविक मल प्रयोग',
            titleEn: 'Organic Fertilizer',
            descNe: 'माटोको उर्वरा शक्ति बढाउन',
            descEn: 'To increase soil fertility',
            icon: Sprout,
            color: 'bg-green-100 text-green-600',
            link: '/knowledge/organic-fertilizer'
        }
    ];

    return (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                    {language === 'ne' ? 'कृषि सल्लाह' : 'Agri Advisory'}
                </h3>
                <Link to="/knowledge" className="text-sm font-medium text-blue-600 hover:underline">
                    {language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}
                </Link>
            </div>

            <div className="space-y-4">
                {advisories.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            to={item.link}
                            className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                                <Icon size={20} />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {language === 'ne' ? item.titleNe : item.titleEn}
                                </h4>
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                    {language === 'ne' ? item.descNe : item.descEn}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default AdvisoryWidget;
