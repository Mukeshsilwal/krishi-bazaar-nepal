import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CloudSun,
    Bug,
    FileText,
    Leaf,
    MapPin,
    Calendar,
    Eye,
    MessageSquare,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import advisoryLogService, { AdvisoryLogResponse } from '@/services/advisoryLogService';
import { useNavigate } from 'react-router-dom';

const AdvisoryHistoryPage = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [advisories, setAdvisories] = useState<AdvisoryLogResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchAdvisories();
        }
    }, [user?.id]);

    const fetchAdvisories = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const data = await advisoryLogService.getFarmerAdvisoryHistory(user.id);
            setAdvisories(data);
        } catch (error) {
            console.error('Failed to fetch advisory history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (advisory: AdvisoryLogResponse) => {
        // Mark as opened if not already opened
        if (!advisory.openedAt) {
            try {
                await advisoryLogService.markAsOpened(advisory.id);
            } catch (error) {
                console.error('Failed to mark as opened:', error);
            }
        }

        navigate(`/advisory/${advisory.id}`);
    };

    const advisoryTypeLabels: Record<string, { en: string; ne: string; icon: React.ElementType; color: string }> = {
        WEATHER: { en: 'Weather', ne: 'मौसम', icon: CloudSun, color: 'bg-blue-100 text-blue-700' },
        DISEASE: { en: 'Disease', ne: 'रोग', icon: Bug, color: 'bg-red-100 text-red-700' },
        PEST: { en: 'Pest', ne: 'कीट', icon: Bug, color: 'bg-orange-100 text-orange-700' },
        POLICY: { en: 'Policy', ne: 'नीति', icon: FileText, color: 'bg-purple-100 text-purple-700' }
    };

    const severityLabels: Record<string, { en: string; ne: string; color: string }> = {
        INFO: { en: 'Info', ne: 'जानकारी', color: 'bg-gray-100 text-gray-700' },
        WATCH: { en: 'Watch', ne: 'निगरानी', color: 'bg-yellow-100 text-yellow-700' },
        WARNING: { en: 'Warning', ne: 'चेतावनी', color: 'bg-orange-100 text-orange-700' },
        EMERGENCY: { en: 'Emergency', ne: 'आपतकालीन', color: 'bg-red-100 text-red-700' }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {language === 'ne' ? 'मेरो सल्लाहहरू' : 'My Advisories'}
                </h1>
                <p className="text-muted-foreground">
                    {language === 'ne'
                        ? 'तपाईंलाई प्राप्त सबै कृषि सल्लाहहरू'
                        : 'All agricultural advisories received by you'}
                </p>
            </div>

            {advisories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">
                            {language === 'ne'
                                ? 'कुनै सल्लाह फेला परेन'
                                : 'No advisories found'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-comfortable">
                    {advisories.map((advisory) => {
                        const typeInfo = advisoryTypeLabels[advisory.advisoryType] || advisoryTypeLabels.WEATHER;
                        const severityInfo = severityLabels[advisory.severity] || severityLabels.INFO;
                        const TypeIcon = typeInfo.icon;
                        const isUnread = !advisory.openedAt;

                        return (
                            <Card
                                key={advisory.id}
                                className={`cursor-pointer hover:shadow-lg transition-shadow ${isUnread ? 'border-l-4 border-l-primary' : ''}`}
                                onClick={() => handleViewDetail(advisory)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                                                <TypeIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {advisory.ruleName || (language === 'ne' ? 'सल्लाह' : 'Advisory')}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={severityInfo.color}>
                                                        {language === 'ne' ? severityInfo.ne : severityInfo.en}
                                                    </Badge>
                                                    <Badge className={typeInfo.color}>
                                                        {language === 'ne' ? typeInfo.ne : typeInfo.en}
                                                    </Badge>
                                                    {isUnread && (
                                                        <Badge variant="default">
                                                            {language === 'ne' ? 'नयाँ' : 'New'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {advisory.severity === 'EMERGENCY' && (
                                            <AlertTriangle className="h-6 w-6 text-red-500" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {advisory.cropType && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Leaf className="h-4 w-4" />
                                                <span>{advisory.cropType}</span>
                                            </div>
                                        )}
                                        {advisory.district && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{advisory.district}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {advisory.feedback && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>{language === 'ne' ? 'प्रतिक्रिया दिइएको' : 'Feedback given'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            {language === 'ne' ? 'विवरण हेर्नुहोस्' : 'View Details'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdvisoryHistoryPage;
