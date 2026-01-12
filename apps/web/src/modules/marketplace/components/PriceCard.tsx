import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getCropIcon } from '../../../config/cropIcons';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MarketPrice {
    id: string;
    commodity: string;
    marketName: string;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    priceDate: string;
    unit: string;
}

interface PriceCardProps {
    price: MarketPrice;
}

const PriceCard: React.FC<PriceCardProps> = ({ price }) => {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3 transition-all hover:shadow-md cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                    <span className="text-3xl bg-green-50 p-2 rounded-full">
                        {getCropIcon(price.commodity)}
                    </span>
                    <div>
                        <h3 className="font-semibold text-gray-900">{price.commodity}</h3>
                        <p className="text-xs text-gray-500">{price.marketName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                        Rs. {price.avgPrice}
                    </p>
                    <p className="text-xs text-gray-500">
                        Per {price.unit}
                    </p>
                </div>
            </div>

            {/* Expanded details */}
            <div className={`mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-4 text-sm transition-all overflow-hidden ${expanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div>
                    <span className="block text-gray-400 text-xs">Min Price</span>
                    <span className="font-medium text-gray-700">Rs. {price.minPrice}</span>
                </div>
                <div className="text-right">
                    <span className="block text-gray-400 text-xs">Max Price</span>
                    <span className="font-medium text-gray-700">Rs. {price.maxPrice}</span>
                </div>
            </div>

            <div className="flex justify-center mt-1">
                {expanded ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
            </div>
        </div>
    );
};

export default PriceCard;
