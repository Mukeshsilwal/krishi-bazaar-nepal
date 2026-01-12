import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Save,
  X,
  Upload
} from 'lucide-react';
import knowledgeService, { Article, KnowledgeCategory } from '@/modules/knowledge/services/knowledgeService';
import imageUploadService from '@/services/imageUploadService';
import { toast } from 'sonner';

const KnowledgeCMSPage = () => {
  const { language } = useLanguage();
  const { setTitle } = useAdminTitle();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isEditing) {
      setTitle('Create / Edit Content', 'सामग्री सिर्जना / सम्पादन');
    } else {
      setTitle('Knowledge Content', 'ज्ञान सामग्री');
    }
  }, [isEditing, setTitle]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [arts, cats] = await Promise.all([
        knowledgeService.getArticles(undefined, undefined, 'ALL'),
        knowledgeService.getCategories()
      ]);
      setArticles(arts);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArticle.id) {
        await knowledgeService.updateArticle(editingArticle.id, editingArticle);
        toast.success(language === 'ne' ? 'लेख अपडेट भयो' : 'Article updated successfully');
      } else {
        await knowledgeService.createArticle(editingArticle);
        toast.success(language === 'ne' ? 'लेख सिर्जना भयो' : 'Article created successfully');
      }
      setIsEditing(false);
      setEditingArticle({});
      loadData();
    } catch (error) {
      toast.error(language === 'ne' ? 'असफल भयो' : 'Failed to save article');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'ne' ? 'के तपाईं यो मेटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this?')) {
      try {
        await knowledgeService.deleteArticle(id);
        toast.success(language === 'ne' ? 'मेटाइयो' : 'Deleted successfully');
        loadData();
      } catch (error) {
        toast.error(language === 'ne' ? 'मेटाउन असफल' : 'Failed to delete');
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.titleNe?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category?.id === filterCategory;
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isEditing) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingArticle.id
                ? (language === 'ne' ? 'लेख सम्पादन' : 'Edit Article')
                : (language === 'ne' ? 'नयाँ लेख' : 'New Article')
              }
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Metadata */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    {language === 'ne' ? 'मेटाडाटा' : 'Metadata'}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'वर्ग' : 'Category'} *
                    </label>
                    <Select
                      value={editingArticle.category?.id || ''}
                      onValueChange={(value) => {
                        const cat = categories.find(c => c.id === value);
                        if (cat) setEditingArticle({ ...editingArticle, category: cat });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ne' ? 'वर्ग छान्नुहोस्' : 'Select Category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {language === 'ne' ? c.nameNe : c.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'स्थिति' : 'Status'}
                    </label>
                    <Select
                      value={editingArticle.status || 'DRAFT'}
                      onValueChange={(value) => setEditingArticle({ ...editingArticle, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">{language === 'ne' ? 'ड्राफ्ट' : 'Draft'}</SelectItem>
                        <SelectItem value="REVIEW">{language === 'ne' ? 'समीक्षा' : 'Review'}</SelectItem>
                        <SelectItem value="PUBLISHED">{language === 'ne' ? 'प्रकाशित' : 'Published'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'ट्यागहरू (अल्पविरामले छुट्याउनुहोस्)' : 'Tags (comma separated)'}
                    </label>
                    <Input
                      value={editingArticle.tags?.join(', ') || ''}
                      onChange={e => setEditingArticle({
                        ...editingArticle,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      placeholder={language === 'ne' ? 'धान, खेती, जैविक' : 'rice, farming, organic'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'कभर इमेज URL' : 'Cover Image URL'}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={editingArticle.coverImageUrl || ''}
                        onChange={e => setEditingArticle({ ...editingArticle, coverImageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                      <input
                        type="file"
                        id="cms-upload-input"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            try {
                              toast.info(language === 'ne' ? 'अपलोड हुँदैछ...' : 'Uploading...');
                              const url = await imageUploadService.uploadImage(e.target.files[0], 'CONTENT');
                              setEditingArticle(prev => ({ ...prev, coverImageUrl: url }));
                              toast.success(language === 'ne' ? 'सफलतापूर्वक अपलोड भयो' : 'Uploaded successfully');
                            } catch (err) {
                              toast.error(language === 'ne' ? 'अपलोड असफल भयो' : 'Upload failed');
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('cms-upload-input')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingArticle.coverImageUrl && (
                      <img
                        src={editingArticle.coverImageUrl}
                        alt="Cover"
                        className="mt-2 h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Right Column - Content Editor */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    {language === 'ne' ? 'सामग्री' : 'Content'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ne' ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'} *
                      </label>
                      <Input
                        value={editingArticle.titleEn || ''}
                        onChange={e => setEditingArticle({ ...editingArticle, titleEn: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === 'ne' ? 'शीर्षक (नेपाली)' : 'Title (Nepali)'} *
                      </label>
                      <Input
                        value={editingArticle.titleNe || ''}
                        onChange={e => setEditingArticle({ ...editingArticle, titleNe: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'सामग्री (अंग्रेजी)' : 'Content (English)'} *
                    </label>
                    <Textarea
                      className="min-h-[200px]"
                      value={editingArticle.contentEn || ''}
                      onChange={e => setEditingArticle({ ...editingArticle, contentEn: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ne' ? 'सामग्री (नेपाली)' : 'Content (Nepali)'} *
                    </label>
                    <Textarea
                      className="min-h-[200px]"
                      value={editingArticle.contentNe || ''}
                      onChange={e => setEditingArticle({ ...editingArticle, contentNe: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingArticle({ ...editingArticle, status: 'DRAFT' as any })}
                >
                  {language === 'ne' ? 'ड्राफ्ट बचत गर्नुहोस्' : 'Save Draft'}
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  {language === 'ne' ? 'बचत गर्नुहोस्' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {language === 'ne' ? 'लेख व्यवस्थापन' : 'Article Management'}
          </CardTitle>
          <Button onClick={() => { setIsEditing(true); setEditingArticle({ status: 'DRAFT' as any }); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ne' ? 'नयाँ लेख' : 'New Article'}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ne' ? 'खोज्नुहोस्...' : 'Search...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'ne' ? 'वर्ग' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै वर्ग' : 'All Categories'}</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {language === 'ne' ? c.nameNe : c.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={language === 'ne' ? 'स्थिति' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै स्थिति' : 'All Status'}</SelectItem>
                <SelectItem value="DRAFT">{language === 'ne' ? 'ड्राफ्ट' : 'Draft'}</SelectItem>
                <SelectItem value="REVIEW">{language === 'ne' ? 'समीक्षा' : 'Review'}</SelectItem>
                <SelectItem value="PUBLISHED">{language === 'ne' ? 'प्रकाशित' : 'Published'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{language === 'ne' ? 'शीर्षक' : 'Title'}</TableHead>
                  <TableHead>{language === 'ne' ? 'वर्ग' : 'Category'}</TableHead>
                  <TableHead>{language === 'ne' ? 'स्थिति' : 'Status'}</TableHead>
                  <TableHead>{language === 'ne' ? 'अपडेट मिति' : 'Last Updated'}</TableHead>
                  <TableHead className="text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {language === 'ne' ? 'लोड हुँदैछ...' : 'Loading...'}
                    </TableCell>
                  </TableRow>
                ) : filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {language === 'ne' ? 'कुनै लेख भेटिएन' : 'No articles found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map(article => (
                    <TableRow key={article.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{language === 'ne' ? article.titleNe : article.titleEn}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ne' ? article.titleEn : article.titleNe}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {language === 'ne' ? article.category?.nameNe : article.category?.nameEn}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            article.status === 'PUBLISHED' ? 'default' :
                              article.status === 'REVIEW' ? 'secondary' : 'outline'
                          }
                        >
                          {article.status === 'PUBLISHED' ? (language === 'ne' ? 'प्रकाशित' : 'Published') :
                            article.status === 'REVIEW' ? (language === 'ne' ? 'समीक्षा' : 'Review') :
                              (language === 'ne' ? 'ड्राफ्ट' : 'Draft')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditingArticle(article); setIsEditing(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default KnowledgeCMSPage;
