import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import advisoryService, { DiseaseDiagnosis } from '../services/advisoryService';
import { Search, AlertTriangle, Leaf, ShieldAlert } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const DiagnosticTool = () => {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DiseaseDiagnosis[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleDiagnose = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await advisoryService.diagnoseBySymptoms(query);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {language === 'ne' ? 'बाली रोग निदान' : 'Crop Disease Diagnosis'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ne'
                            ? 'लक्षणहरूको वर्णन गर्नुहोस् र समाधान पाउनुहोस्।'
                            : 'Describe the symptoms you see on your crops (e.g., "yellow leaves on rice") to get advice.'}
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
                    <form onSubmit={handleDiagnose} className="relative">
                        <input
                            type="text"
                            placeholder={language === 'ne' ? 'उदाहरण: धानको पात पहेँलो हुने...' : 'E.g., Yellow spots on Tomato leaves...'}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-lg"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-5 text-gray-400" />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            {loading ? 'Searching...' : (language === 'ne' ? 'खोज्नुहोस्' : 'Diagnose')}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    {hasSearched && results.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            {language === 'ne' ? 'कुनै रोग फेला परेन। कृपया अर्को विवरण प्रयास गर्नुहोस्।' : 'No matching diseases found. Please try a different description.'}
                        </div>
                    )}

                    {results.map((diagnosis, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className={`p-6 border-b border-gray-100 ${diagnosis.riskLevel === 'CRITICAL' ? 'bg-red-50' :
                                    diagnosis.riskLevel === 'HIGH' ? 'bg-orange-50' : 'bg-white'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{diagnosis.diseaseName}</h2>
                                        <span className={`inline-flex items-center gap-1 text-sm font-semibold mt-1 px-3 py-1 rounded-full ${diagnosis.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                diagnosis.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            <AlertTriangle size={14} />
                                            Risk Level: {diagnosis.riskLevel}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-700"><span className="font-semibold">Symptoms:</span> {diagnosis.symptoms}</p>
                            </div>

                            <div className="p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Leaf size={20} className="text-green-600" />
                                    Recommended Treatments
                                </h3>

                                <div className="space-y-4">
                                    {diagnosis.treatments.map((tx, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-gray-800">{tx.medicineName}</span>
                                                <span className={`text-xs px-2 py-1 rounded border ${tx.isOrganic ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {tx.isOrganic ? 'Organic' : 'Chemical'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div><span className="text-gray-500">Dosage:</span> <span className="font-medium">{tx.dosage}</span></div>
                                                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{tx.type}</span></div>
                                            </div>
                                            <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                                                <strong>Safety:</strong> {tx.safetyInstructions}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* MANDATORY SAFETY WARNING */}
                                <div className="mt-8 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                    <ShieldAlert size={24} className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm uppercase tracking-wide mb-1">Safety Warning</p>
                                        <p>{diagnosis.safetyDisclaimer}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DiagnosticTool;
