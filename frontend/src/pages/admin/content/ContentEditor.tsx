import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService, ContentDTO } from '@/services/contentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Send, Archive, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const ContentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [content, setContent] = useState<Partial<ContentDTO>>({
        contentType: 'CROP',
        status: 'DRAFT',
        language: 'en',
        title: '',
        summary: '',
        supportedCrops: [],
        supportedRegions: [],
        tags: [],
        structuredBody: { sections: [] }
    });

    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (id && id !== 'new') {
            loadContent(id);
        }
    }, [id]);

    const loadContent = async (contentId: string) => {
        try {
            setLoading(true);
            const data = await contentService.getContent(contentId);
            setContent(data);
        } catch (error) {
            toast.error("Failed to load content");
            navigate('/admin/content');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (id && id !== 'new') {
                await contentService.updateContent(id, content);
                toast.success("Content updated");
            } else {
                const created = await contentService.createContent(content);
                toast.success("Content created");
                navigate(`/admin/content/${created.id}`);
            }
        } catch (error) {
            toast.error("Failed to save content");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = () => {
        const sections = content.structuredBody?.sections || [];
        setContent({
            ...content,
            structuredBody: {
                ...content.structuredBody,
                sections: [...sections, { heading: '', content: '' }]
            }
        });
    };

    const handleUpdateSection = (index: number, field: string, value: string) => {
        const sections = [...(content.structuredBody?.sections || [])];
        sections[index] = { ...sections[index], [field]: value };
        setContent({
            ...content,
            structuredBody: { ...content.structuredBody, sections }
        });
    };

    const handleRemoveSection = (index: number) => {
        const sections = [...(content.structuredBody?.sections || [])];
        sections.splice(index, 1);
        setContent({
            ...content,
            structuredBody: { ...content.structuredBody, sections }
        });
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/content')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{id === 'new' ? 'Create Content' : 'Edit Content'}</h1>
                        <p className="text-sm text-muted-foreground">{content.title || "Untitled"}</p>
                    </div>
                    {content.status && <Badge variant="outline">{content.status}</Badge>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    {content.status === 'DRAFT' && (
                        <Button onClick={() => contentService.submitForReview(id!).then(() => { toast.success("Submitted for review"); loadContent(id!) })} disabled={!id || id === 'new'}>
                            <Send className="h-4 w-4 mr-2" /> Submit Review
                        </Button>
                    )}
                    {content.status === 'REVIEW' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => contentService.publishContent(id!).then(() => { toast.success("Published"); loadContent(id!) })}>
                            Publish
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title (Required)</Label>
                                <Input
                                    value={content.title}
                                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                                    placeholder="Enter title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Summary</Label>
                                <Textarea
                                    value={content.summary}
                                    onChange={(e) => setContent({ ...content, summary: e.target.value })}
                                    placeholder="Brief summary for list views..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Structured Content</CardTitle>
                            <Button size="sm" variant="outline" onClick={handleAddSection}>
                                <Plus className="h-4 w-4 mr-2" /> Add Section
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {content.structuredBody?.sections?.map((section: any, idx: number) => (
                                <div key={idx} className="border p-4 rounded-lg relative space-y-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-destructive"
                                        onClick={() => handleRemoveSection(idx)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="space-y-2">
                                        <Label>Section Heading</Label>
                                        <Input
                                            value={section.heading}
                                            onChange={(e) => handleUpdateSection(idx, 'heading', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Body Text</Label>
                                        <Textarea
                                            className="min-h-[100px]"
                                            value={section.content}
                                            onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!content.structuredBody?.sections || content.structuredBody.sections.length === 0) && (
                                <div className="text-center p-6 bg-muted/50 rounded-lg text-muted-foreground text-sm">
                                    No sections added. Click "Add Section" to start writing structured content.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={content.contentType}
                                    onValueChange={(v: any) => setContent({ ...content, contentType: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CROP">Crop Intelligence</SelectItem>
                                        <SelectItem value="DISEASE">Disease Knowledge</SelectItem>
                                        <SelectItem value="PEST">Pest Knowledge</SelectItem>
                                        <SelectItem value="WEATHER">Weather Advisory</SelectItem>
                                        <SelectItem value="POLICY">Policy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Severity</Label>
                                <Select
                                    value={content.severity || 'INFO'}
                                    onValueChange={(v: any) => setContent({ ...content, severity: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFO">Info</SelectItem>
                                        <SelectItem value="WARNING">Warning</SelectItem>
                                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Select
                                    value={content.language}
                                    onValueChange={(v) => setContent({ ...content, language: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ne">Nepali</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add tag"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTag) {
                                                    setContent({ ...content, tags: [...(content.tags || []), newTag] });
                                                    setNewTag('');
                                                }
                                            }
                                        }}
                                    />
                                    <Button size="icon" variant="outline" onClick={() => {
                                        if (newTag) {
                                            setContent({ ...content, tags: [...(content.tags || []), newTag] });
                                            setNewTag('');
                                        }
                                    }}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {content.tags?.map((tag, i) => (
                                        <Badge key={i} variant="secondary">
                                            {tag}
                                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => {
                                                const tags = [...(content.tags || [])];
                                                tags.splice(i, 1);
                                                setContent({ ...content, tags });
                                            }} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContentEditor;
