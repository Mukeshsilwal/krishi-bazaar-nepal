import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import legalService from '../services/legalService';
import { toast } from 'sonner';
import { Loader2, Calendar, FileText } from 'lucide-react';

const TermsOfServicePage = () => {
    const { language } = useLanguage();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await legalService.getTermsOfService();
                if (response.code === 0 || response.code === 'SUCCESS') {
                    setDocument(response.data);
                } else {
                    toast.error('Failed to load terms of service');
                }
            } catch (error) {
                console.error('Error fetching terms of service:', error);
                toast.error('Failed to load terms of service');
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Terms of Service Not Available</h2>
                <p className="text-gray-600">Please check back later.</p>
            </div>
        );
    }

    const title = language === 'ne' ? document.titleNe : document.titleEn;
    const content = language === 'ne' ? document.contentNe : document.contentEn;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Version {document.version}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {language === 'ne' ? 'प्रभावकारी मिति: ' : 'Effective Date: '}
                            {new Date(document.effectiveDate).toLocaleDateString(
                                language === 'ne' ? 'ne-NP' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                <div
                    className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                />
            </div>

            {/* Last Updated */}
            <div className="mt-12 pt-6 border-t text-sm text-gray-500">
                {language === 'ne' ? 'अन्तिम अपडेट: ' : 'Last Updated: '}
                {new Date(document.updatedAt).toLocaleDateString(
                    language === 'ne' ? 'ne-NP' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                )}
            </div>
        </div>
    );
};

export default TermsOfServicePage;
