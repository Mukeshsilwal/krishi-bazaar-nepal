
import React, { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, PenSquare, Trash2 } from "lucide-react";
import { toast } from 'sonner';

interface Template {
    id: string;
    name: string;
    title: string;
    body: string;
    type: string;
    isActive: boolean;
}

export default function NotificationManager() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '', title: '', body: '', type: 'SMS'
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/notifications/templates');
            if (res.data.success) {
                setTemplates(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch templates");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTemplate.name || !newTemplate.title || !newTemplate.body) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await api.post('/admin/notifications/templates', {
                ...newTemplate,
                isActive: true
            });
            setOpen(false);
            setNewTemplate({ name: '', title: '', body: '', type: 'SMS' });
            fetchTemplates();
            toast.success("Template created successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create template");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            // Assuming delete endpoint exists, if not, this is a placeholder
            await api.delete(`/admin/notifications/templates/${id}`);
            fetchTemplates();
            toast.success("Template deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete template");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
                    <p className="text-muted-foreground">Manage SMS, Email, and Push templates</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Notification Template</DialogTitle>
                            <DialogDescription>
                                Add a new template for system notifications.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., ORDER_UPDATE_SMS"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={newTemplate.type}
                                    onValueChange={(val) => setNewTemplate({ ...newTemplate, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SMS">SMS</SelectItem>
                                        <SelectItem value="EMAIL">Email</SelectItem>
                                        <SelectItem value="PUSH">Push Notification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title / Subject</Label>
                                <Input
                                    id="title"
                                    placeholder="Notification Title"
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="body">Body Content</Label>
                                <Textarea
                                    id="body"
                                    placeholder="Hello {name}, your order is {status}."
                                    rows={4}
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use {"{variable}"} for dynamic content.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    {/* <TableHead className="text-right">Actions</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No templates found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    templates.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.name}</TableCell>
                                            <TableCell>{t.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{t.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={t.isActive ? "default" : "secondary"}>
                                                    {t.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            {/* <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell> */}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
