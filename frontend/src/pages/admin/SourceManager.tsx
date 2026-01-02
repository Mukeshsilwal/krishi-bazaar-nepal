import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface KnowledgeSource {
    id: string;
    name: string;
    organization: string;
    url: string;
    type: 'RSS_FEED' | 'REST_API' | 'MANUAL_UPLOAD';
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
    trustScore: number;
    licenseType?: string;
    allowedUsage?: string;
}

const SourceManager = () => {
    const { setTitle } = useAdminTitle();
    const [sources, setSources] = useState<KnowledgeSource[]>([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<KnowledgeSource>>({
        type: 'RSS_FEED',
        status: 'PENDING_APPROVAL',
        trustScore: 50
    });

    useEffect(() => {
        setTitle('Sources', 'स्रोतहरू');
        fetchSources();
    }, [setTitle]);

    const fetchSources = async () => {
        try {
            const res = await api.get('/knowledge/sources');
            setSources(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch sources");
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && formData.id) {
                await api.put(`/knowledge/sources/${formData.id}`, formData);
                toast.success("Source updated successfully");
            } else {
                await api.post('/knowledge/sources', formData);
                toast.success("Source created successfully");
            }
            setOpen(false);
            fetchSources();
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save source");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this source?")) return;
        try {
            await api.delete(`/knowledge/sources/${id}`);
            toast.success("Source deleted");
            fetchSources();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete source");
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'RSS_FEED',
            status: 'PENDING_APPROVAL',
            trustScore: 50
        });
        setIsEditing(false);
    };

    const openEdit = (source: KnowledgeSource) => {
        setFormData(source);
        setIsEditing(true);
        setOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Knowledge Sources</h2>
                    <p className="text-muted-foreground">Manage verified data sources for knowledge ingestion</p>
                </div>
                <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Source</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Source' : 'Add New Source'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Source Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Nepal Agriculture Research Council"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Organization</Label>
                                <Input
                                    value={formData.organization || ''}
                                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                    placeholder="Organization Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Feed URL</Label>
                                <Input
                                    value={formData.url || ''}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://example.com/feed.xml"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RSS_FEED">RSS Feed</SelectItem>
                                            <SelectItem value="REST_API">REST API</SelectItem>
                                            <SelectItem value="MANUAL_UPLOAD">Manual Upload</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>License Type</Label>
                                <Input
                                    value={formData.licenseType || ''}
                                    onChange={e => setFormData({ ...formData, licenseType: e.target.value })}
                                    placeholder="e.g. CC-BY 4.0"
                                />
                            </div>
                            <Button className="w-full" onClick={handleSubmit}>Save Source</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Trust Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sources.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No sources defined.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sources.map((source) => (
                                    <TableRow key={source.id}>
                                        <TableCell>
                                            <div className="font-medium">{source.name}</div>
                                            <div className="text-xs text-muted-foreground">{source.organization}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{source.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={source.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {source.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{source.trustScore}/100</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={source.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(source)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(source.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SourceManager;
