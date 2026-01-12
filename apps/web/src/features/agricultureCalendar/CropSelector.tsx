import React from 'react';
import { CROPS } from './constants';

interface CropSelectorProps {
    selectedCrop: string;
    onSelect: (crop: string) => void;
}

const CropSelector: React.FC<CropSelectorProps> = ({ selectedCrop, onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <button
                onClick={() => onSelect('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCrop === ''
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
            >
                सबै बाली (All)
            </button>
            {CROPS.map((crop) => (
                <button
                    key={crop.value}
                    onClick={() => onSelect(crop.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${selectedCrop === crop.value
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    <span>{crop.icon}</span>
                    <span>{crop.nepali}</span>
                </button>
            ))}
        </div>
    );
};

export default CropSelector;
