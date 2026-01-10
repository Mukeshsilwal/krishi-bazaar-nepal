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
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { KNOWLEDGE_ENDPOINTS } from '@/config/endpoints';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RawContent {
    originalText: string;
    sourceUrl: string;
}

interface ProcessedKnowledge {
    title: string;
    processedContent: string;
    language: string;
    tags: string;
    rawContent: RawContent;
}

interface ModerationItem {
    id: string;
    processedKnowledge: ProcessedKnowledge;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_EDIT';
    createdAt: string;
}

const ModerationQueue = () => {
    const { setTitle } = useAdminTitle();
    const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
    const [open, setOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const queryClient = useQueryClient();

    // Mock reviewer ID for now - in real app, get from Auth Context
    const reviewerId = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        setTitle('Moderation Queue', 'मध्यस्थता लाम');
    }, [setTitle]);

    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ['moderation-queue'],
        queryFn: async () => {
            try {
                const res = await api.get(KNOWLEDGE_ENDPOINTS.MODERATION_PENDING);

                return res.data.data || [];
            } catch (err) {
                console.error('Moderation Queue Fetch Error:', err);
                throw err;
            }
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(KNOWLEDGE_ENDPOINTS.APPROVE(id, reviewerId));
        },
        onSuccess: () => {
            toast.success("Approved and Published");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
        },
        onError: () => {
            toast.error("Failed to approve");
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            await api.post(`${KNOWLEDGE_ENDPOINTS.REJECT(id)}?reviewerId=${reviewerId}`, reason, {
                headers: { 'Content-Type': 'text/plain' }
            });
        },
        onSuccess: () => {
            toast.success("Rejected");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
        },
        onError: () => {
            toast.error("Failed to reject");
        }
    });

    const handleApprove = (id: string) => {
        approveMutation.mutate(id);
    };

    const handleReject = (id: string) => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason");
            return;
        }
        rejectMutation.mutate({ id, reason: rejectReason });
    };

    const openReview = (item: ModerationItem) => {
        setSelectedItem(item);
        setIsRejecting(false);
        setRejectReason('');
        setOpen(true);
    };

    if (isError) return <div className="p-4 text-red-500">Failed to load moderation queue.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Moderation Queue</h2>
            <p className="text-muted-foreground">Review and approve AI-generated advisories before publishing.</p>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title (Draft)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No pending items.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item: ModerationItem) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">{item.processedKnowledge.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => openReview(item)}>
                                                <Eye className="mr-2 h-4 w-4" /> Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Advisory</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="space-y-2 border-r pr-4">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Raw Source Content</h3>
                                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                                    {selectedItem.processedKnowledge.rawContent.originalText}
                                </div>
                                <div className="text-xs text-blue-600 truncate">
                                    <a href={selectedItem.processedKnowledge.rawContent.sourceUrl} target="_blank" rel="noreferrer">
                                        Source: {selectedItem.processedKnowledge.rawContent.sourceUrl}
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-4 text-left">
                                <h3 className="font-semibold text-sm uppercase text-green-700">AI Generated Draft (Nepali)</h3>
                                <div className="border p-4 rounded-md shadow-sm">
                                    <h4 className="font-bold text-lg mb-2">{selectedItem.processedKnowledge.title}</h4>
                                    <div className="text-sm whitespace-pre-wrap">
                                        {selectedItem.processedKnowledge.processedContent}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        {JSON.parse(selectedItem.processedKnowledge.tags || '[]').map((tag: string, i: number) => (
                                            <Badge key={i} variant="outline">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>

                                {!isRejecting ? (
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleApprove(selectedItem.id)}
                                            disabled={approveMutation.isPending}
                                        >
                                            {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                            Approve & Publish
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => setIsRejecting(true)}
                                            disabled={rejectMutation.isPending}
                                        >
                                            <X className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-4 bg-red-50 p-2 rounded">
                                        <label className="text-sm font-medium text-red-700">Reason for Rejection</label>
                                        <Textarea
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            placeholder="Why is this advisory invalid?"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReject(selectedItem.id)}
                                                disabled={rejectMutation.isPending}
                                            >
                                                {rejectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Reject"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ModerationQueue;
