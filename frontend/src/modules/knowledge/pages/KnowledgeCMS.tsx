import React, { useState, useEffect } from 'react';
import knowledgeService, { Article, KnowledgeCategory } from '../services/knowledgeService';
import { Plus, Edit, Trash, BookOpen } from 'lucide-react';

const KnowledgeCMS = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [arts, cats] = await Promise.all([
            knowledgeService.getArticles(),
            knowledgeService.getCategories()
        ]);
        setArticles(arts);
        setCategories(cats);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingArticle.id) {
                await knowledgeService.updateArticle(editingArticle.id, editingArticle);
            } else {
                await knowledgeService.createArticle(editingArticle);
            }
            setIsEditing(false);
            setEditingArticle({});
            loadData();
        } catch (error) {
            console.error("Failed to save article");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            await knowledgeService.deleteArticle(id);
            loadData();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="text-green-600" />
                    Knowledge Base Management
                </h2>
                <button
                    onClick={() => { setIsEditing(true); setEditingArticle({}); }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                    <Plus size={18} /> New Article
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (English)</label>
                            <input
                                className="w-full border rounded p-2"
                                value={editingArticle.titleEn || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, titleEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Nepali)</label>
                            <input
                                className="w-full border rounded p-2"
                                value={editingArticle.titleNe || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, titleNe: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Content (English)</label>
                            <textarea
                                className="w-full border rounded p-2 h-32"
                                value={editingArticle.contentEn || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, contentEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Content (Nepali)</label>
                            <textarea
                                className="w-full border rounded p-2 h-32"
                                value={editingArticle.contentNe || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, contentNe: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full border rounded p-2"
                                value={editingArticle.category?.id || ''}
                                onChange={e => {
                                    const cat = categories.find(c => c.id === e.target.value);
                                    if (cat) setEditingArticle({ ...editingArticle, category: cat });
                                }}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nameEn} / {c.nameNe}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                            <input
                                className="w-full border rounded p-2"
                                value={editingArticle.tags?.join(', ') || ''}
                                onChange={e => setEditingArticle({ ...editingArticle, tags: e.target.value.split(',').map(t => t.trim()) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cover Image URL</label>
                        <input
                            className="w-full border rounded p-2"
                            value={editingArticle.coverImageUrl || ''}
                            onChange={e => setEditingArticle({ ...editingArticle, coverImageUrl: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Save Article
                        </button>
                    </div>
                </form>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Title</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="font-medium">{article.titleEn}</div>
                                        <div className="text-sm text-gray-500">{article.titleNe}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                            {article.category?.nameEn}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button
                                            onClick={() => { setEditingArticle(article); setIsEditing(true); }}
                                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default KnowledgeCMS;
