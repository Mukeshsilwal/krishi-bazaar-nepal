import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sprout, ShieldAlert, Droplets, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import knowledgeService, { Article } from '@/modules/knowledge/services/knowledgeService';

const AdvisoryWidget = () => {
    const { language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvisories = async () => {
            try {
                // Fetch recent published articles
                // Assuming getArticles returns a list of articles directly or via a wrapper
                const data = await knowledgeService.getArticles(undefined, undefined, 'PUBLISHED');
                if (Array.isArray(data)) {
                    setArticles(data.slice(0, 3));
                } else if ((data as any).content && Array.isArray((data as any).content)) {
                    // Handle paginated response if backend sends it
                    setArticles((data as any).content.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch advisory articles", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisories();
    }, []);

    const getIconForCategory = (categoryName: string) => {
        const lower = categoryName?.toLowerCase() || '';
        if (lower.includes('water') || lower.includes('irrigation') || lower.includes('सिंचाइ')) return Droplets;
        if (lower.includes('disease') || lower.includes('pest') || lower.includes('रोग')) return ShieldAlert;
        return Sprout;
    };

    const getColorForCategory = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-red-100 text-red-600',
            'bg-green-100 text-green-600',
            'bg-amber-100 text-amber-600'
        ];
        return colors[index % colors.length];
    };

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
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : articles.length > 0 ? (
                    articles.map((item, index) => {
                        const Icon = getIconForCategory(item.category?.nameEn || '');
                        const colorClass = getColorForCategory(index);
                        return (
                            <Link
                                key={item.id}
                                to={`/knowledge/${item.id}`}
                                className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-1`}>
                                    <Icon size={20} />
                                </div>
                                <div className="ml-4 overflow-hidden">
                                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {language === 'ne' ? item.titleNe : item.titleEn}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                        {/* Strip HTML tags if content is rich text */}
                                        {(language === 'ne' ? item.contentNe : item.contentEn)?.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>{language === 'ne' ? 'कुनै पनि सुझाव उपलब्ध छैन' : 'No advisories available currently'}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AdvisoryWidget;
