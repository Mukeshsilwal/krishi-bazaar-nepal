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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, Download, Upload, Search, Users, UserCheck, UserX } from 'lucide-react';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';
import { toast } from 'sonner';
import { resolveUserMessage } from '@/utils/errorUtils';

interface Farmer {
    id: string;
    name: string;
    mobileNumber: string;
    district: string;
    verified: boolean;
    rejectionReason?: string;
    verificationNotes?: string;
}

interface FarmerProfile {
    farmer: Farmer;
    statistics: {
        totalListings: number;
        totalOrders: number;
    };
    recentListings: any[];
    recentOrders: any[];
}

import { useDebounce } from '@/hooks/useDebounce';

const FarmerManager = () => {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerProfile | null>(null);
    const [open, setOpen] = useState(false);

    // Pagination & Search State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL'); // Note: Filtering by status not yet implemented in backend for Farmers specifically, keeping for UI or client-side if needed, but optimally should be backend

    // Verification State
    const [verifyMode, setVerifyMode] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [verifyNotes, setVerifyNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchFarmers();
    }, [debouncedSearchTerm, page]);

    const fetchFarmers = async () => {
        try {
            // Build query params
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', '10');
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

            const res = await api.get(`${ADMIN_ENDPOINTS.FARMERS}?${params.toString()}`);
            if (res.data.code === 0) {
                setFarmers(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
                setTotalElements(res.data.data.totalElements);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch farmers");
        }
    };

    const handleViewProfile = async (id: string) => {
        try {
            const res = await api.get(ADMIN_ENDPOINTS.FARMER_BY_ID(id));
            if (res.data.code === 0) {
                setSelectedFarmer(res.data.data);
                setVerifyMode(null); // Reset mode
                setOpen(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch profile");
        }
    };

    const handleVerificationSubmit = async () => {
        if (!selectedFarmer) return;

        if (verifyMode === 'REJECT' && !rejectionReason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            await api.post(ADMIN_ENDPOINTS.VERIFY_FARMER(selectedFarmer.farmer.id), {
                verified: verifyMode === 'APPROVE',
                rejectionReason: verifyMode === 'REJECT' ? rejectionReason : null,
                notes: verifyNotes
            });

            toast.success(`Farmer ${verifyMode === 'APPROVE' ? 'verified' : 'rejected'} successfully`);
            setOpen(false);
            fetchFarmers(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to update verification status");
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get(ADMIN_ENDPOINTS.FARMERS_EXPORT, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'farmers.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            toast.error("Failed to export farmers");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(ADMIN_ENDPOINTS.FARMERS_IMPORT, formData);
            toast.success("Farmers imported successfully");
            fetchFarmers(); // Refresh list
        } catch (err: any) {
            console.error(err);
            toast.error(resolveUserMessage(err));
        } finally {
            e.target.value = ''; // Reset input
        }
    };

    // Filter Logic
    const filteredFarmers = farmers.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            f.mobileNumber.includes(debouncedSearchTerm) ||
            f.district.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL'
            ? true
            : filterStatus === 'VERIFIED' ? f.verified : !f.verified;

        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalFarmers = farmers.length;
    const verifiedFarmers = farmers.filter(f => f.verified).length;
    const unverifiedFarmers = totalFarmers - verifiedFarmers;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Farmer Management</h2>
                    <p className="text-muted-foreground">Monitor and manage farmer verifyication status</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImport}
                        />
                        <Button>
                            <Upload className="mr-2 h-4 w-4" /> Import CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFarmers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified Farmers</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{verifiedFarmers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                        <UserX className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unverifiedFarmers}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <Tabs defaultValue="ALL" className="w-[400px]" onValueChange={(v) => setFilterStatus(v as any)}>
                            <TabsList>
                                <TabsTrigger value="ALL">All Farmers</TabsTrigger>
                                <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
                                <TabsTrigger value="UNVERIFIED">Pending</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, mobile, district..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>District</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {farmers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="h-8 w-8 opacity-50" />
                                            <p>No farmers found matching criteria.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                farmers.map((f) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-medium">{f.name}</TableCell>
                                        <TableCell>{f.mobileNumber}</TableCell>
                                        <TableCell>{f.district || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={f.verified ? "default" : "outline"}
                                                className={f.verified ? "bg-green-600 hover:bg-green-700" : "text-orange-600 border-orange-600 bg-orange-50"}
                                            >
                                                {f.verified ? "Verified" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewProfile(f.id)}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {/* Pagination Controls */}
                <div className="p-4 border-t flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </Button>
                </div>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Farmer Profile</DialogTitle>
                    </DialogHeader>

                    {selectedFarmer && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Overview Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        {selectedFarmer.farmer.name}
                                        <Badge variant={selectedFarmer.farmer.verified ? "default" : "secondary"}>
                                            {selectedFarmer.farmer.verified ? "Verified" : "Pending"}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground block">Mobile</span>
                                            <span className="font-medium">{selectedFarmer.farmer.mobileNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">District</span>
                                            <span className="font-medium">{selectedFarmer.farmer.district || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                                            <div className="text-xs text-muted-foreground mb-1">Total Listings</div>
                                            <div className="text-2xl font-bold">{selectedFarmer.statistics.totalListings}</div>
                                        </div>
                                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                                            <div className="text-xs text-muted-foreground mb-1">Total Orders</div>
                                            <div className="text-2xl font-bold">{selectedFarmer.statistics.totalOrders}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Verification Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Verification Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!verifyMode ? (
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={() => { setVerifyMode('APPROVE'); setVerifyNotes(''); }}
                                                disabled={selectedFarmer.farmer.verified}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {selectedFarmer.farmer.verified ? "Already Verified" : "Approve Verification"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={() => { setVerifyMode('REJECT'); setRejectionReason(''); }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" /> Reject & Block
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="text-sm font-medium border-b pb-2">
                                                Confirm Action: {verifyMode === 'APPROVE' ? 'Approve' : 'Reject'}
                                            </div>

                                            {verifyMode === 'REJECT' && (
                                                <div className="space-y-2">
                                                    <Label>Rejection Reason (Required)</Label>
                                                    <Textarea
                                                        placeholder="Reason for rejection..."
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="resize-none"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label>Internal Notes</Label>
                                                <Textarea
                                                    placeholder="Add any internal notes..."
                                                    value={verifyNotes}
                                                    onChange={(e) => setVerifyNotes(e.target.value)}
                                                    className="resize-none"
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button className="flex-1" onClick={handleVerificationSubmit}>
                                                    Confirm
                                                </Button>
                                                <Button variant="outline" onClick={() => setVerifyMode(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FarmerManager;
