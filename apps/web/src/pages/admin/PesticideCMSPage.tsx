import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Pill,
  Save,
  X,
  ShieldAlert,
  Leaf,
  CheckCircle
} from 'lucide-react';
import advisoryService from '@/modules/advisory/services/advisoryService';
import { toast } from 'sonner';

interface Pesticide {
  id?: string;
  nameEn: string;
  nameNe: string;
  type: 'FUNGICIDE' | 'INSECTICIDE' | 'HERBICIDE' | 'OTHER';
  isOrganic: boolean;
  activeIngredients?: string;
  dosagePerLiter?: string;
  sprayIntervalDays?: number;
  safetyInstructionsEn?: string;
  safetyInstructionsNe?: string;
  govtApprovalLicense?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

const PesticideCMSPage = () => {
  const { language } = useLanguage();
  const { setTitle } = useAdminTitle();

  useEffect(() => {
    setTitle('Pesticides & Medicine', 'कीटनाशक र औषधि');
  }, [setTitle]);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response: any = await advisoryService.getAllPesticides();

      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        list = response.data.content;
      } else if (response.content && Array.isArray(response.content)) {
        list = response.content;
      }

      setPesticides(list);
    } catch (error) {
      console.error("Failed to fetch pesticides", error);
      toast.error("Failed to load pesticides");
    }
  };

  const [pesticides, setPesticides] = useState<Pesticide[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPesticide, setEditingPesticide] = useState<Partial<Pesticide>>({
    type: 'FUNGICIDE',
    isOrganic: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPesticide.id) {
        // Update existing
        setPesticides(prev => prev.map(p =>
          p.id === editingPesticide.id ? { ...p, ...editingPesticide } as Pesticide : p
        ));
        toast.success(language === 'ne' ? 'कीटनाशक अपडेट भयो' : 'Pesticide updated');
      } else {
        // Create new
        await advisoryService.createPesticide(editingPesticide);
        toast.success(language === 'ne' ? 'कीटनाशक थपियो' : 'Pesticide added');
        loadData();
      }
      setIsEditing(false);
      setEditingPesticide({ type: 'FUNGICIDE', isOrganic: false });
    } catch (error) {
      toast.error(language === 'ne' ? 'असफल भयो' : 'Operation failed');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'ne' ? 'के तपाईं निश्चित हुनुहुन्छ?' : 'Are you sure?')) {
      setPesticides(prev => prev.filter(p => p.id !== id));
      toast.success(language === 'ne' ? 'मेटाइयो' : 'Deleted');
    }
  };

  const filteredPesticides = pesticides.filter(p => {
    const matchesSearch = p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameNe.includes(searchQuery);
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const typeLabels = {
    FUNGICIDE: { en: 'Fungicide', ne: 'ढुसीनाशक' },
    INSECTICIDE: { en: 'Insecticide', ne: 'कीटनाशक' },
    HERBICIDE: { en: 'Herbicide', ne: 'झारनाशक' },
    OTHER: { en: 'Other', ne: 'अन्य' }
  };

  if (isEditing) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-amber-600" />
              {editingPesticide.id
                ? (language === 'ne' ? 'कीटनाशक सम्पादन' : 'Edit Pesticide')
                : (language === 'ne' ? 'नयाँ कीटनाशक' : 'New Pesticide')
              }
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Warning Banner */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {language === 'ne'
                  ? 'चेतावनी: यहाँ थपिएका सबै कीटनाशकहरूले किसानहरूलाई देखाउँदा स्वचालित रूपमा "सल्लाह मात्र" अस्वीकरण बोक्नेछन्।'
                  : 'Warning: All pesticides added here will automatically carry the mandatory "Advisory Only" disclaimer when shown to farmers.'}
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'नाम (अंग्रेजी)' : 'Name (English)'} *
                  </label>
                  <Input
                    value={editingPesticide.nameEn || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, nameEn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'नाम (नेपाली)' : 'Name (Nepali)'} *
                  </label>
                  <Input
                    value={editingPesticide.nameNe || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, nameNe: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'प्रकार' : 'Type'} *
                  </label>
                  <Select
                    value={editingPesticide.type || 'FUNGICIDE'}
                    onValueChange={(value) => setEditingPesticide({ ...editingPesticide, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {language === 'ne' ? label.ne : label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'मात्रा/लिटर' : 'Dosage per Liter'}
                  </label>
                  <Input
                    value={editingPesticide.dosagePerLiter || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, dosagePerLiter: e.target.value })}
                    placeholder="e.g., 2-3g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'छर्काउ अन्तराल (दिन)' : 'Spray Interval (days)'}
                  </label>
                  <Input
                    type="number"
                    value={editingPesticide.sprayIntervalDays || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, sprayIntervalDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ne' ? 'सक्रिय तत्व' : 'Active Ingredients'}
                </label>
                <Input
                  value={editingPesticide.activeIngredients || ''}
                  onChange={e => setEditingPesticide({ ...editingPesticide, activeIngredients: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'सुरक्षा निर्देशन (अंग्रेजी)' : 'Safety Instructions (English)'}
                  </label>
                  <Textarea
                    className="min-h-[100px]"
                    value={editingPesticide.safetyInstructionsEn || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, safetyInstructionsEn: e.target.value })}
                    placeholder="PPE requirements, handling precautions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'सुरक्षा निर्देशन (नेपाली)' : 'Safety Instructions (Nepali)'}
                  </label>
                  <Textarea
                    className="min-h-[100px]"
                    value={editingPesticide.safetyInstructionsNe || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, safetyInstructionsNe: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ne' ? 'सरकारी अनुमति / लाइसेन्स' : 'Govt Approval / License'}
                  </label>
                  <Input
                    value={editingPesticide.govtApprovalLicense || ''}
                    onChange={e => setEditingPesticide({ ...editingPesticide, govtApprovalLicense: e.target.value })}
                    placeholder="NPL-PEST-2024-XXX"
                  />
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingPesticide.isOrganic || false}
                      onCheckedChange={(checked) => setEditingPesticide({ ...editingPesticide, isOrganic: checked })}
                    />
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      {language === 'ne' ? 'जैविक' : 'Organic'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </Button>
                <Button type="submit" className="gap-2 bg-amber-600 hover:bg-amber-700">
                  <Save className="h-4 w-4" />
                  {language === 'ne' ? 'बचत गर्नुहोस्' : 'Save Pesticide'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-amber-600" />
            {language === 'ne' ? 'कीटनाशक व्यवस्थापन' : 'Pesticide Management'}
          </CardTitle>
          <Button
            onClick={() => { setIsEditing(true); setEditingPesticide({ type: 'FUNGICIDE', isOrganic: false }); }}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            {language === 'ne' ? 'नयाँ कीटनाशक' : 'New Pesticide'}
          </Button>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={language === 'ne' ? 'प्रकार' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै प्रकार' : 'All Types'}</SelectItem>
                {Object.entries(typeLabels).map(([key, label]) => (
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
                  <TableHead>{language === 'ne' ? 'प्रकार' : 'Type'}</TableHead>
                  <TableHead>{language === 'ne' ? 'सरकारी अनुमति' : 'Govt Approved'}</TableHead>
                  <TableHead>{language === 'ne' ? 'जैविक' : 'Organic'}</TableHead>
                  <TableHead>{language === 'ne' ? 'स्थिति' : 'Status'}</TableHead>
                  <TableHead className="text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPesticides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === 'ne' ? 'कुनै कीटनाशक भेटिएन' : 'No pesticides found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPesticides.map(pesticide => (
                    <TableRow key={pesticide.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{language === 'ne' ? pesticide.nameNe : pesticide.nameEn}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ne' ? pesticide.nameEn : pesticide.nameNe}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {language === 'ne'
                            ? typeLabels[pesticide.type].ne
                            : typeLabels[pesticide.type].en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pesticide.govtApprovalLicense ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">{pesticide.govtApprovalLicense}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pesticide.isOrganic ? (
                          <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                            <Leaf className="h-3 w-3" />
                            {language === 'ne' ? 'जैविक' : 'Organic'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pesticide.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {pesticide.status === 'ACTIVE'
                            ? (language === 'ne' ? 'सक्रिय' : 'Active')
                            : (language === 'ne' ? 'निष्क्रिय' : 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditingPesticide(pesticide); setIsEditing(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(pesticide.id!)}
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
    </>
  );
};

export default PesticideCMSPage;
