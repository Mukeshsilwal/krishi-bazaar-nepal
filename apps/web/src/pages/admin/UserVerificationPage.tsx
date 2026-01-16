import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    Trash2,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import userVerificationService from '@/services/userVerificationService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const UserVerificationPage = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [processingUserId, setProcessingUserId] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [activeTab, page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const response = await userVerificationService.getPendingUsers(page, 10);
                if (response.code === 0) {
                    setPendingUsers(response.data.content);
                    setTotalPages(response.data.totalPages);
                }
            } else {
                const response = await userVerificationService.getVerifiedUsers(page, 10);
                if (response.code === 0) {
                    setVerifiedUsers(response.data.content);
                    setTotalPages(response.data.totalPages);
                }
            }
        } catch (error) {
            toast.error('Failed to load users');
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (userId) => {
        setProcessingUserId(userId);
        try {
            const response = await userVerificationService.verifyUser(userId);
            if (response.code === 0) {
                toast.success('User verified successfully!');
                loadUsers();
            } else {
                toast.error(response.message || 'Failed to verify user');
            }
        } catch (error) {
            toast.error('Failed to verify user');
            console.error('Error verifying user:', error);
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleUnverifyUser = async (userId) => {
        setProcessingUserId(userId);
        try {
            const response = await userVerificationService.unverifyUser(userId);
            if (response.code === 0) {
                toast.success('User verification revoked');
                loadUsers();
            } else {
                toast.error(response.message || 'Failed to unverify user');
            }
        } catch (error) {
            toast.error('Failed to unverify user');
            console.error('Error unverifying user:', error);
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setProcessingUserId(userId);
        try {
            const response = await userVerificationService.deleteUser(userId);
            if (response.code === 0) {
                toast.success('User deleted successfully');
                loadUsers();
            } else {
                toast.error(response.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Error deleting user:', error);
        } finally {
            setProcessingUserId(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            VENDOR: 'bg-purple-100 text-purple-800',
            EXPERT: 'bg-blue-100 text-blue-800',
            FARMER: 'bg-green-100 text-green-800',
            BUYER: 'bg-orange-100 text-orange-800',
            ADMIN: 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const UserCard = ({ user, isPending }) => (
        <Card className="mb-4 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{user.mobileNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{user.district}, Ward {user.ward}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Registered: {formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                        {isPending ? (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleVerifyUser(user.id)}
                                    disabled={processingUserId === user.id}
                                    className="gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={processingUserId === user.id}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Reject
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnverifyUser(user.id)}
                                disabled={processingUserId === user.id}
                                className="gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Revoke
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">User Verification</h1>
                <p className="text-muted-foreground">
                    Approve or reject VENDOR and EXPERT registrations
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={activeTab === 'pending' ? 'default' : 'outline'}
                    onClick={() => {
                        setActiveTab('pending');
                        setPage(0);
                    }}
                    className="gap-2"
                >
                    <Clock className="w-4 h-4" />
                    Pending ({pendingUsers.length})
                </Button>
                <Button
                    variant={activeTab === 'verified' ? 'default' : 'outline'}
                    onClick={() => {
                        setActiveTab('verified');
                        setPage(0);
                    }}
                    className="gap-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    Verified
                </Button>
                <Button
                    variant="outline"
                    onClick={loadUsers}
                    className="gap-2 ml-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {activeTab === 'pending' ? (
                        pendingUsers.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-xl font-semibold mb-2">No Pending Users</h3>
                                    <p className="text-muted-foreground">
                                        All users have been verified or there are no new registrations.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div>
                                {pendingUsers.map((user) => (
                                    <UserCard key={user.id} user={user} isPending={true} />
                                ))}
                            </div>
                        )
                    ) : (
                        verifiedUsers.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-xl font-semibold mb-2">No Verified Users</h3>
                                    <p className="text-muted-foreground">
                                        No users have been verified yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div>
                                {verifiedUsers.map((user) => (
                                    <UserCard key={user.id} user={user} isPending={false} />
                                ))}
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                                Page {page + 1} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserVerificationPage;
