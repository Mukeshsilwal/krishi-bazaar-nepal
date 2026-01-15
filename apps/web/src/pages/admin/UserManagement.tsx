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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Ban, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';

interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    district?: string;
}

const UserManagement = () => {
    const { setTitle } = useAdminTitle();

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        setTitle('User Management', 'प्रयोगकर्ता व्यवस्थापन');
    }, [setTitle]);

    // Initial Fetch & Filter Change
    useEffect(() => {
        fetchUsers(0, true);
    }, [debouncedSearchTerm, selectedRole, selectedStatus]);

    const fetchUsers = async (pageNo: number, isReset: boolean = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNo.toString());
            params.append('size', '20');

            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (selectedRole && selectedRole !== 'all') params.append('role', selectedRole);
            if (selectedStatus !== 'all') params.append('status', selectedStatus === 'active' ? 'true' : 'false');

            const response = await api.get(`${ADMIN_ENDPOINTS.USERS}?${params.toString()}`);

            // Updated to check code === 0 instead of deprecated success boolean
            if (response.data.code === 0) {
                const newUsers = response.data.data.content;
                setUsers(prev => isReset ? newUsers : [...prev, ...newUsers]);
                setHasMore(!response.data.data.last);
                setPage(pageNo);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchUsers(page + 1);
        }
    };

    const toggleStatus = async (user: User) => {
        if (!window.confirm(`Are you sure you want to ${user.enabled ? 'deactivate' : 'activate'} ${user.name}?`)) {
            return;
        }

        // Optimistic update
        const originalUsers = [...users];
        setUsers(users.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u));

        try {
            const response = await api.patch(ADMIN_ENDPOINTS.USER_STATUS(user.id), { enabled: !user.enabled });

            if (response.data.code === 0) {
                toast.success(`User ${!user.enabled ? 'activated' : 'deactivated'} successfully`);
            } else {
                throw new Error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            // Revert on failure
            setUsers(originalUsers);
            console.error('Failed to update status', error);
            toast.error("Failed to update user status");
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setSelectedStatus('all');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage platform users, roles, and access</p>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Users Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="FARMER">Farmer</SelectItem>
                                <SelectItem value="BUYER">Buyer</SelectItem>
                                <SelectItem value="VENDOR">Vendor</SelectItem>
                                <SelectItem value="EXPERT">Expert</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Disabled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <InfiniteScroll
                            isLoading={loading && page > 0}
                            hasMore={hasMore}
                            onLoadMore={loadMore}
                            loader={<div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>}
                            endMessage={users.length > 0 ? <div className="p-4 text-center text-xs text-muted-foreground">End of Users List</div> : null}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>User Details</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                                No users found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.name || 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email || user.mobileNumber}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.enabled ? "default" : "destructive"} className="rounded-full px-2 py-0.5 text-[10px]">
                                                        {user.enabled ? "Active" : "Disabled"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{user.district || '-'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleStatus(user)}
                                                        className={user.enabled ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                                    >
                                                        {user.enabled ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </InfiniteScroll>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
