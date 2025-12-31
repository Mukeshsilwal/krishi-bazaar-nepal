import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
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
  ClipboardList,
  Eye,
  TrendingUp,
  AlertTriangle,
  Users,
  CloudSun,
  Bug,
  Brain,
  BarChart3
} from 'lucide-react';

const AdvisoryLogsPage = () => {
  const { language } = useLanguage();
  const [filterType, setFilterType] = useState('all');

  const stats = [
    {
      titleEn: 'Most Viewed Advisories',
      titleNe: 'सबैभन्दा धेरै हेरिएको सल्लाह',
      value: '2,450',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      titleEn: 'High-Risk Alerts Sent',
      titleNe: 'पठाइएको उच्च जोखिम सूचना',
      value: '128',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      titleEn: 'Farmer Engagement Rate',
      titleNe: 'किसान संलग्नता दर',
      value: '78%',
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      titleEn: 'Actions Taken',
      titleNe: 'लिइएका कार्यहरू',
      value: '1,892',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
  ];

  const logs = [
    {
      id: '1',
      advisoryName: 'Rice Blast Prevention Guide',
      advisoryNameNe: 'धान झुल्सा रोकथाम गाइड',
      triggerType: 'WEATHER',
      region: 'Chitwan',
      views: 456,
      actionsTaken: 89,
      timestamp: '2024-01-15T10:30:00'
    },
    {
      id: '2',
      advisoryName: 'Tomato Disease Alert',
      advisoryNameNe: 'गोलभेडा रोग सूचना',
      triggerType: 'AI',
      region: 'Kavre',
      views: 312,
      actionsTaken: 67,
      timestamp: '2024-01-15T09:15:00'
    },
    {
      id: '3',
      advisoryName: 'Wheat Planting Advisory',
      advisoryNameNe: 'गहुँ रोपण सल्लाह',
      triggerType: 'CROP',
      region: 'Bhaktapur',
      views: 289,
      actionsTaken: 45,
      timestamp: '2024-01-14T16:45:00'
    },
    {
      id: '4',
      advisoryName: 'Heavy Rain Warning',
      advisoryNameNe: 'भारी वर्षा चेतावनी',
      triggerType: 'WEATHER',
      region: 'Terai',
      views: 678,
      actionsTaken: 234,
      timestamp: '2024-01-14T14:20:00'
    },
    {
      id: '5',
      advisoryName: 'Pest Control Recommendation',
      advisoryNameNe: 'कीट नियन्त्रण सिफारिस',
      triggerType: 'AI',
      region: 'Pokhara',
      views: 198,
      actionsTaken: 56,
      timestamp: '2024-01-13T11:00:00'
    },
  ];

  const triggerLabels: Record<string, { en: string; ne: string; icon: React.ElementType; color: string }> = {
    WEATHER: { en: 'Weather', ne: 'मौसम', icon: CloudSun, color: 'bg-blue-100 text-blue-700' },
    CROP: { en: 'Crop', ne: 'बाली', icon: Bug, color: 'bg-emerald-100 text-emerald-700' },
    AI: { en: 'AI', ne: 'AI', icon: Brain, color: 'bg-purple-100 text-purple-700' }
  };

  const filteredLogs = logs.filter(log => 
    filterType === 'all' || log.triggerType === filterType
  );

  return (
    <AdminLayout title="Advisory Logs & Analytics" titleNe="सल्लाह लग र विश्लेषण">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'ne' ? stat.titleNe : stat.titleEn}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {language === 'ne' ? 'सल्लाह लगहरू' : 'Advisory Logs'}
          </CardTitle>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={language === 'ne' ? 'ट्रिगर प्रकार' : 'Trigger Type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ne' ? 'सबै प्रकार' : 'All Types'}</SelectItem>
              {Object.entries(triggerLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {language === 'ne' ? label.ne : label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{language === 'ne' ? 'सल्लाह नाम' : 'Advisory Name'}</TableHead>
                  <TableHead>{language === 'ne' ? 'ट्रिगर प्रकार' : 'Trigger Type'}</TableHead>
                  <TableHead>{language === 'ne' ? 'क्षेत्र' : 'Region'}</TableHead>
                  <TableHead className="text-center">{language === 'ne' ? 'हेरिएको' : 'Views'}</TableHead>
                  <TableHead className="text-center">{language === 'ne' ? 'कार्यहरू' : 'Actions'}</TableHead>
                  <TableHead>{language === 'ne' ? 'मिति' : 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => {
                  const trigger = triggerLabels[log.triggerType];
                  const TriggerIcon = trigger.icon;
                  return (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {language === 'ne' ? log.advisoryNameNe : log.advisoryName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${trigger.color} gap-1`}>
                          <TriggerIcon className="h-3 w-3" />
                          {language === 'ne' ? trigger.ne : trigger.en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.region}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">{log.actionsTaken}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Chart Placeholder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {language === 'ne' ? 'साप्ताहिक संलग्नता' : 'Weekly Engagement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              {language === 'ne' ? 'चार्ट यहाँ देखाइनेछ' : 'Chart will be displayed here'}
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdvisoryLogsPage;
