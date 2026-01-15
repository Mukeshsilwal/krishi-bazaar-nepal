import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, FileText, CheckCircle, Loader2 } from 'lucide-react';
import DonutChart from '@/components/charts/DonutChart';
import advisoryLogService from '@/services/advisoryLogService';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [advisoryData, setAdvisoryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Fetch System Stats
            try {

                const statsRes = await api.get(ADMIN_ENDPOINTS.ANALYTICS_DASHBOARD);
                if (statsRes.data.code === 0) {
                    setStats(statsRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch system stats:", error);
            }

            // 2. Fetch Advisory Analytics (Donut Charts)
            try {

                const advisoryRes = await advisoryLogService.getAnalytics();

                if (advisoryRes) {
                    setAdvisoryData(advisoryRes);
                }
            } catch (error) {
                console.error("Failed to fetch advisory analytics:", error);
            }

        } catch (err) {
            console.error("Unexpected error in dashboard:", err);
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

    // Prepare chart data
    const channelData = advisoryData?.channelPerformance
        ? Object.entries(advisoryData.channelPerformance).map(([key, value]: [string, any]) => ({
            name: key,
            value: value.totalSent || 0
        }))
        : [];

    const feedbackData = advisoryData?.feedbackDistribution
        ? Object.entries(advisoryData.feedbackDistribution).map(([key, value]: [string, any]) => ({
            name: key,
            value: value as number,
            color: key === 'USEFUL' ? '#10b981' : '#ef4444' // Green for Useful, Red for Not Useful
        }))
        : [];

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

            {/* Visual Analytics Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Advisory Insights</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <DonutChart
                        title="Notification Methods"
                        description="Distribution of advisory delivery channels"
                        data={channelData}
                    />
                    <DonutChart
                        title="Farmer Feedback"
                        description="User feedback on delivered advisories"
                        data={feedbackData}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
