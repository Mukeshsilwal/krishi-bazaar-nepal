import React, { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/context/AuthContext';
import api from '../../services/api';
import { ADMIN_RBAC_ENDPOINTS } from '@/config/endpoints';
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
import { Trash2, Plus, Shield, Check } from "lucide-react";
import { toast } from 'sonner';
import { resolveUserMessage } from '@/utils/errorUtils';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystemDefined: boolean;
}

interface Permission {
    id: string;
    name: string;
    module: string;
    description: string;
}

const RoleManagement = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [open, setOpen] = useState(false);

    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
        permissionNames: [] as string[]
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get(ADMIN_RBAC_ENDPOINTS.ROLES);
            if (response.data.code === 0) {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch roles', error);
            toast.error("Failed to fetch roles");
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get(ADMIN_RBAC_ENDPOINTS.PERMISSIONS);
            if (response.data.code === 0) {
                setPermissions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch permissions', error);
            // toast.error("Failed to fetch permissions"); // Suppress if backend not ready
        }
    };

    const handleCreateRole = async () => {
        if (!newRole.name || newRole.permissionNames.length === 0) {
            toast.error("Name and at least one permission are required");
            return;
        }

        try {
            await api.post(ADMIN_RBAC_ENDPOINTS.ROLES, {
                name: newRole.name,
                description: newRole.description,
                permissionNames: newRole.permissionNames
            });
            setOpen(false);
            setNewRole({ name: '', description: '', permissionNames: [] });
            fetchRoles();
            toast.success("Role created successfully");
        } catch (error: any) {
            console.error('Failed to create role', error);
            toast.error(resolveUserMessage(error));
        }
    };

    const togglePermission = (permName: string) => {
        setNewRole(prev => {
            if (prev.permissionNames.includes(permName)) {
                return { ...prev, permissionNames: prev.permissionNames.filter(p => p !== permName) };
            } else {
                return { ...prev, permissionNames: [...prev.permissionNames, permName] };
            }
        });
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

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
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Define a new role and assign permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. MODERATOR"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        className="uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="Role description..."
                                        value={newRole.description}
                                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="rounded-md border p-4 bg-muted/20">
                                    <ScrollArea className="h-[300px] pr-4">
                                        {Object.entries(groupedPermissions).map(([module, perms]) => (
                                            <div key={module} className="mb-4">
                                                <h4 className="flex items-center text-sm font-semibold text-primary mb-2 bg-primary/10 px-2 py-1 rounded inline-block">
                                                    {module}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {perms.map(perm => (
                                                        <div key={perm.id} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                                            <Checkbox
                                                                id={perm.id}
                                                                checked={newRole.permissionNames.includes(perm.name)}
                                                                onCheckedChange={() => togglePermission(perm.name)}
                                                            />
                                                            <div className="grid gap-1.5 leading-none">
                                                                <Label
                                                                    htmlFor={perm.id}
                                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                                >
                                                                    {perm.name}
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {permissions.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No permissions found. Ensure backend is running.
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRole} disabled={newRole.permissionNames.length === 0}>Create Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Description</TableHead>
                                    <TableHead className="whitespace-nowrap">Permissions</TableHead>
                                    <TableHead className="whitespace-nowrap">Type</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
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
                                        <TableCell className="max-w-[400px]">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 5).map((p) => (
                                                    <Badge key={p} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                        {p}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 5 && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                        +{role.permissions.length - 5}
                                                    </Badge>
                                                )}
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleManagement;
