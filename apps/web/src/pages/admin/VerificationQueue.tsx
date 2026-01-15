import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import api from '@/services/api';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
    description?: string; // e.g. "I am an expert in wheat"
    createdAt: string;
    district?: string;
    proofDocumentUrl?: string; // if they uploaded something
}

const VerificationQueue = () => {
    const { setTitle } = useAdminTitle();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle('Verification Queue', 'प्रमाणीकरण लाम');
        fetchPendingUsers();
    }, [setTitle]);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            // Request large size for now
            const response = await api.get('/admin/vendors/pending?page=0&size=100');
            if (response.data.code === 0) {
                // Backend now returns PaginatedResponse
                setUsers(response.data.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch pending users', error);
            toast.error("Failed to load verification queue");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (user: User) => {
        if (!window.confirm(`Approve ${user.name} as ${user.role}?`)) return;

        try {
            await api.post(`/admin/users/${user.id}/approve`);
            toast.success(`${user.name} approved successfully`);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) {
            toast.error("Failed to approve user");
        }
    };

    // Rejection not implemented in backend yet, so maybe just a placeholder or delete user?
    // For now, let's assume we can't easily "Reject" without deleting or staying pending.
    // I'll leave the button but functionality might be limited.

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Pending Verifications</h1>
            <p className="text-muted-foreground">Review and approve requests for Experts and Vendors.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role Requested</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Registered On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No pending verifications.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email || user.mobileNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>{user.district || '-'}</TableCell>
                                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(user)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                    </Button>
                                                    {/* Reject button hidden/disabled until backend supports it safely */}
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
        </div>
    );
};

export default VerificationQueue;
