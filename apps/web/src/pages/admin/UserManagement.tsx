import React, { useState, useEffect, useCallback } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Ban, CheckCircle, Loader2, RotateCcw, UserCheck, UserX, Shield, Plus, Trash2 } from "lucide-react";
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { ADMIN_ENDPOINTS, ADMIN_RBAC_ENDPOINTS } from '@/config/endpoints';
import userVerificationService from '@/services/userVerificationService';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Role {
    id: string;
    name: string;
    description: string;
    isSystemDefined: boolean;
    permissions?: string[];
}

interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber: string;
    role: string;
    enabled: boolean;
    verified: boolean;
    createdAt: string;
    district?: string;
    assignedRoles?: Role[];
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
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);

    // Dialog States
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: 'verify' | 'unverify' | 'enable' | 'disable' | null;
        user: User | null;
    }>({ open: false, type: null, user: null });

    const [roleDialog, setRoleDialog] = useState<{
        open: boolean;
        user: User | null;
    }>({ open: false, user: null });

    const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<string>('');

    useEffect(() => {
        setTitle('User Management', 'प्रयोगकर्ता व्यवस्थापन');
        fetchAvailableRoles();
    }, [setTitle]);

    // Initial Fetch & Filter Change
    useEffect(() => {
        fetchUsers(0, true);
    }, [debouncedSearchTerm, selectedRole, selectedStatus]);

    const fetchAvailableRoles = async () => {
        try {
            const response = await api.get(ADMIN_RBAC_ENDPOINTS.ROLES);
            if (response.data.code === 0) {
                const content = response.data.data?.content;
                setAvailableRoles(Array.isArray(content) ? content : []);
            }
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    };

    const fetchUsers = useCallback(async (pageNo: number, isReset: boolean = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNo.toString());
            params.append('size', '20');

            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (selectedRole && selectedRole !== 'all') params.append('role', selectedRole);
            if (selectedStatus !== 'all') params.append('status', selectedStatus === 'active' ? 'true' : 'false');

            const response = await api.get(`${ADMIN_ENDPOINTS.USERS}?${params.toString()}`);

            // Check for success code (0)
            if (response.data.code === 0 && response.data.data) {
                // Ensure content is an array
                const content = response.data.data.content;
                const newUsers = Array.isArray(content) ? content : [];

                setUsers(prev => isReset ? newUsers : [...prev, ...newUsers]);
                setHasMore(!response.data.data.last);
                setPage(pageNo);
            } else {
                // If no data or error, set empty array
                if (isReset) {
                    setUsers([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error("Failed to fetch users");
            // Set empty array on error if it's a reset
            if (isReset) {
                setUsers([]);
            }
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, selectedRole, selectedStatus]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchUsers(page + 1);
        }
    };

    const toggleStatus = (user: User) => {
        setConfirmDialog({
            open: true,
            type: user.enabled ? 'disable' : 'enable',
            user
        });
    };

    const verifyUser = (user: User) => {
        setConfirmDialog({
            open: true,
            type: 'verify',
            user
        });
    };

    const unverifyUser = (user: User) => {
        setConfirmDialog({
            open: true,
            type: 'unverify',
            user
        });
    };

    const openRoleDialog = (user: User) => {
        setRoleDialog({ open: true, user });
        setSelectedRoleToAssign('');
    };

    const handleAssignRole = async () => {
        if (!roleDialog.user || !selectedRoleToAssign) return;

        try {
            // Check if role is already assigned
            if (roleDialog.user.assignedRoles?.some(r => r.id === selectedRoleToAssign)) {
                toast.error("User already has this role");
                return;
            }

            const response = await api.post(ADMIN_RBAC_ENDPOINTS.ASSIGN_ROLE(roleDialog.user.id, selectedRoleToAssign));
            if (response.data.code === 0) {
                toast.success("Role assigned successfully");

                // Update local state
                const roleToAdd = availableRoles.find(r => r.id === selectedRoleToAssign);
                if (roleToAdd) {
                    const updatedUser = {
                        ...roleDialog.user,
                        assignedRoles: [...(roleDialog.user.assignedRoles || []), roleToAdd]
                    };
                    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                    setRoleDialog(prev => ({ ...prev, user: updatedUser }));
                }
                setSelectedRoleToAssign('');
            } else {
                toast.error(response.data.message || "Failed to assign role");
            }
        } catch (error) {
            console.error('Given error:', error);
            toast.error("Failed to assign role");
        }
    };

    const handleRemoveRole = async (roleId: string) => {
        if (!roleDialog.user) return;

        try {
            const response = await api.delete(ADMIN_RBAC_ENDPOINTS.REMOVE_ROLE(roleDialog.user.id, roleId));
            if (response.data.code === 0) {
                toast.success("Role removed successfully");

                // Update local state
                const updatedUser = {
                    ...roleDialog.user,
                    assignedRoles: roleDialog.user.assignedRoles?.filter(r => r.id !== roleId) || []
                };
                setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                setRoleDialog(prev => ({ ...prev, user: updatedUser }));
            } else {
                toast.error(response.data.message || "Failed to remove role");
            }
        } catch (error) {
            console.error('Given error:', error);
            toast.error("Failed to remove role");
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmDialog.user) return;

        const user = confirmDialog.user;
        const actionType = confirmDialog.type;

        try {
            switch (actionType) {
                case 'verify': {
                    const response = await userVerificationService.verifyUser(user.id);
                    if (response.code === 0) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, verified: true } : u));
                        toast.success(`${user.name} has been approved successfully!`);
                    } else {
                        toast.error(response.message || 'Failed to approve user');
                    }
                    break;
                }
                case 'unverify': {
                    const response = await userVerificationService.unverifyUser(user.id);
                    if (response.code === 0) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, verified: false } : u));
                        toast.success(`Verification revoked for ${user.name}`);
                    } else {
                        toast.error(response.message || 'Failed to revoke verification');
                    }
                    break;
                }
                case 'enable':
                case 'disable': {
                    const newStatus = actionType === 'enable';
                    const response = await api.patch(ADMIN_ENDPOINTS.USER_STATUS(user.id), { enabled: newStatus });
                    if (response.data.code === 0) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, enabled: newStatus } : u));
                        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
                    } else {
                        toast.error(response.data.message || 'Operation failed');
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Action failed:', error);
            toast.error("Operation failed");
        } finally {
            setConfirmDialog({ open: false, type: null, user: null });
        }
    };

    const getDialogConfig = () => {
        const { type, user } = confirmDialog;
        if (!user) return null;

        switch (type) {
            case 'verify':
                return {
                    title: 'Approve User',
                    description: `Are you sure you want to approve ${user.name}? They will be able to access the platform.`,
                    confirmText: 'Approve',
                    variant: 'success' as const,
                    icon: <UserCheck className="h-6 w-6 text-green-600" />
                };
            case 'unverify':
                return {
                    title: 'Revoke Verification',
                    description: `Are you sure you want to revoke verification for ${user.name}? They will not be able to login until re-approved.`,
                    confirmText: 'Revoke',
                    variant: 'destructive' as const,
                    icon: <UserX className="h-6 w-6 text-orange-600" />
                };
            case 'disable':
                return {
                    title: 'Disable User',
                    description: `Are you sure you want to disable ${user.name}? They will not be able to access the platform.`,
                    confirmText: 'Disable',
                    variant: 'destructive' as const,
                    icon: <Ban className="h-6 w-6 text-red-600" />
                };
            case 'enable':
                return {
                    title: 'Enable User',
                    description: `Are you sure you want to enable ${user.name}? They will be able to access the platform.`,
                    confirmText: 'Enable',
                    variant: 'success' as const,
                    icon: <CheckCircle className="h-6 w-6 text-green-600" />
                };
            default:
                return null;
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
                        <div className="overflow-x-auto">
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
                                            <TableHead className="whitespace-nowrap">User Details</TableHead>
                                            <TableHead className="whitespace-nowrap">Role</TableHead>
                                            <TableHead className="whitespace-nowrap">Status</TableHead>
                                            <TableHead className="whitespace-nowrap">Verified</TableHead>
                                            <TableHead className="whitespace-nowrap">Location</TableHead>
                                            <TableHead className="whitespace-nowrap">Joined</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 && !loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
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
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className="font-normal w-fit">
                                                                {user.role}
                                                            </Badge>
                                                            {user.assignedRoles && user.assignedRoles.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {user.assignedRoles.map(role => (
                                                                        <Badge key={role.id} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                                            {role.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.enabled ? "default" : "destructive"} className="rounded-full px-2 py-0.5 text-[10px]">
                                                            {user.enabled ? "Active" : "Disabled"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.verified ? "default" : "secondary"}
                                                            className={`rounded-full px-2 py-0.5 text-[10px] ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                                        >
                                                            {user.verified ? "✓ Verified" : "⏳ Pending"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">{user.district || '-'}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {/* Manage Roles Button */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openRoleDialog(user)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                title="Manage Roles"
                                                            >
                                                                <Shield className="h-4 w-4" />
                                                            </Button>

                                                            {/* Verify/Unverify Button */}
                                                            {!user.verified ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => verifyUser(user)}
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    title="Approve User"
                                                                >
                                                                    <UserCheck className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => unverifyUser(user)}
                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                    title="Revoke Verification"
                                                                >
                                                                    <UserX className="h-4 w-4" />
                                                                </Button>
                                                            )}

                                                            {/* Enable/Disable Button */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleStatus(user)}
                                                                className={user.enabled ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                                                title={user.enabled ? "Disable User" : "Enable User"}
                                                            >
                                                                {user.enabled ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </InfiniteScroll>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            {confirmDialog.user && getDialogConfig() && (
                <ConfirmDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                    onConfirm={handleConfirmAction}
                    {...getDialogConfig()!}
                />
            )}

            {/* Role Management Dialog */}
            <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Roles for {roleDialog.user?.name}</DialogTitle>
                        <DialogDescription>
                            Assign or remove roles for this user. These roles determine their permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Add Role Section */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Assign New Role</label>
                                <Select value={selectedRoleToAssign} onValueChange={setSelectedRoleToAssign}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles
                                            .filter(role => !roleDialog.user?.assignedRoles?.some(ur => ur.id === role.id))
                                            .map(role => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        {availableRoles.length === 0 && <div className="p-2 text-sm text-muted-foreground">No roles available</div>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAssignRole} disabled={!selectedRoleToAssign}>
                                <Plus className="h-4 w-4 mr-2" /> Assign
                            </Button>
                        </div>

                        {/* Current Roles List */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assigned Roles</label>
                            {roleDialog.user?.assignedRoles && roleDialog.user.assignedRoles.length > 0 ? (
                                <div className="border rounded-md divide-y">
                                    {roleDialog.user.assignedRoles.map(role => (
                                        <div key={role.id} className="flex items-center justify-between p-3">
                                            <div>
                                                <div className="font-medium text-sm">{role.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{role.description}</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive h-8 w-8 p-0"
                                                onClick={() => handleRemoveRole(role.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
                                    No custom roles assigned. User has default {roleDialog.user?.role} role.
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialog(prev => ({ ...prev, open: false }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
