import React from 'react';
import { NEPALI_MONTHS } from './constants';

interface MonthTimelineProps {
    selectedMonth: string;
    onSelect: (month: string) => void;
}

const MonthTimeline: React.FC<MonthTimelineProps> = ({ selectedMonth, onSelect }) => {
    return (
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar md:justify-center">
            <button
                onClick={() => onSelect('')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMonth === ''
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                    }`}
            >
                सबै महिना
            </button>
            {NEPALI_MONTHS.map((month) => (
                <button
                    key={month.value}
                    onClick={() => onSelect(month.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMonth === month.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                        }`}
                >
                    {month.nepali}
                </button>
            ))}
        </div>
    );
};

export default MonthTimeline;
