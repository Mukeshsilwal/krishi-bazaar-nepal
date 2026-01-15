
import React, { useState, useEffect, useRef } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import api from '@/services/api';
import { ADMIN_NOTIFICATION_ENDPOINTS } from '@/config/endpoints';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Send, BarChart3, History, FileText, Bell, Users, MessageSquare } from "lucide-react";
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
    const { setTitle } = useAdminTitle();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Send Notification State
    const [sendData, setSendData] = useState({
        title: '',
        message: '',
        channel: 'PUSH',
        targetRole: 'ALL', // MOCK
        targetValue: '',
        scheduled: false,
        scheduledTime: ''
    });

    // ... (lines 64-153)
    // Template State
    const [newTemplate, setNewTemplate] = useState({
        name: '', title: '', body: '', type: 'SMS'
    });

    // Stats State
    const [stats, setStats] = useState({
        totalSent: 0,
        deliveryRate: 0,
        activeUsers: 0,
        queued: 0,
        pending: 0,
        scheduled: 0,
        totalTargetableUsers: 0
    });

    const [history, setHistory] = useState([]);

    // Infinite Scroll State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const observerTarget = useRef(null);

    useEffect(() => {
        setTitle('Notification Manager', 'अधिसूचना व्यवस्थापन');
        fetchTemplates();
        fetchStats();
        // Initial history fetch
        fetchHistory(0);
    }, [setTitle]);

    useEffect(() => {
        if (page > 0) {
            fetchHistory(page);
        }
    }, [page]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isHistoryLoading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isHistoryLoading]); // Keeping dependencies simple to avoid loops

    const ITEMS_PER_PAGE = 20;

    const fetchHistory = async (pageNum: number) => {
        // Prevent duplicate fetches for same page or if already loading (except initial load)
        if (isHistoryLoading) return;

        setIsHistoryLoading(true);


        try {
            const res = await api.get(`${ADMIN_NOTIFICATION_ENDPOINTS.BASE}?page=${pageNum}&size=${ITEMS_PER_PAGE}`);
            if (res.data.code === 0) {
                const newContent = res.data.data.content;
                const isLast = res.data.data.last;


                setHistory(prev => {
                    // Safety check to ensure we don't append duplicates if page 0 re-fetches
                    if (pageNum === 0) return newContent;

                    // Filter out any potential duplicates based on ID
                    const existingIds = new Set(prev.map((i: any) => i.id));
                    const uniqueNewContent = newContent.filter((i: any) => !existingIds.has(i.id));

                    return [...prev, ...uniqueNewContent];
                });
                setHasMore(!isLast);
            }
        } catch (err) {
            console.error("[FetchHistory] Error:", err);
            // If error, we might want to decrement page if it was an increment, 
            // but for now let's just stop loading. User can retry by scrolling or button.
        } finally {
            setIsHistoryLoading(false);
        }
    }

    const fetchStats = async () => {
        try {
            const res = await api.get(ADMIN_NOTIFICATION_ENDPOINTS.STATS);
            if (res.data.code === 0) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            // Request large size for now to keep UI simple
            const res = await api.get(`${ADMIN_NOTIFICATION_ENDPOINTS.TEMPLATES}?page=0&size=100&sort=name,asc`);
            if (res.data.code === 0) {
                // PaginatedResponse: content is in data.content
                setTemplates(res.data.data.content);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch templates");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!newTemplate.name || !newTemplate.title || !newTemplate.body) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await api.post(ADMIN_NOTIFICATION_ENDPOINTS.TEMPLATES, {
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

    const handleSendNotification = async () => {
        if (!sendData.title || !sendData.message) {
            toast.error("Title and Message are required");
            return;
        }

        try {
            await api.post(ADMIN_NOTIFICATION_ENDPOINTS.BROADCAST, {
                title: sendData.title,
                message: sendData.message,
                channel: sendData.channel,
                targetRole: sendData.targetRole,
                targetValue: sendData.targetValue,
                priority: 'NORMAL'
            });
            toast.success("Notification queued successfully");
            setSendData({ title: '', message: '', channel: 'PUSH', targetRole: 'ALL', targetValue: '', scheduled: false, scheduledTime: '' });
            fetchStats(); // Refresh stats
        } catch (err) {
            console.error(err);
            toast.error("Failed to send notification");
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="send">Compose</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* DASHBOARD TAB */}
                <TabsContent value="dashboard" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                                <Send className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalSent}</div>
                                <p className="text-xs text-muted-foreground">Successfully sent</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
                                <p className="text-xs text-muted-foreground">Successful deliveries</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalTargetableUsers}</div>
                                <p className="text-xs text-muted-foreground">Reach({stats.activeUsers} reached)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
                                <History className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending + stats.queued}</div>
                                <p className="text-xs text-muted-foreground">{stats.scheduled} Scheduled for later</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-full"
                                    onClick={async () => {
                                        try {
                                            await api.post(ADMIN_NOTIFICATION_ENDPOINTS.RETRY_PENDING);
                                            toast.success("Retrying pending notifications...");
                                            fetchStats();
                                        } catch (e) {
                                            toast.error("Failed to retry");
                                        }
                                    }}
                                >
                                    Retry Pending
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* COMPOSE TAB */}
                <TabsContent value="send" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Notification</CardTitle>
                            <CardDescription>Compose and send notifications to users via various channels.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Channel</Label>
                                    <Select
                                        value={sendData.channel}
                                        onValueChange={(val) => setSendData({ ...sendData, channel: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PUSH">Push Notification</SelectItem>
                                            <SelectItem value="SMS">SMS</SelectItem>
                                            <SelectItem value="EMAIL">Email</SelectItem>
                                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Select
                                        value={sendData.targetRole}
                                        onValueChange={(val) => setSendData({ ...sendData, targetRole: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Users</SelectItem>
                                            <SelectItem value="FARMER">Farmers Only</SelectItem>
                                            <SelectItem value="EXPERT">Experts Only</SelectItem>
                                            <SelectItem value="SINGLE">Specific User (Mobile)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {sendData.targetRole === 'SINGLE' && (
                                <div className="space-y-2">
                                    <Label>User Mobile Number</Label>
                                    <Input
                                        placeholder="Enter 10-digit mobile number"
                                        value={sendData.targetValue}
                                        onChange={(e) => setSendData({ ...sendData, targetValue: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    placeholder="Enter notification title"
                                    value={sendData.title}
                                    onChange={(e) => setSendData({ ...sendData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Message Body</Label>
                                <Textarea
                                    placeholder="Enter your message here..."
                                    rows={5}
                                    value={sendData.message}
                                    onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                                />
                            </div>

                            {/* Basic Scheduling UI - Logic not fully wired in frontend yet */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="schedule"
                                    className="rounded border-gray-300"
                                    checked={sendData.scheduled}
                                    onChange={(e) => setSendData({ ...sendData, scheduled: e.target.checked })}
                                />
                                <Label htmlFor="schedule">Schedule for later</Label>
                            </div>

                            {sendData.scheduled && (
                                <div className="w-1/2">
                                    <Input type="datetime-local" />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSendNotification} className="w-full sm:w-auto">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Notification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TEMPLATES TAB */}
                <TabsContent value="templates" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Saved Templates</h3>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Template
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
                                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
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
                                    <Button onClick={handleCreateTemplate}>Create Template</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No templates found.
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
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sent History</CardTitle>
                            <CardDescription>View log of recently sent notifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>S.N.</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Mobile</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Channel</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No history found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((n: any, index: number) => (
                                            <TableRow key={n.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{n.title || 'No Title'}</TableCell>
                                                <TableCell>{n.user?.mobileNumber || 'N/A'}</TableCell>
                                                <TableCell className="max-w-[300px] truncate" title={n.message}>
                                                    {n.message}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{n.channel}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            n.status === 'SENT' ? 'default' :
                                                                n.status === 'FAILED' ? 'destructive' :
                                                                    n.status === 'PENDING' ? 'secondary' : 'outline'
                                                        }
                                                    >
                                                        {n.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            {/* Infinite Scroll Sentinel */}
                            <div ref={observerTarget} className="h-4 w-full" />

                            {/* Manual Load More Fallback */}
                            {hasMore && !isHistoryLoading && (
                                <div className="flex justify-center p-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(prev => prev + 1)}
                                    >
                                        Load More
                                    </Button>
                                </div>
                            )}

                            {isHistoryLoading && (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
