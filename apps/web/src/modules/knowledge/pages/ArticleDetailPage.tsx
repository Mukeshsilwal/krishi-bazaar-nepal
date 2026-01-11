import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import knowledgeService, { Article } from '../services/knowledgeService';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

const ArticleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchArticle(id);
    }, [id]);

    const fetchArticle = async (articleId: string) => {
        try {
            const data = await knowledgeService.getArticleById(articleId);
            setArticle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!article) return <div>Article not found</div>;

    const title = language === 'ne' ? article.titleNe : article.titleEn;
    const content = language === 'ne' ? article.contentNe : article.contentEn;
    const category = language === 'ne' ? article.category.nameNe : article.category.nameEn;

    return (
        <div className="bg-white min-h-full">
            <main className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/knowledge')}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
                >
                    <ArrowLeft size={20} />
                    Back to Knowledge Hub
                </button>

                <article>
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
                            {category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {title}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 items-center">
                            <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <User size={16} />
                                Kisan Sarathi Team
                            </span>
                        </div>
                    </div>

                    {article.coverImageUrl && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                            <img src={article.coverImageUrl} alt={title} className="w-full h-auto object-cover max-h-[500px]" />
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none prose-green">
                        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                    </div>

                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                        <Tag size={14} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
};

export default ArticleDetailPage;
