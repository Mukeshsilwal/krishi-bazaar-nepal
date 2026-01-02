import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    CloudSun,
    Bug,
    FileText,
    MapPin,
    Leaf,
    Calendar,
    Thermometer,
    Droplets,
    Wind,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
    Loader2
} from 'lucide-react';
import advisoryLogService, { AdvisoryLogDetail } from '@/services/advisoryLogService';

interface AdvisoryLogDetailDrawerProps {
    logId: string;
    open: boolean;
    onClose: () => void;
}

const AdvisoryLogDetailDrawer: React.FC<AdvisoryLogDetailDrawerProps> = ({ logId, open, onClose }) => {
    const { language } = useLanguage();
    const [log, setLog] = useState<AdvisoryLogDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && logId) {
            fetchLogDetail();
        }
    }, [open, logId]);

    const fetchLogDetail = async () => {
        setLoading(true);
        try {
            const detail = await advisoryLogService.getAdvisoryLogDetail(logId);
            setLog(detail);
        } catch (error) {
            console.error('Failed to fetch log detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const severityColors: Record<string, string> = {
        INFO: 'bg-gray-100 text-gray-700',
        WATCH: 'bg-yellow-100 text-yellow-700',
        WARNING: 'bg-orange-100 text-orange-700',
        EMERGENCY: 'bg-red-100 text-red-700'
    };

    const statusIcons: Record<string, React.ElementType> = {
        CREATED: Clock,
        DISPATCHED: Clock,
        DELIVERED: CheckCircle2,
        OPENED: CheckCircle2,
        FEEDBACK_RECEIVED: MessageSquare,
        DELIVERY_FAILED: XCircle,
        DEDUPED: XCircle
    };

    if (!log && !loading) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : log ? (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {language === 'ne' ? 'सल्लाह विवरण' : 'Advisory Detail'}
                            </SheetTitle>
                            <SheetDescription>
                                {language === 'ne' ? 'पूर्ण सल्लाह जानकारी र सन्दर्भ' : 'Complete advisory information and context'}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {language === 'ne' ? 'आधारभूत जानकारी' : 'Basic Information'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'गम्भीरता' : 'Severity'}
                                        </span>
                                        <Badge className={severityColors[log.severity] || severityColors.INFO}>
                                            {log.severity}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'प्रकार' : 'Type'}
                                        </span>
                                        <span className="font-medium">{log.advisoryType}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'नियम' : 'Rule'}
                                        </span>
                                        <span className="font-medium">{log.ruleName || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'प्राथमिकता' : 'Priority'}
                                        </span>
                                        <span className="font-medium">{log.priority || '-'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Advisory Content */}
                            {log.advisoryContent && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            {language === 'ne' ? 'सल्लाह सामग्री' : 'Advisory Content'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted p-4 rounded-lg">
                                            <pre className="text-sm whitespace-pre-wrap font-sans">{log.advisoryContent}</pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Farmer Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {language === 'ne' ? 'किसान जानकारी' : 'Farmer Information'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'नाम' : 'Name'}
                                        </span>
                                        <span className="font-medium">{log.farmerName || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'फोन' : 'Phone'}
                                        </span>
                                        <span className="font-medium">{log.farmerPhone || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'जिल्ला' : 'District'}
                                        </span>
                                        <span className="font-medium flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {log.district || '-'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Context */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {language === 'ne' ? 'सन्दर्भ' : 'Context'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'बाली' : 'Crop'}
                                        </span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Leaf className="h-3 w-3" />
                                            {log.cropType || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'वृद्धि चरण' : 'Growth Stage'}
                                        </span>
                                        <span className="font-medium">{log.growthStage || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'मौसम' : 'Season'}
                                        </span>
                                        <span className="font-medium">{log.season || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'जोखिम स्तर' : 'Risk Level'}
                                        </span>
                                        <span className="font-medium">{log.riskLevel || '-'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Weather Data */}
                            {(log.temperature || log.rainfall || log.humidity) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CloudSun className="h-4 w-4" />
                                            {language === 'ne' ? 'मौसम डाटा' : 'Weather Data'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {log.temperature && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Thermometer className="h-3 w-3" />
                                                    {language === 'ne' ? 'तापमान' : 'Temperature'}
                                                </span>
                                                <span className="font-medium">{log.temperature}°C</span>
                                            </div>
                                        )}
                                        {log.rainfall && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Droplets className="h-3 w-3" />
                                                    {language === 'ne' ? 'वर्षा' : 'Rainfall'}
                                                </span>
                                                <span className="font-medium">{log.rainfall}mm</span>
                                            </div>
                                        )}
                                        {log.humidity && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Wind className="h-3 w-3" />
                                                    {language === 'ne' ? 'आर्द्रता' : 'Humidity'}
                                                </span>
                                                <span className="font-medium">{log.humidity}%</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {language === 'ne' ? 'समयरेखा' : 'Timeline'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <TimelineItem
                                            icon={Clock}
                                            label={language === 'ne' ? 'सिर्जना गरिएको' : 'Created'}
                                            time={log.createdAt}
                                        />
                                        {log.deliveredAt && (
                                            <TimelineItem
                                                icon={CheckCircle2}
                                                label={language === 'ne' ? 'डेलिभर गरिएको' : 'Delivered'}
                                                time={log.deliveredAt}
                                            />
                                        )}
                                        {log.openedAt && (
                                            <TimelineItem
                                                icon={CheckCircle2}
                                                label={language === 'ne' ? 'खोलिएको' : 'Opened'}
                                                time={log.openedAt}
                                            />
                                        )}
                                        {log.feedbackAt && (
                                            <TimelineItem
                                                icon={MessageSquare}
                                                label={language === 'ne' ? 'प्रतिक्रिया' : 'Feedback'}
                                                time={log.feedbackAt}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Feedback */}
                            {log.feedback && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            {language === 'ne' ? 'प्रतिक्रिया' : 'Feedback'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {language === 'ne' ? 'मूल्याङ्कन' : 'Rating'}
                                            </span>
                                            <Badge variant={log.feedback === 'USEFUL' ? 'default' : 'destructive'}>
                                                {log.feedback}
                                            </Badge>
                                        </div>
                                        {log.feedbackComment && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    {language === 'ne' ? 'टिप्पणी' : 'Comment'}
                                                </span>
                                                <p className="mt-1 text-sm">{log.feedbackComment}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Failure Reason */}
                            {log.failureReason && (
                                <Card className="border-red-200">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2 text-red-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            {language === 'ne' ? 'असफलता कारण' : 'Failure Reason'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-red-600">{log.failureReason}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
};

interface TimelineItemProps {
    icon: React.ElementType;
    label: string;
    time: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ icon: Icon, label, time }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(time).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default AdvisoryLogDetailDrawer;
