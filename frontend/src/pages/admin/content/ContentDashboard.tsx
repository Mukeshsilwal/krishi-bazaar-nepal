import React, { useState, useEffect } from 'react';
import { contentService, ContentDTO, ContentFilterDTO } from '@/services/contentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Plus, Filter, LayoutGrid, List as ListIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContentDashboard = () => {
    const navigate = useNavigate();
    const [contents, setContents] = useState<ContentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Filters
    const [filters, setFilters] = useState<ContentFilterDTO>({
        page: 0,
        size: 20
    });

    useEffect(() => {
        loadContents();
    }, [filters]);

    const loadContents = async () => {
        setLoading(true);
        try {
            const page = await contentService.getContents(filters);
            console.log('ContentDashboard received page:', page);
            if (page && page.content) {
                setContents(page.content);
            } else {
                console.warn('Page content is missing/undefined', page);
                setContents([]);
            }
        } catch (error) {
            console.error("Failed to load content", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof ContentFilterDTO, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === 'ALL' ? undefined : value, page: 0 }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge className="bg-green-500">Active</Badge>;
            case 'DRAFT': return <Badge variant="outline" className="text-gray-500">Draft</Badge>;
            case 'REVIEW': return <Badge className="bg-orange-500">Review</Badge>;
            case 'DEPRECATED': return <Badge variant="destructive">Deprecated</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground">Manage structured agricultural intelligence assets</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
                        {viewMode === 'list' ? <LayoutGrid className="mr-2 h-4 w-4" /> : <ListIcon className="mr-2 h-4 w-4" />}
                        {viewMode === 'list' ? 'Grid' : 'List'}
                    </Button>
                    <Button onClick={() => navigate('/admin/content/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Create Content
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search title..." className="h-9" />
                    </div>

                    <Select onValueChange={(v) => handleFilterChange('contentType', v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Content Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="CROP">Crop Intelligence</SelectItem>
                            <SelectItem value="DISEASE">Disease Knowledge</SelectItem>
                            <SelectItem value="PEST">Pest Knowledge</SelectItem>
                            <SelectItem value="WEATHER">Weather Advisory</SelectItem>
                            <SelectItem value="POLICY">Policy</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="REVIEW">Review</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Content List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                    {contents.map(content => (
                        <Card key={content.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/admin/content/${content.id}`)}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg leading-tight">{content.title}</CardTitle>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span>{content.contentType}</span>
                                            <span>•</span>
                                            <span>{content.language.toUpperCase()}</span>
                                            <span>•</span>
                                            <span>v{content.version}</span>
                                        </div>
                                    </div>
                                    {getStatusBadge(content.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {content.summary || "No summary available"}
                                </p>
                                {content.tags && content.tags.length > 0 && (
                                    <div className="flex gap-1 mt-3 flex-wrap">
                                        {content.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {contents.length === 0 && (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>No content found matching your filters.</p>
                            <Button variant="link" onClick={() => setFilters({ page: 0, size: 20 })}>Clear Filters</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContentDashboard;
