import React from 'react';
import { CROP_ICONS } from '../../../config/cropIcons';

interface VisualFilterProps {
    onSelect: (category: string) => void;
    selectedCategory?: string;
}

const CATEGORIES = [
    { id: 'vegetables', label: 'Vegetables', icon: '🍅', keywords: ['tomato', 'potato', 'onion', 'cabbage'] },
    { id: 'fruits', label: 'Fruits', icon: '🍎', keywords: ['apple', 'banana', 'mango'] },
    { id: 'grains', label: 'Grains', icon: '🌾', keywords: ['rice', 'wheat', 'corn'] },
    { id: 'organic', label: 'Organic', icon: '🌿', keywords: ['organic'] },
];

const VisualFilter: React.FC<VisualFilterProps> = ({ onSelect, selectedCategory }) => {
    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
            <div className="flex space-x-4 min-w-max px-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`
              flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300
              min-w-[100px] h-[100px] border-2
              ${selectedCategory === cat.id
                                ? 'bg-green-100 border-green-600 shadow-md transform scale-105'
                                : 'bg-white border-transparent hover:border-green-200 hover:bg-green-50 shadow-sm'}
            `}
                    >
                        <span className="text-4xl mb-2">{cat.icon}</span>
                        <span className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-green-800' : 'text-gray-600'}`}>
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VisualFilter;
