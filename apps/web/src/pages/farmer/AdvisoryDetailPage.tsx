import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import advisoryLogService, { AdvisoryLogDetail } from '@/services/advisoryLogService';
import { toast } from 'sonner';

const AdvisoryDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [advisory, setAdvisory] = useState<AdvisoryLogDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    useEffect(() => {
        if (id) {
            fetchAdvisoryDetail();
            markAsOpened();
        }
    }, [id]);

    const fetchAdvisoryDetail = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await advisoryLogService.getAdvisoryLogDetail(id);
            setAdvisory(data);

            // Pre-fill feedback if already given
            if (data.feedback) {
                setFeedback(data.feedback);
                setComment(data.feedbackComment || '');
            }
        } catch (error) {
            console.error('Failed to fetch advisory detail:', error);
            toast.error(language === 'ne' ? 'सल्लाह लोड गर्न असफल' : 'Failed to load advisory');
        } finally {
            setLoading(false);
        }
    };

    const markAsOpened = async () => {
        if (!id) return;

        try {
            await advisoryLogService.markAsOpened(id);
        } catch (error) {
            console.error('Failed to mark as opened:', error);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!id || !feedback) return;

        setSubmittingFeedback(true);
        try {
            await advisoryLogService.submitFeedback(id, feedback, comment);
            toast.success(language === 'ne' ? 'प्रतिक्रिया सफलतापूर्वक पेश गरियो' : 'Feedback submitted successfully');

            // Refresh advisory to show updated feedback
            await fetchAdvisoryDetail();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error(language === 'ne' ? 'प्रतिक्रिया पेश गर्न असफल' : 'Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const severityColors: Record<string, string> = {
        INFO: 'bg-gray-100 text-gray-700',
        WATCH: 'bg-yellow-100 text-yellow-700',
        WARNING: 'bg-orange-100 text-orange-700',
        EMERGENCY: 'bg-red-100 text-red-700'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!advisory) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-lg text-muted-foreground">
                            {language === 'ne' ? 'सल्लाह फेला परेन' : 'Advisory not found'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ne' ? 'पछाडि जानुहोस्' : 'Back'}
            </Button>

            {/* Header */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                {advisory.ruleName || (language === 'ne' ? 'कृषि सल्लाह' : 'Agricultural Advisory')}
                            </h1>
                            <div className="flex items-center gap-2">
                                <Badge className={severityColors[advisory.severity] || severityColors.INFO}>
                                    {advisory.severity}
                                </Badge>
                                <Badge variant="outline">
                                    {advisory.advisoryType}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(advisory.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advisory Content */}
            {advisory.advisoryContent && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>
                            {language === 'ne' ? 'सल्लाह सामग्री' : 'Advisory Content'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap font-sans">{advisory.advisoryContent}</pre>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Context Information */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        {language === 'ne' ? 'सन्दर्भ जानकारी' : 'Context Information'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {advisory.cropType && (
                            <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'ne' ? 'बाली' : 'Crop'}
                                    </p>
                                    <p className="font-medium">{advisory.cropType}</p>
                                </div>
                            </div>
                        )}
                        {advisory.district && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'ne' ? 'जिल्ला' : 'District'}
                                    </p>
                                    <p className="font-medium">{advisory.district}</p>
                                </div>
                            </div>
                        )}
                        {advisory.growthStage && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ne' ? 'वृद्धि चरण' : 'Growth Stage'}
                                </p>
                                <p className="font-medium">{advisory.growthStage}</p>
                            </div>
                        )}
                        {advisory.season && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ne' ? 'मौसम' : 'Season'}
                                </p>
                                <p className="font-medium">{advisory.season}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Weather Data */}
            {(advisory.temperature || advisory.rainfall || advisory.humidity) && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CloudSun className="h-5 w-5" />
                            {language === 'ne' ? 'मौसम डाटा' : 'Weather Data'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {advisory.temperature && (
                                <div className="text-center">
                                    <Thermometer className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{advisory.temperature}°C</p>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'ne' ? 'तापमान' : 'Temperature'}
                                    </p>
                                </div>
                            )}
                            {advisory.rainfall && (
                                <div className="text-center">
                                    <Droplets className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{advisory.rainfall}mm</p>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'ne' ? 'वर्षा' : 'Rainfall'}
                                    </p>
                                </div>
                            )}
                            {advisory.humidity && (
                                <div className="text-center">
                                    <Wind className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold">{advisory.humidity}%</p>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'ne' ? 'आर्द्रता' : 'Humidity'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Feedback Section */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {language === 'ne' ? 'तपाईंको प्रतिक्रिया' : 'Your Feedback'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {advisory.feedback ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <p className="font-medium text-green-900">
                                    {language === 'ne' ? 'प्रतिक्रिया पेश गरिएको' : 'Feedback Submitted'}
                                </p>
                            </div>
                            <p className="text-sm text-green-700">
                                {language === 'ne' ? 'मूल्याङ्कन: ' : 'Rating: '}{advisory.feedback}
                            </p>
                            {advisory.feedbackComment && (
                                <p className="text-sm text-green-700 mt-2">
                                    {language === 'ne' ? 'टिप्पणी: ' : 'Comment: '}{advisory.feedbackComment}
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label className="mb-3 block">
                                    {language === 'ne' ? 'यो सल्लाह उपयोगी थियो?' : 'Was this advisory useful?'}
                                </Label>
                                <RadioGroup value={feedback} onValueChange={setFeedback}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="USEFUL" id="useful" />
                                        <Label htmlFor="useful" className="flex items-center gap-2 cursor-pointer">
                                            <ThumbsUp className="h-4 w-4" />
                                            {language === 'ne' ? 'उपयोगी' : 'Useful'}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="NOT_USEFUL" id="not-useful" />
                                        <Label htmlFor="not-useful" className="flex items-center gap-2 cursor-pointer">
                                            <ThumbsDown className="h-4 w-4" />
                                            {language === 'ne' ? 'उपयोगी छैन' : 'Not Useful'}
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label htmlFor="comment" className="mb-2 block">
                                    {language === 'ne' ? 'टिप्पणी (वैकल्पिक)' : 'Comment (Optional)'}
                                </Label>
                                <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={language === 'ne'
                                        ? 'तपाईंको अनुभव साझा गर्नुहोस्...'
                                        : 'Share your experience...'}
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleSubmitFeedback}
                                disabled={!feedback || submittingFeedback}
                                className="w-full"
                            >
                                {submittingFeedback ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {language === 'ne' ? 'पेश गर्दै...' : 'Submitting...'}
                                    </>
                                ) : (
                                    language === 'ne' ? 'प्रतिक्रिया पेश गर्नुहोस्' : 'Submit Feedback'
                                )}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdvisoryDetailPage;
