import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Loader2,
    Activity
} from 'lucide-react';
import advisoryLogService, { AdvisoryAnalytics } from '@/services/advisoryLogService';

const AdvisoryAnalyticsDashboard = () => {
    const { language } = useLanguage();
    const { setTitle } = useAdminTitle();

    const [analytics, setAnalytics] = useState<AdvisoryAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<string>('30');

    useEffect(() => {
        setTitle('Advisory Analytics', 'सल्लाह विश्लेषण');
    }, [setTitle]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const days = parseInt(timeRange);
            const since = new Date();
            since.setDate(since.getDate() - days);

            const data = await advisoryLogService.getAnalytics(since.toISOString());
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const ruleEffectivenessArray = Object.values(analytics.ruleEffectiveness || {});
    const channelPerformanceArray = Object.entries(analytics.channelPerformance || {});
    const feedbackDistArray = Object.entries(analytics.feedbackDistribution || {});

    return (
        <>
            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    {language === 'ne' ? 'विश्लेषण ड्यासबोर्ड' : 'Analytics Dashboard'}
                </h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">
                            {language === 'ne' ? 'पछिल्लो ७ दिन' : 'Last 7 days'}
                        </SelectItem>
                        <SelectItem value="30">
                            {language === 'ne' ? 'पछिल्लो ३० दिन' : 'Last 30 days'}
                        </SelectItem>
                        <SelectItem value="90">
                            {language === 'ne' ? 'पछिल्लो ९० दिन' : 'Last 90 days'}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'ne' ? 'कुल सल्लाहहरू' : 'Total Advisories'}
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {analytics.totalAdvisories?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-xl">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'ne' ? 'डेलिभरी सफलता दर' : 'Delivery Success Rate'}
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {analytics.deliverySuccessRate?.toFixed(1) || 0}%
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    {analytics.deliverySuccessRate && analytics.deliverySuccessRate > 90 ? (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {language === 'ne' ? 'पछिल्लो अवधि' : 'Last period'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-green-500 p-3 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'ne' ? 'खोल्ने दर' : 'Open Rate'}
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {analytics.openRate?.toFixed(1) || 0}%
                                </p>
                            </div>
                            <div className="bg-purple-500 p-3 rounded-xl">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'ne' ? 'प्रतिक्रिया दर' : 'Feedback Rate'}
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {analytics.feedbackRate?.toFixed(1) || 0}%
                                </p>
                            </div>
                            <div className="bg-orange-500 p-3 rounded-xl">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Channel Performance */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        {language === 'ne' ? 'च्यानल प्रदर्शन' : 'Channel Performance'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>{language === 'ne' ? 'च्यानल' : 'Channel'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'पठाइएको' : 'Sent'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'डेलिभर' : 'Delivered'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'खोलिएको' : 'Opened'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'सफलता दर' : 'Success Rate'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {channelPerformanceArray.map(([channel, metrics]) => (
                                    <TableRow key={channel}>
                                        <TableCell className="font-medium">{channel}</TableCell>
                                        <TableCell className="text-right">{metrics.totalSent?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{metrics.delivered?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{metrics.opened?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={metrics.successRate > 90 ? 'default' : 'secondary'}>
                                                {metrics.successRate?.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {channelPerformanceArray.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            {language === 'ne' ? 'डाटा उपलब्ध छैन' : 'No data available'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Rule Effectiveness */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {language === 'ne' ? 'नियम प्रभावकारिता' : 'Rule Effectiveness'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>{language === 'ne' ? 'नियम नाम' : 'Rule Name'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'ट्रिगर गणना' : 'Trigger Count'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'खोल्ने दर' : 'Open Rate'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'उपयोगी' : 'Useful'}</TableHead>
                                    <TableHead className="text-right">{language === 'ne' ? 'उपयोगी छैन' : 'Not Useful'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ruleEffectivenessArray.slice(0, 10).map((rule) => (
                                    <TableRow key={rule.ruleName}>
                                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                        <TableCell className="text-right">{rule.triggerCount?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            {rule.openRate?.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-green-600">{rule.usefulFeedback}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-red-600">{rule.notUsefulFeedback}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {ruleEffectivenessArray.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            {language === 'ne' ? 'डाटा उपलब्ध छैन' : 'No data available'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {language === 'ne' ? 'प्रतिक्रिया वितरण' : 'Feedback Distribution'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {feedbackDistArray.map(([feedback, count]) => {
                            const total = feedbackDistArray.reduce((sum, [, c]) => sum + c, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;

                            return (
                                <div key={feedback}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{feedback}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${feedback === 'USEFUL' ? 'bg-green-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {feedbackDistArray.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                {language === 'ne' ? 'प्रतिक्रिया डाटा उपलब्ध छैन' : 'No feedback data available'}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default AdvisoryAnalyticsDashboard;
