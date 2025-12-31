import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
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
  ChevronRight
} from 'lucide-react';

interface AIResult {
  id: string;
  imageUrl: string;
  detectedDisease: string;
  detectedDiseaseNe: string;
  confidenceScore: number;
  suggestedPesticide: string;
  suggestedPesticideNe: string;
  farmerLocation: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'corrected' | 'rejected';
}

const AIReviewPage = () => {
  const { language } = useLanguage();
  const [selectedResult, setSelectedResult] = useState<AIResult | null>(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  const aiResults: AIResult[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      detectedDisease: 'Rice Blast',
      detectedDiseaseNe: 'धान झुल्सा',
      confidenceScore: 92,
      suggestedPesticide: 'Carbendazim 50% WP',
      suggestedPesticideNe: 'कार्बेन्डाजिम ५०% डब्ल्यूपी',
      farmerLocation: 'Chitwan',
      timestamp: '2024-01-15T10:30:00',
      status: 'pending'
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b2a?w=400',
      detectedDisease: 'Tomato Blight',
      detectedDiseaseNe: 'गोलभेडा झुल्सिने',
      confidenceScore: 78,
      suggestedPesticide: 'Mancozeb 75% WP',
      suggestedPesticideNe: 'म्यान्कोजेब ७५% डब्ल्यूपी',
      farmerLocation: 'Kavre',
      timestamp: '2024-01-15T09:15:00',
      status: 'pending'
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400',
      detectedDisease: 'Wheat Rust',
      detectedDiseaseNe: 'गहुँको रस्ट',
      confidenceScore: 95,
      suggestedPesticide: 'Propiconazole 25% EC',
      suggestedPesticideNe: 'प्रोपिकोनाजोल २५% ईसी',
      farmerLocation: 'Bhaktapur',
      timestamp: '2024-01-14T16:45:00',
      status: 'approved'
    },
  ];

  const filteredResults = aiResults.filter(r => 
    filterStatus === 'all' || r.status === filterStatus
  );

  const handleApprove = (id: string) => {
    // Approve logic
    console.log('Approved:', id);
  };

  const handleReject = (id: string) => {
    // Reject logic
    console.log('Rejected:', id);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <AdminLayout title="AI Diagnosis Review" titleNe="AI निदान समीक्षा">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                {language === 'ne' ? 'AI परिणामहरू' : 'AI Results'}
              </CardTitle>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ne' ? 'सबै' : 'All'}</SelectItem>
                  <SelectItem value="pending">{language === 'ne' ? 'पर्खिदै' : 'Pending'}</SelectItem>
                  <SelectItem value="approved">{language === 'ne' ? 'स्वीकृत' : 'Approved'}</SelectItem>
                  <SelectItem value="corrected">{language === 'ne' ? 'सच्याइयो' : 'Corrected'}</SelectItem>
                  <SelectItem value="rejected">{language === 'ne' ? 'अस्वीकृत' : 'Rejected'}</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.map(result => (
                  <div 
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedResult?.id === result.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <img 
                      src={result.imageUrl} 
                      alt="Crop" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {language === 'ne' ? result.detectedDiseaseNe : result.detectedDisease}
                        </p>
                        <Badge className={getConfidenceColor(result.confidenceScore)}>
                          <Percent className="h-3 w-3 mr-1" />
                          {result.confidenceScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Pill className="h-3 w-3" />
                        {language === 'ne' ? result.suggestedPesticideNe : result.suggestedPesticide}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.farmerLocation} • {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      result.status === 'approved' ? 'default' :
                      result.status === 'pending' ? 'outline' :
                      result.status === 'corrected' ? 'secondary' : 'destructive'
                    }>
                      {result.status === 'pending' ? (language === 'ne' ? 'पर्खिदै' : 'Pending') :
                       result.status === 'approved' ? (language === 'ne' ? 'स्वीकृत' : 'Approved') :
                       result.status === 'corrected' ? (language === 'ne' ? 'सच्याइयो' : 'Corrected') :
                       (language === 'ne' ? 'अस्वीकृत' : 'Rejected')}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
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
                  {/* Image Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {language === 'ne' ? 'तस्बिर' : 'Image'}
                    </p>
                    <img 
                      src={selectedResult.imageUrl} 
                      alt="Crop" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>

                  {/* AI Detection */}
                  <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ne' ? 'पत्ता लागेको रोग' : 'Detected Disease'}
                        </p>
                        <p className="font-medium">
                          {language === 'ne' ? selectedResult.detectedDiseaseNe : selectedResult.detectedDisease}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ne' ? 'विश्वास स्कोर' : 'Confidence Score'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                selectedResult.confidenceScore >= 90 ? 'bg-emerald-500' :
                                selectedResult.confidenceScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedResult.confidenceScore}%` }}
                            />
                          </div>
                          <span className="font-bold">{selectedResult.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ne' ? 'सुझाव गरिएको कीटनाशक' : 'Suggested Pesticide'}
                        </p>
                        <p className="font-medium">
                          {language === 'ne' ? selectedResult.suggestedPesticideNe : selectedResult.suggestedPesticide}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning for low confidence */}
                  {selectedResult.confidenceScore < 80 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                      <p>
                        {language === 'ne' 
                          ? 'कम विश्वास स्कोर। कृपया सावधानीपूर्वक समीक्षा गर्नुहोस्।'
                          : 'Low confidence score. Please review carefully.'}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedResult.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => handleReject(selectedResult.id)}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                        {language === 'ne' ? 'अस्वीकार' : 'Reject'}
                      </Button>
                      <Button 
                        className="gap-2"
                        onClick={() => handleApprove(selectedResult.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {language === 'ne' ? 'स्वीकार' : 'Approve'}
                      </Button>
                    </div>
                  )}

                  <Button variant="secondary" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    {language === 'ne' ? 'रोग सच्याउनुहोस्' : 'Correct Disease'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {language === 'ne' 
                      ? 'समीक्षा गर्न परिणाम चयन गर्नुहोस्'
                      : 'Select a result to review'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AIReviewPage;
