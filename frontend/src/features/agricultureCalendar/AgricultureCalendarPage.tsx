import React from 'react';
import { useAgricultureCalendar } from './useAgricultureCalendar';
import CropSelector from './CropSelector';
import MonthTimeline from './MonthTimeline';
import CalendarEntryCard from './CalendarEntryCard';

const AgricultureCalendarPage: React.FC = () => {
    const {
        entries,
        loading,
        selectedCrop,
        setSelectedCrop,
        selectedMonth,
        setSelectedMonth
    } = useAgricultureCalendar();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">नेपाली कृषि क्यालेन्डर</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    बालीनाली लगाउने, स्याहार्ने र व्यवस्थापन गर्ने उपयुक्त समयको जानकारी।
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">बाली छान्नुहोस्</h2>
                <CropSelector selectedCrop={selectedCrop} onSelect={setSelectedCrop} />

                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-6">महिना छान्नुहोस्</h2>
                <MonthTimeline selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : entries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map((entry) => (
                        <CalendarEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <span className="text-4xl mb-4 block">📅</span>
                    <h3 className="text-lg font-medium text-gray-900">कुनै जानकारी फेला परेन</h3>
                    <p className="text-gray-500">कृपया अर्को महिना वा बाली चयन गर्नुहोस्।</p>
                    <button
                        onClick={() => { setSelectedCrop(''); setSelectedMonth(''); }}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                        सबै हेर्नुहोस्
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgricultureCalendarPage;
