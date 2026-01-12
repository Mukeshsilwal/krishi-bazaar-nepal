import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    CheckCircle2,
    MessageSquare,
    Loader2,
    Activity,
    AlertTriangle,
    Award,
    MapPin,
    Target
} from 'lucide-react';
import advisoryLogService, { AdvisoryAnalytics } from '@/services/advisoryLogService';

const EnhancedAdvisoryAnalyticsDashboard = () => {
    const { language } = useLanguage();
    const { setTitle } = useAdminTitle();

    const [analytics, setAnalytics] = useState<AdvisoryAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<string>('30');

    // Additional analytics
    const [topRules, setTopRules] = useState<string[]>([]);
    const [underperformingRules, setUnderperformingRules] = useState<string[]>([]);
    const [highRiskDistricts, setHighRiskDistricts] = useState<string[]>([]);
    const [alertFatigue, setAlertFatigue] = useState<Record<string, number>>({});
    const [engagementScore, setEngagementScore] = useState<number>(0);

    useEffect(() => {
        setTitle('Advisory Analytics', 'सल्लाह विश्लेषण');
    }, [setTitle]);

    useEffect(() => {
        fetchAllAnalytics();
    }, [timeRange]);

    const fetchAllAnalytics = async () => {
        setLoading(true);
        try {
            const days = parseInt(timeRange);
            const since = new Date();
            since.setDate(since.getDate() - days);
            const sinceStr = since.toISOString();

            // Fetch all analytics in parallel
            const [
                analyticsData,
                topRulesData,
                underperformingData,
                highRiskData,
                fatigueData,
                engagementData
            ] = await Promise.all([
                advisoryLogService.getAnalytics(sinceStr),
                advisoryLogService.getTopPerformingRules(sinceStr, 10),
                advisoryLogService.getUnderperformingRules(sinceStr, 10),
                advisoryLogService.getHighRiskDistricts(sinceStr),
                advisoryLogService.getAlertFatigue(sinceStr, 10),
                advisoryLogService.getFarmerEngagementScore(sinceStr)
            ]);

            setAnalytics(analyticsData);
            setTopRules(topRulesData);
            setUnderperformingRules(underperformingData);
            setHighRiskDistricts(highRiskData);
            setAlertFatigue(fatigueData);
            setEngagementScore(engagementData);
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
    const districtInsightsArray = Object.entries(analytics.districtInsights || {});
    const alertFatigueCount = Object.keys(alertFatigue).length;

    return (
        <>
            {/* Time Range Selector */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    {language === 'ne' ? 'विश्लेषण ड्यासबोर्ड' : 'Analytics Dashboard'}
                </h2>
                <div className="flex gap-2">
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
                    <Button variant="outline" onClick={fetchAllAnalytics}>
                        {language === 'ne' ? 'रिफ्रेश' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
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
                                    {language === 'ne' ? 'डेलिभरी सफलता' : 'Delivery Success'}
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

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {language === 'ne' ? 'संलग्नता स्कोर' : 'Engagement Score'}
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {engagementScore?.toFixed(1) || 0}%
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    {engagementScore > 70 ? (
                                        <Badge variant="default" className="text-xs">Excellent</Badge>
                                    ) : engagementScore > 50 ? (
                                        <Badge variant="secondary" className="text-xs">Good</Badge>
                                    ) : (
                                        <Badge variant="destructive" className="text-xs">Poor</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="bg-indigo-500 p-3 rounded-xl">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different analytics views */}
            <Tabs defaultValue="performance" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="performance">
                        {language === 'ne' ? 'प्रदर्शन' : 'Performance'}
                    </TabsTrigger>
                    <TabsTrigger value="rules">
                        {language === 'ne' ? 'नियमहरू' : 'Rules'}
                    </TabsTrigger>
                    <TabsTrigger value="districts">
                        {language === 'ne' ? 'जिल्लाहरू' : 'Districts'}
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                        {language === 'ne' ? 'अलर्टहरू' : 'Alerts'}
                    </TabsTrigger>
                </TabsList>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    {/* Channel Performance */}
                    <Card>
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
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Rules Tab */}
                <TabsContent value="rules" className="space-y-6">
                    {/* Top Performing Rules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-green-500" />
                                {language === 'ne' ? 'शीर्ष प्रदर्शन नियमहरू' : 'Top Performing Rules'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topRules.length > 0 ? (
                                <div className="space-y-2">
                                    {topRules.map((rule, index) => (
                                        <div key={rule} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <Badge className="bg-green-500">{index + 1}</Badge>
                                            <span className="font-medium">{rule}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    {language === 'ne' ? 'डाटा उपलब्ध छैन' : 'No data available'}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Underperforming Rules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                {language === 'ne' ? 'सुधार आवश्यक नियमहरू' : 'Rules Needing Improvement'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {underperformingRules.length > 0 ? (
                                <div className="space-y-2">
                                    {underperformingRules.map((rule) => (
                                        <div key={rule} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="font-medium">{rule}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    {language === 'ne' ? 'सबै नियमहरू राम्रो प्रदर्शन गर्दैछन्' : 'All rules performing well'}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rule Effectiveness Table */}
                    <Card>
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
                                            <TableHead className="text-right">{language === 'ne' ? 'ट्रिगर' : 'Triggers'}</TableHead>
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
                                                    <Badge variant={rule.openRate > 50 ? 'default' : 'secondary'}>
                                                        {rule.openRate?.toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-green-600">{rule.usefulFeedback}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-red-600">{rule.notUsefulFeedback}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Districts Tab */}
                <TabsContent value="districts" className="space-y-6">
                    {/* High Risk Districts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" />
                                {language === 'ne' ? 'उच्च जोखिम जिल्लाहरू' : 'High Risk Districts'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {highRiskDistricts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {highRiskDistricts.map((district) => (
                                        <div key={district} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="font-medium text-red-700">{district}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    {language === 'ne' ? 'कुनै उच्च जोखिम जिल्ला फेला परेन' : 'No high-risk districts found'}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* District Insights Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {language === 'ne' ? 'जिल्ला अन्तर्दृष्टि' : 'District Insights'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>{language === 'ne' ? 'जिल्ला' : 'District'}</TableHead>
                                            <TableHead className="text-right">{language === 'ne' ? 'सल्लाहहरू' : 'Advisories'}</TableHead>
                                            <TableHead className="text-right">{language === 'ne' ? 'आपतकालीन' : 'Emergency'}</TableHead>
                                            <TableHead className="text-right">{language === 'ne' ? 'असफलता दर' : 'Failure Rate'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {districtInsightsArray.map(([district, metrics]) => (
                                            <TableRow key={district}>
                                                <TableCell className="font-medium">{district}</TableCell>
                                                <TableCell className="text-right">{metrics.advisoryCount?.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    {metrics.emergencyCount > 0 ? (
                                                        <Badge variant="destructive">{metrics.emergencyCount}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={metrics.deliveryFailureRate > 10 ? 'destructive' : 'secondary'}>
                                                        {metrics.deliveryFailureRate?.toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-6">
                    {/* Alert Fatigue */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                {language === 'ne' ? 'अलर्ट थकान' : 'Alert Fatigue'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ne'
                                        ? `${alertFatigueCount} किसानहरूले १० भन्दा बढी सल्लाहहरू प्राप्त गरेका छन्`
                                        : `${alertFatigueCount} farmers received more than 10 advisories`}
                                </p>
                            </div>
                            {alertFatigueCount > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {Object.entries(alertFatigue).slice(0, 20).map(([farmerId, count]) => (
                                        <div key={farmerId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <span className="text-sm font-mono">{farmerId.substring(0, 8)}...</span>
                                            <Badge variant="outline">{count} advisories</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    {language === 'ne' ? 'कुनै अलर्ट थकान फेला परेन' : 'No alert fatigue detected'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
};

export default EnhancedAdvisoryAnalyticsDashboard;
