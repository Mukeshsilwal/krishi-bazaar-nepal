import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  AlertTriangle,
  Percent,
  Pill,
  Bug,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { diagnosisService, AIDiagnosis, ReviewStatus } from '@/services/diagnosisService';
import { toast } from 'sonner';

const AIReviewPage = () => {
  const { language } = useLanguage();
  const [results, setResults] = useState<AIDiagnosis[]>([]);
  const [selectedResult, setSelectedResult] = useState<AIDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Title Management via Context */
  const { setTitle } = useAdminTitle();
  React.useEffect(() => {
    setTitle('AI Diagnosis Review', 'AI निदान समीक्षा');
  }, [setTitle]);

  useEffect(() => {
    fetchQueue();
  }, [page]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await diagnosisService.getReviewQueue(page);
      setResults(data.content || []);
    } catch (error) {
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: ReviewStatus) => {
    if (!selectedResult) return;
    setIsSubmitting(true);
    try {
      await diagnosisService.reviewDiagnosis(selectedResult.id, {
        status,
        reviewNotes,
        finalDiagnosis: selectedResult.aiPredictions?.[0]?.disease || 'Unknown' // Default to top prediction
      });
      toast.success(`Diagnosis ${status.toLowerCase()} successfully`);
      fetchQueue();
      setSelectedResult(null);
      setReviewNotes('');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-600 bg-emerald-100'; // Assuming 0-1 score
    if (score >= 0.7) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getPredictionDisplay = (diagnosis: AIDiagnosis) => {
    // Assuming aiPredictions is an array of objects
    const topPrediction = diagnosis.aiPredictions?.[0] || {};
    return {
      disease: topPrediction.disease || 'Unknown',
      confidence: topPrediction.score != null ? Math.round(topPrediction.score * 100) : 0
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Results List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {language === 'ne' ? 'AI परिणामहरू (कतार)' : 'AI Results (Queue)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : results.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No pending items</div>
            ) : (
              <div className="space-y-4">
                {results.map(result => {
                  const { disease, confidence } = getPredictionDisplay(result);
                  return (
                    <div
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedResult?.id === result.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                        }`}
                    >
                      <img
                        src={result.inputReferences?.imageUrl || '/placeholder-crop.jpg'}
                        alt="Crop"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{result.cropType} - {disease}</p>
                          <Badge className={getConfidenceColor(confidence / 100)}>
                            <Percent className="h-3 w-3 mr-1" />
                            {confidence}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.district} • {new Date(result.createdAt).toLocaleDateString()}
                          {result.reviewStatus === ReviewStatus.FLAGGED_FOR_EXPERT && (
                            <span className="ml-2 text-amber-600 font-semibold">• Flagged for Expert</span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {language === 'ne' ? 'समीक्षा विवरण' : 'Review Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResult ? (
              <div className="space-y-6">
                <div>
                  <img
                    src={selectedResult.inputReferences?.imageUrl || '/placeholder-crop.jpg'}
                    alt="Crop"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="mt-2 text-sm">
                    <p><strong>District:</strong> {selectedResult.district}</p>
                    <p><strong>Input:</strong> {selectedResult.inputType}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <p className="font-semibold text-lg">{getPredictionDisplay(selectedResult).disease}</p>
                  <p className="text-sm">{selectedResult.aiExplanation || 'No explanation provided.'}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-notes">Notes</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add review notes here..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                {selectedResult.reviewStatus === ReviewStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleReview(ReviewStatus.REJECTED)}
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                      {language === 'ne' ? 'अस्वीकार' : 'Reject'}
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={() => handleReview(ReviewStatus.APPROVED)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {language === 'ne' ? 'स्वीकार' : 'Approve'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a result to review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIReviewPage;
