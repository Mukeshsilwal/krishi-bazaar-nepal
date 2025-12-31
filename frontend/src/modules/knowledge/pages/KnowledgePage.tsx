import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import knowledgeService, { Article, KnowledgeCategory } from '../services/knowledgeService';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Search, BookOpen, Tag } from 'lucide-react';

const KnowledgePage = () => {
    const { language, t } = useLanguage();
    const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, articlesRes] = await Promise.all([
                knowledgeService.getCategories(),
                knowledgeService.getArticles(selectedCategory || undefined)
            ]);
            setCategories(catsRes);
            setArticles(articlesRes);
        } catch (error) {
            console.error("Failed to fetch knowledge base", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(article =>
        (language === 'ne' ? article.titleNe : article.titleEn).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-green-700 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        {language === 'ne' ? 'कृषि ज्ञान केन्द्र' : 'Agriculture Knowledge Hub'}
                    </h1>
                    <p className="text-green-100 max-w-2xl mx-auto mb-8">
                        {language === 'ne'
                            ? 'आधुनिक खेती प्रविधि, रोग नियन्त्रण र बजार सुझावहरूका लागि विश्वसनीय स्रोत।'
                            : 'Your trusted source for modern farming techniques, disease control, and market tips.'}
                    </p>

                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={language === 'ne' ? 'तपाइँ के सिक्न चाहनुहुन्छ?' : 'What do you want to learn?'}
                            className="w-full pl-10 pr-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Categories Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                            <Tag size={20} />
                            {language === 'ne' ? 'विधाहरु' : 'Categories'}
                        </h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-2 rounded-lg transition ${!selectedCategory ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {language === 'ne' ? 'सबै' : 'All'}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === cat.id ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {language === 'ne' ? cat.nameNe : cat.nameEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : filteredArticles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                {language === 'ne' ? 'कुनै लेख फेला परेन।' : 'No articles found.'}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredArticles.map(article => (
                                    <Link
                                        to={`/knowledge/${article.id}`}
                                        key={article.id}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col"
                                    >
                                        <div className="h-48 bg-gray-200 relative">
                                            {article.coverImageUrl ? (
                                                <img src={article.coverImageUrl} alt={language === 'ne' ? article.titleNe : article.titleEn} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs rounded-full font-medium text-green-700">
                                                {language === 'ne' ? article.category.nameNe : article.category.nameEn}
                                            </span>
                                        </div>
                                        <div className="p-4 flex-grow">
                                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                                {language === 'ne' ? article.titleNe : article.titleEn}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-3">
                                                {language === 'ne' ? article.contentNe.substring(0, 100) : article.contentEn.substring(0, 100)}...
                                            </p>
                                        </div>
                                        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default KnowledgePage;
