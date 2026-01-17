import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { WEATHER_ADVISORY_ENDPOINTS } from '@/config/endpoints';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, CloudRain } from "lucide-react";
import { toast } from 'sonner';
import { resolveUserMessage } from '@/utils/errorUtils';

interface WeatherAdvisory {
    id: string;
    title: string;
    description: string;
    region: string;
    alertLevel: 'NORMAL' | 'Watch' | 'WARNING' | 'SEVERE';
    active: boolean;
    validUntil?: string;
}

const WeatherAdvisoryManager = () => {
    const [advisories, setAdvisories] = useState<WeatherAdvisory[]>([]);
    const [open, setOpen] = useState(false);
    const [newAdvisory, setNewAdvisory] = useState({
        title: '',
        description: '',
        region: '',
        alertLevel: 'NORMAL',
    });

    useEffect(() => {
        fetchAdvisories();
    }, []);

    const fetchAdvisories = async () => {
        try {
            const res = await api.get(WEATHER_ADVISORY_ENDPOINTS.BASE);
            if (res.data.code === 0 && res.data.data) {
                // Ensure data is an array
                const data = Array.isArray(res.data.data) ? res.data.data : [];
                setAdvisories(data);
            } else {
                setAdvisories([]);
            }
        } catch (error) {
            console.error('Failed to fetch advisories', error);
            toast.error("Failed to load weather advisories");
            setAdvisories([]); // Set empty array on error
        }
    };

    const handleCreate = async () => {
        try {
            await api.post(WEATHER_ADVISORY_ENDPOINTS.BASE, newAdvisory);
            setOpen(false);
            setNewAdvisory({ title: '', description: '', region: '', alertLevel: 'NORMAL' });
            fetchAdvisories();
            toast.success("Advisory published successfully");
        } catch (error: any) {
            console.error('Failed to create advisory', error);
            toast.error(resolveUserMessage(error));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this advisory?")) return;
        try {
            await api.delete(WEATHER_ADVISORY_ENDPOINTS.BY_ID(id));
            fetchAdvisories();
            toast.success("Advisory deleted");
        } catch (error) {
            console.error('Failed to delete advisory', error);
            toast.error("Failed to delete advisory");
        }
    };

    const getAlertBadgeColor = (level: string) => {
        switch (level) {
            case 'SEVERE': return 'bg-red-600';
            case 'WARNING': return 'bg-orange-500';
            case 'Watch': return 'bg-yellow-500';
            default: return 'bg-green-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Weather Advisories</h1>
                    <p className="text-muted-foreground">Manage weather alerts and forecasts for farmers</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Advisory
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Weather Advisory</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Heavy Rain Alert"
                                    value={newAdvisory.title}
                                    onChange={(e) => setNewAdvisory({ ...newAdvisory, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="region">Region / District</Label>
                                <Input
                                    id="region"
                                    placeholder="e.g., Chitwan"
                                    value={newAdvisory.region}
                                    onChange={(e) => setNewAdvisory({ ...newAdvisory, region: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="level">Alert Level</Label>
                                <Select
                                    value={newAdvisory.alertLevel}
                                    onValueChange={(val) => setNewAdvisory({ ...newAdvisory, alertLevel: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal (Green)</SelectItem>
                                        <SelectItem value="Watch">Watch (Yellow)</SelectItem>
                                        <SelectItem value="WARNING">Warning (Orange)</SelectItem>
                                        <SelectItem value="SEVERE">Severe (Red)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Detailed forecast and advice..."
                                    value={newAdvisory.description}
                                    onChange={(e) => setNewAdvisory({ ...newAdvisory, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Publish</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Advisories</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Valid Until</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {advisories.map((advisory) => (
                                <TableRow key={advisory.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <CloudRain className="h-4 w-4 text-muted-foreground" />
                                            {advisory.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{advisory.region}</TableCell>
                                    <TableCell>
                                        <Badge className={`${getAlertBadgeColor(advisory.alertLevel)} hover:${getAlertBadgeColor(advisory.alertLevel)}`}>
                                            {advisory.alertLevel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{advisory.validUntil ? new Date(advisory.validUntil).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(advisory.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {advisories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No active advisories found.
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

export default WeatherAdvisoryManager;
