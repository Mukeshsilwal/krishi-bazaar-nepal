import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { SCHEME_ENDPOINTS } from '@/config/endpoints';
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from 'sonner';
import { resolveUserMessage } from '@/utils/errorUtils';

interface Scheme {
    id: string;
    title: string;
    description: string;
    eligibilityCriteria: string;
    applicationDeadline?: string;
    active: boolean;
}

const SchemeManager = () => {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [open, setOpen] = useState(false);
    const [newScheme, setNewScheme] = useState({
        title: '',
        description: '',
        eligibilityCriteria: '',
        applicationDeadline: '',
        active: true,
    });

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const res = await api.get(SCHEME_ENDPOINTS.BASE);
            if (res.data.code === 0) {
                setSchemes(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch schemes', error);
            toast.error("Failed to load schemes");
        }
    };

    const handleCreate = async () => {
        try {
            await api.post(SCHEME_ENDPOINTS.BASE, newScheme);
            setOpen(false);
            setNewScheme({
                title: '',
                description: '',
                eligibilityCriteria: '',
                applicationDeadline: '',
                active: true,
            });
            fetchSchemes();
            toast.success("Scheme created successfully");
        } catch (error: any) {
            console.error('Failed to create scheme', error);
            toast.error(resolveUserMessage(error));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this scheme?")) return;
        try {
            await api.delete(SCHEME_ENDPOINTS.BY_ID(id));
            fetchSchemes();
            toast.success("Scheme deleted");
        } catch (error) {
            console.error('Failed to delete scheme', error);
            toast.error("Failed to delete scheme");
        }
    };

    const handleToggleActive = async (scheme: Scheme) => {
        try {
            await api.put(SCHEME_ENDPOINTS.BY_ID(scheme.id), { ...scheme, active: !scheme.active });
            fetchSchemes();
            toast.success(`Scheme ${!scheme.active ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Failed to update scheme', error);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Government Schemes</h1>
                    <p className="text-muted-foreground">Manage financial aid and subsidy schemes</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Scheme
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Scheme</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Fertilizer Subsidy Program"
                                    value={newScheme.title}
                                    onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Details about the scheme..."
                                    value={newScheme.description}
                                    onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                                <Textarea
                                    id="eligibility"
                                    placeholder="Who can apply?"
                                    value={newScheme.eligibilityCriteria}
                                    onChange={(e) => setNewScheme({ ...newScheme, eligibilityCriteria: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="deadline">Application Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={newScheme.applicationDeadline}
                                    onChange={(e) => setNewScheme({ ...newScheme, applicationDeadline: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Save Scheme</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Schemes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Eligibility</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schemes.map((scheme) => (
                                <TableRow key={scheme.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {scheme.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate" title={scheme.eligibilityCriteria}>
                                        {scheme.eligibilityCriteria}
                                    </TableCell>
                                    <TableCell>
                                        {scheme.applicationDeadline ? new Date(scheme.applicationDeadline).toLocaleDateString() : 'No Deadline'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={scheme.active ? "default" : "secondary"}
                                            className="cursor-pointer"
                                            onClick={() => handleToggleActive(scheme)}
                                        >
                                            {scheme.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(scheme.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {schemes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No schemes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SchemeManager;
