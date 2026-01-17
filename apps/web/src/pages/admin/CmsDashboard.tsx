
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { CMS_ENDPOINTS } from '@/config/endpoints';
import { Button } from "@/components/ui/button";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

interface Article {
    id: string;
    titleEn: string;
    status: string;
    authorName?: string;
}

const CmsDashboard = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
    const [workflowAction, setWorkflowAction] = useState('APPROVE');
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await api.get(CMS_ENDPOINTS.ARTICLES, { params: { size: 100 } });
            if (res.data.code === 0) {
                setArticles(res.data.data.content || res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch articles", error);
            toast.error("Failed to load articles");
        }
    };

    const handleWorkflowAction = async () => {
        if (!selectedArticle) return;
        try {
            await api.post(CMS_ENDPOINTS.WORKFLOW(selectedArticle.id), {
                action: workflowAction,
                comment: comment
            });
            setOpenWorkflowDialog(false);
            setComment('');
            fetchArticles(); // Refresh list
            toast.success("Workflow action completed successfully");
        } catch (error) {
            console.error('Workflow action failed', error);
            toast.error("Failed to process workflow action");
        }
    };

    const openActionDialog = (article: Article) => {
        setSelectedArticle(article);
        setWorkflowAction('APPROVE'); // Reset default
        setComment('');
        setOpenWorkflowDialog(true);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'default'; // default in shadcn is primary/black
            case 'UNDER_REVIEW': return 'secondary';
            case 'DRAFT': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management Dashboard</h1>
                <p className="text-muted-foreground">Manage article workflows and publishing</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Articles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">{article.titleEn}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(article.status)}>
                                            {article.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline">Edit</Button>
                                            <Button
                                                size="sm"
                                                onClick={() => openActionDialog(article)}
                                            >
                                                Workflow
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={openWorkflowDialog} onOpenChange={setOpenWorkflowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Workflow Action: {selectedArticle?.titleEn}</DialogTitle>
                        <DialogDescription>
                            Change status or add comments to this article.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="action">Action</Label>
                            <Select
                                value={workflowAction}
                                onValueChange={setWorkflowAction}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBMIT">Submit for Review</SelectItem>
                                    <SelectItem value="APPROVE">Approve</SelectItem>
                                    <SelectItem value="REJECT">Reject (Return to Draft)</SelectItem>
                                    <SelectItem value="PUBLISH">Publish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea
                                id="comment"
                                placeholder="Add optional comments..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenWorkflowDialog(false)}>Cancel</Button>
                        <Button onClick={handleWorkflowAction}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CmsDashboard;
