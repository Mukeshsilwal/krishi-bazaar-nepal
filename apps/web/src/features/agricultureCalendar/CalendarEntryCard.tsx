import React from 'react';
import { AgricultureCalendarEntry } from '../../services/agricultureCalendarService';
import { ACTIVITY_TYPES, CROPS, NEPALI_MONTHS } from './constants';

interface CalendarEntryCardProps {
    entry: AgricultureCalendarEntry;
}

const CalendarEntryCard: React.FC<CalendarEntryCardProps> = ({ entry }) => {
    const cropInfo = CROPS.find(c => c.value === entry.crop);
    const monthInfo = NEPALI_MONTHS.find(m => m.value === entry.nepaliMonth);
    const activityInfo = ACTIVITY_TYPES.find(a => a.value === entry.activityType);

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'SOWING': return 'bg-green-100 text-green-800 border-green-200';
            case 'HARVESTING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'TRANSPLANTING': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'GROWTH': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IRRIGATION': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={entry.crop}>
                        {cropInfo?.icon || '🌱'}
                    </span>
                    <div>
                        <h3 className="font-bold text-gray-800">{cropInfo?.nepali || entry.crop}</h3>
                        <p className="text-xs text-gray-500 font-medium">{monthInfo?.nepali || entry.nepaliMonth}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActivityColor(entry.activityType)}`}>
                    {activityInfo?.nepali || entry.activityType}
                </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {entry.advisory}
            </p>

            {entry.region && entry.region !== 'ALL' && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>क्षेत्र: {entry.region}</span>
                </div>
            )}
        </div>
    );
};

export default CalendarEntryCard;
