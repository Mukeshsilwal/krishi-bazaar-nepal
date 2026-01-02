import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import advisoryService, { DiseaseDiagnosis } from '../services/advisoryService';
import { Search, AlertTriangle, Leaf, ShieldAlert, History, Stethoscope } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import InfiniteScroll from '../../../components/common/InfiniteScroll';
import { useInfiniteQuery } from '@tanstack/react-query';

const DiagnosticTool = () => {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DiseaseDiagnosis[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const { user } = useAuth();

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
            toast.error('Diagnosis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        if (!user) {
            toast.error('Please login to report');
            return;
        }
        try {
            await advisoryService.sendSignal({
                sourceUserId: user.id,
                type: 'FARMER_SYMPTOM_REPORT',
                symptomCodes: [query],
                metadata: {
                    description: query,
                    timestamp: new Date().toISOString()
                }
            });
            toast.success('Report submitted to experts');
        } catch (e) {
            toast.error('Failed to submit report');
        }
    };

    // History Logic setup
    const {
        data: historyData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isHistoryLoading
    } = useInfiniteQuery({
        queryKey: ['diagnosisHistory', user?.id],
        queryFn: async ({ pageParam = 0 }) => {
            if (!user) return { content: [], last: true };
            return advisoryService.getDiagnosisHistory(pageParam, 10);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: any, allPages) => {
            return lastPage.last ? undefined : allPages.length;
        },
        enabled: !!user
    });

    const historyItems = historyData?.pages.flatMap((page: any) => page.content) || [];

    return (
        <div className="bg-gray-50 flex flex-col min-h-full">
            <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {language === 'ne' ? 'बाली रोग निदान' : 'Crop Disease Diagnosis'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ne'
                            ? 'AI प्रविधिको प्रयोग गरी बालीको रोग पहिचान गर्नुहोस्।'
                            : 'Identify crop diseases using AI technology.'}
                    </p>
                </div>

                <Tabs defaultValue="diagnose" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <TabsTrigger
                            value="diagnose"
                            className="flex items-center justify-center gap-2 py-3 rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:font-semibold text-gray-500 transition-all font-medium"
                        >
                            <Stethoscope size={18} />
                            {language === 'ne' ? 'निदान गर्नुहोस्' : 'Diagnose'}
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex items-center justify-center gap-2 py-3 rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:font-semibold text-gray-500 transition-all font-medium"
                        >
                            <History size={18} />
                            {language === 'ne' ? 'इतिहास' : 'History'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="diagnose" className="space-y-6">
                        {/* Search Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-soft">
                            <form onSubmit={handleDiagnose} className="space-y-4">
                                <textarea
                                    placeholder={language === 'ne' ? 'उदाहरण: धानको पात पहेँलो हुने, पातमा दाग देखिने...' : 'E.g., Yellow spots on rice leaves...'}
                                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-readable resize-none"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    rows={4}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !query.trim()}
                                    className="w-full touch-target-comfortable bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-large-readable hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    {loading ? (language === 'ne' ? 'जाँच गर्दै...' : 'Analyzing...') : (language === 'ne' ? 'निदान गर्नुहोस्' : 'Diagnose')}
                                </button>
                            </form>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleReport}
                                    className="text-readable text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 touch-target"
                                >
                                    <AlertTriangle className="h-5 w-5" />
                                    {language === 'ne' ? 'यो समस्या रिपोर्ट गर्नुहोस्' : 'Report this issue to Experts'}
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {hasSearched && results.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                                <p className="text-large-readable">
                                    {language === 'ne' ? 'कुनै रोग फेला परेन। कृपया अर्को विवरण प्रयास गर्नुहोस्।' : 'No matching diseases found. Please try a different description.'}
                                </p>
                            </div>
                        )}

                        {results.map((diagnosis, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-medium border-2 border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`p-6 border-b-2 border-gray-100 ${diagnosis.riskLevel === 'CRITICAL' ? 'bg-red-50' :
                                    diagnosis.riskLevel === 'HIGH' ? 'bg-orange-50' : 'bg-green-50'
                                    }`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-2xl font-bold text-gray-900">{diagnosis.diseaseName}</h2>
                                        <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider ${diagnosis.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            diagnosis.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            <AlertTriangle size={16} />
                                            {language === 'ne' ?
                                                (diagnosis.riskLevel === 'CRITICAL' ? 'अति जोखिम' :
                                                    diagnosis.riskLevel === 'HIGH' ? 'उच्च जोखिम' : 'कम जोखिम')
                                                : diagnosis.riskLevel}
                                        </span>
                                    </div>
                                    <p className="text-large-readable text-gray-700">
                                        <span className="font-semibold">{language === 'ne' ? 'लक्षण:' : 'Symptoms:'}</span> {diagnosis.symptoms}
                                    </p>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                        <Leaf size={24} className="text-green-600" />
                                        {language === 'ne' ? 'के गर्ने' : 'What to do'}
                                    </h3>
                                    <div className="space-y-4">
                                        {diagnosis.treatments.map((tx, idx) => (
                                            <div key={idx} className="bg-gray-50 p-5 rounded-xl border-2 border-gray-100">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="font-bold text-large-readable text-gray-800">{tx.medicineName}</span>
                                                    <span className={`text-xs px-3 py-1 rounded-full border ${tx.isOrganic ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                        {tx.isOrganic ? (language === 'ne' ? 'जैविक' : 'Organic') : (language === 'ne' ? 'रासायनिक' : 'Chemical')}
                                                    </span>
                                                </div>
                                                <div className="text-readable text-gray-600 mb-3">
                                                    <strong>{language === 'ne' ? 'मात्रा:' : 'Dosage:'}</strong> {tx.dosage}
                                                </div>
                                                <div className="text-readable bg-yellow-50 text-yellow-800 p-3 rounded-lg border-2 border-yellow-200 flex items-start gap-2">
                                                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                    <span>{tx.safetyInstructions}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex items-start gap-3 p-5 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
                                        <ShieldAlert size={28} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-readable uppercase tracking-wide mb-2">
                                                {language === 'ne' ? 'सुरक्षा सावधानी' : 'Safety Warning'}
                                            </p>
                                            <p className="text-readable">{diagnosis.safetyDisclaimer}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="history">
                        {!user ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                <p className="text-gray-500 mb-4">Please login to view your diagnosis history</p>
                            </div>
                        ) : (
                            <InfiniteScroll
                                isLoading={isFetchingNextPage}
                                hasMore={!!hasNextPage}
                                onLoadMore={fetchNextPage}
                                className="space-y-4"
                            >
                                {historyItems.length === 0 && !isHistoryLoading ? (
                                    <div className="text-center py-12 bg-white rounded-xl text-gray-500">
                                        No history found. Start by diagnosing a crop!
                                    </div>
                                ) : (
                                    historyItems.map((item: any) => (
                                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold text-gray-800">{item.cropType}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.reviewStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    item.reviewStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.reviewStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2 truncate">{JSON.stringify(item.inputReferences || {})}</p>
                                            <div className="text-xs text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </InfiniteScroll>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default DiagnosticTool;
