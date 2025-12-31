import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Plus,
  Search,
  Edit,
  Trash2,
  Bug,
  Save,
  X,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react';
import advisoryService from '@/modules/advisory/services/advisoryService';
import { toast } from 'sonner';

interface Disease {
  id?: string;
  nameEn: string;
  nameNe: string;
  symptomsEn: string;
  symptomsNe: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedCrops: string[];
  triggerConditions?: string;
}

const DiseaseCMSPage = () => {
  const { language } = useLanguage();
  const [diseases, setDiseases] = useState<Disease[]>([
    {
      id: '1',
      nameEn: 'Rice Blast',
      nameNe: 'धान झुल्सा',
      symptomsEn: 'Diamond-shaped lesions on leaves, gray center with brown border',
      symptomsNe: 'पातमा हीरा आकारको दाग, खैरो किनारासहित खरानी रंगको बीच',
      riskLevel: 'HIGH',
      affectedCrops: ['Rice', 'Wheat']
    },
    {
      id: '2',
      nameEn: 'Tomato Blight',
      nameNe: 'गोलभेडा झुल्सिने',
      symptomsEn: 'Brown spots on leaves, fruit rot, wilting',
      symptomsNe: 'पातमा खैरो दागहरू, फल कुहिने, ओइलाउने',
      riskLevel: 'CRITICAL',
      affectedCrops: ['Tomato', 'Potato']
    },
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Partial<Disease>>({
    riskLevel: 'LOW',
    affectedCrops: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDisease.id) {
        setDiseases(prev => prev.map(d => 
          d.id === editingDisease.id ? { ...d, ...editingDisease } as Disease : d
        ));
        toast.success(language === 'ne' ? 'रोग अपडेट भयो' : 'Disease updated');
      } else {
        await advisoryService.createDisease(editingDisease);
        setDiseases(prev => [...prev, { ...editingDisease, id: Date.now().toString() } as Disease]);
        toast.success(language === 'ne' ? 'रोग थपियो' : 'Disease added');
      }
      setIsEditing(false);
      setEditingDisease({ riskLevel: 'LOW', affectedCrops: [] });
    } catch (error) {
      toast.error(language === 'ne' ? 'असफल भयो' : 'Operation failed');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'ne' ? 'के तपाईं निश्चित हुनुहुन्छ?' : 'Are you sure?')) {
      setDiseases(prev => prev.filter(d => d.id !== id));
      toast.success(language === 'ne' ? 'मेटाइयो' : 'Deleted');
    }
  };

  const filteredDiseases = diseases.filter(d => {
    const matchesSearch = d.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.nameNe.includes(searchQuery);
    const matchesRisk = filterRisk === 'all' || d.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const riskLabels = {
    LOW: { en: 'Low', ne: 'कम', color: 'bg-emerald-100 text-emerald-700' },
    MEDIUM: { en: 'Medium', ne: 'मध्यम', color: 'bg-amber-100 text-amber-700' },
    HIGH: { en: 'High', ne: 'उच्च', color: 'bg-orange-100 text-orange-700' },
    CRITICAL: { en: 'Critical', ne: 'गम्भीर', color: 'bg-red-100 text-red-700' }
  };

  if (isEditing) {
    return (
      <AdminLayout title="Add / Edit Disease" titleNe="रोग थप्नुहोस् / सम्पादन">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              {editingDisease.id 
                ? (language === 'ne' ? 'रोग सम्पादन' : 'Edit Disease')
                : (language === 'ne' ? 'नयाँ रोग' : 'New Disease')
              }
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'नाम (अंग्रेजी)' : 'Name (English)'} *
                  </label>
                  <Input
                    value={editingDisease.nameEn || ''}
                    onChange={e => setEditingDisease({ ...editingDisease, nameEn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'नाम (नेपाली)' : 'Name (Nepali)'} *
                  </label>
                  <Input
                    value={editingDisease.nameNe || ''}
                    onChange={e => setEditingDisease({ ...editingDisease, nameNe: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'लक्षणहरू (अंग्रेजी)' : 'Symptoms (English)'} *
                  </label>
                  <Textarea
                    className="min-h-[100px]"
                    value={editingDisease.symptomsEn || ''}
                    onChange={e => setEditingDisease({ ...editingDisease, symptomsEn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'लक्षणहरू (नेपाली)' : 'Symptoms (Nepali)'} *
                  </label>
                  <Textarea
                    className="min-h-[100px]"
                    value={editingDisease.symptomsNe || ''}
                    onChange={e => setEditingDisease({ ...editingDisease, symptomsNe: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Risk Level & Crops */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'जोखिम स्तर' : 'Risk Level'} *
                  </label>
                  <Select
                    value={editingDisease.riskLevel || 'LOW'}
                    onValueChange={(value) => setEditingDisease({ ...editingDisease, riskLevel: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(riskLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${label.color.replace('text-', 'bg-').split(' ')[0]}`} />
                            {language === 'ne' ? label.ne : label.en}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'प्रभावित बालीहरू (अल्पविरामले छुट्याउनुहोस्)' : 'Affected Crops (comma separated)'} *
                  </label>
                  <Input
                    value={editingDisease.affectedCrops?.join(', ') || ''}
                    onChange={e => setEditingDisease({ 
                      ...editingDisease, 
                      affectedCrops: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    })}
                    placeholder="Rice, Wheat, Tomato"
                    required
                  />
                </div>
              </div>

              {/* Trigger Conditions */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ne' ? 'ट्रिगर अवस्थाहरू' : 'Trigger Conditions'}
                </label>
                <Textarea
                  value={editingDisease.triggerConditions || ''}
                  onChange={e => setEditingDisease({ ...editingDisease, triggerConditions: e.target.value })}
                  placeholder="High humidity, temperature 20-25°C..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </Button>
                <Button type="submit" className="gap-2 bg-red-600 hover:bg-red-700">
                  <Save className="h-4 w-4" />
                  {language === 'ne' ? 'बचत गर्नुहोस्' : 'Save Disease'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Disease & Pest" titleNe="रोग र कीरा">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-600" />
            {language === 'ne' ? 'रोग व्यवस्थापन' : 'Disease Management'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              {language === 'ne' ? 'कीटनाशक म्यापिङ' : 'Pesticide Mapping'}
            </Button>
            <Button 
              onClick={() => { setIsEditing(true); setEditingDisease({ riskLevel: 'LOW', affectedCrops: [] }); }} 
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              {language === 'ne' ? 'नयाँ रोग' : 'New Disease'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ne' ? 'खोज्नुहोस्...' : 'Search...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'ne' ? 'जोखिम स्तर' : 'Risk Level'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै स्तर' : 'All Levels'}</SelectItem>
                {Object.entries(riskLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {language === 'ne' ? label.ne : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{language === 'ne' ? 'नाम' : 'Name'}</TableHead>
                  <TableHead>{language === 'ne' ? 'जोखिम स्तर' : 'Risk Level'}</TableHead>
                  <TableHead>{language === 'ne' ? 'प्रभावित बाली' : 'Affected Crops'}</TableHead>
                  <TableHead className="text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiseases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {language === 'ne' ? 'कुनै रोग भेटिएन' : 'No diseases found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiseases.map(disease => (
                    <TableRow key={disease.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{language === 'ne' ? disease.nameNe : disease.nameEn}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ne' ? disease.nameEn : disease.nameNe}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${riskLabels[disease.riskLevel].color} gap-1`}>
                          {disease.riskLevel === 'CRITICAL' || disease.riskLevel === 'HIGH' ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : null}
                          {language === 'ne' 
                            ? riskLabels[disease.riskLevel].ne 
                            : riskLabels[disease.riskLevel].en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {disease.affectedCrops.slice(0, 3).map((crop, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                          {disease.affectedCrops.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{disease.affectedCrops.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => { setEditingDisease(disease); setIsEditing(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(disease.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default DiseaseCMSPage;
