
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, FileText, CheckCircle, Loader2 } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get(ADMIN_ENDPOINTS.ANALYTICS_DASHBOARD);
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value || 0}</div>
                <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                <p className="text-muted-foreground">Overview of platform performance</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers}
                    icon={Users}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders}
                    icon={ShoppingCart}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Total Articles"
                    value={stats?.totalArticles}
                    icon={FileText}
                    colorClass="bg-orange-100 text-orange-600"
                />
                <StatCard
                    title="Published Content"
                    value={stats?.publishedArticles}
                    icon={CheckCircle}
                    colorClass="bg-green-100 text-green-600"
                />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
