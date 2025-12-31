
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/context/AuthContext';
import api from '../../services/api';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Shield } from "lucide-react";
import { toast } from 'sonner';

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystemDefined: boolean;
}

const RoleManagement = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [open, setOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '', permissions: '' });
    const { user } = useAuth();

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/admin/rbac/roles');
            if (response.data.success) {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch roles', error);
            toast.error("Failed to fetch roles");
        }
    };

    const handleCreateRole = async () => {
        try {
            const permissionSet = newRole.permissions.split(',').map(p => p.trim());
            await api.post('/admin/rbac/roles', {
                name: newRole.name,
                description: newRole.description,
                permissionNames: permissionSet
            });
            setOpen(false);
            setNewRole({ name: '', description: '', permissions: '' });
            fetchRoles();
            toast.success("Role created successfully");
        } catch (error: any) {
            console.error('Failed to create role', error);
            toast.error(error.response?.data?.message || "Failed to create role");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Define a new role and its associated permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. MODERATOR"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Role description..."
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="permissions">Permissions</Label>
                                <Input
                                    id="permissions"
                                    placeholder="USER_READ, CONTENT_WRITE (comma separated)"
                                    value={newRole.permissions}
                                    onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRole}>Create Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        {role.name}
                                    </TableCell>
                                    <TableCell>{role.description}</TableCell>
                                    <TableCell className="max-w-[300px]">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.map((p) => (
                                                <Badge key={p} variant="secondary" className="text-xs">
                                                    {p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={role.isSystemDefined ? "default" : "outline"}>
                                            {role.isSystemDefined ? "System" : "Custom"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!role.isSystemDefined && (
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleManagement;
