import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';

import api from '@/services/api';
import { FEEDBACK_ENDPOINTS } from '@/config/endpoints';
import { toast } from 'sonner';

interface Feedback {
    id: string;
    type: 'ISSUE' | 'SUGGESTION' | 'OTHER';
    message: string;
    status: 'OPEN' | 'RESOLVED' | 'REJECTED';
    createdAt: string;
    user: {
        name: string;
        mobileNumber: string;
    };
}

const FeedbackManager = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await api.get(FEEDBACK_ENDPOINTS.ADMIN);
            if (res.data.code === 0) {
                setFeedbacks(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch feedback");
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(FEEDBACK_ENDPOINTS.UPDATE_STATUS(id), { status });
            toast.success("Status updated");
            fetchFeedback();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Feedback & Support</h2>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell className="w-[40%]">Message</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feedbacks.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{item.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-muted-foreground">{item.user?.mobileNumber}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{item.type}</Badge>
                                </TableCell>
                                <TableCell className="whitespace-pre-wrap">{item.message}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'OPEN' ? 'destructive' : item.status === 'RESOLVED' ? 'default' : 'secondary'}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={item.status}
                                        onValueChange={(val) => handleStatusUpdate(item.id, val)}
                                    >
                                        <SelectTrigger className="w-[110px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                        {feedbacks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No feedback found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default FeedbackManager;
