import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from '@/components/common/InfiniteScroll';
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
  ClipboardList,
  Eye,
  TrendingUp,
  AlertTriangle,
  Users,
  CloudSun,
  Bug,
  Leaf,
  FileText,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import advisoryLogService, { AdvisoryLogResponse, AdvisoryLogFilter } from '@/services/advisoryLogService';
import AdvisoryLogDetailDrawer from '@/components/admin/AdvisoryLogDetailDrawer';

const AdvisoryLogsPage = () => {
  const { language } = useLanguage();
  const { setTitle } = useAdminTitle();

  const [logs, setLogs] = useState<AdvisoryLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  useEffect(() => {
    setTitle('Advisory Logs', 'सल्लाह लग');
  }, [setTitle]);

  const fetchLogs = useCallback(async (cursor?: string, append = false) => {
    setLoading(true);
    try {
      const filter: AdvisoryLogFilter = {
        limit: 20,
        cursor
      };

      if (filterType !== 'all') filter.advisoryType = filterType;
      if (filterSeverity !== 'all') filter.severity = filterSeverity;
      if (filterStatus !== 'all') filter.deliveryStatus = filterStatus;
      if (filterDistrict !== 'all') filter.district = filterDistrict;

      const response = await advisoryLogService.getAdvisoryLogs(filter);

      if (append) {
        setLogs(prev => [...prev, ...response.data]);
      } else {
        setLogs(response.data);
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to fetch advisory logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSeverity, filterStatus, filterDistrict]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchLogs(nextCursor, true);
    }
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

  const statusLabels: Record<string, { en: string; ne: string; color: string }> = {
    CREATED: { en: 'Created', ne: 'सिर्जना', color: 'bg-gray-100 text-gray-700' },
    DISPATCHED: { en: 'Dispatched', ne: 'पठाइएको', color: 'bg-blue-100 text-blue-700' },
    DELIVERED: { en: 'Delivered', ne: 'डेलिभर', color: 'bg-green-100 text-green-700' },
    OPENED: { en: 'Opened', ne: 'खोलिएको', color: 'bg-emerald-100 text-emerald-700' },
    FEEDBACK_RECEIVED: { en: 'Feedback', ne: 'प्रतिक्रिया', color: 'bg-purple-100 text-purple-700' },
    DELIVERY_FAILED: { en: 'Failed', ne: 'असफल', color: 'bg-red-100 text-red-700' },
    DEDUPED: { en: 'Deduped', ne: 'डुप्लिकेट', color: 'bg-gray-100 text-gray-700' }
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'ne' ? 'कुल सल्लाहहरू' : 'Total Advisories'}
                </p>
                <p className="text-3xl font-bold text-foreground">{logs.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {language === 'ne' ? 'सल्लाह लगहरू' : 'Advisory Logs'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {language === 'ne' ? 'निर्यात' : 'Export'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* ... (existing filters code) ... */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ne' ? 'प्रकार' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै प्रकार' : 'All Types'}</SelectItem>
                {Object.entries(advisoryTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {language === 'ne' ? label.ne : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ne' ? 'गम्भीरता' : 'Severity'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै स्तर' : 'All Levels'}</SelectItem>
                {Object.entries(severityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {language === 'ne' ? label.ne : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ne' ? 'स्थिति' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै स्थिति' : 'All Status'}</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {language === 'ne' ? label.ne : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ne' ? 'जिल्ला' : 'District'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ne' ? 'सबै जिल्ला' : 'All Districts'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InfiniteScroll
            isLoading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loader={<div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>}
            endMessage={
              logs.length > 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {language === 'ne' ? 'सबै लगहरू देखाइयो' : 'All logs loaded'}
                </div>
              ) : null
            }
          >
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{language === 'ne' ? 'किसान' : 'Farmer'}</TableHead>
                    <TableHead>{language === 'ne' ? 'प्रकार' : 'Type'}</TableHead>
                    <TableHead>{language === 'ne' ? 'गम्भीरता' : 'Severity'}</TableHead>
                    <TableHead>{language === 'ne' ? 'नियम' : 'Rule'}</TableHead>
                    <TableHead>{language === 'ne' ? 'स्थिति' : 'Status'}</TableHead>
                    <TableHead>{language === 'ne' ? 'मिति' : 'Date'}</TableHead>
                    <TableHead className="text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => {
                    const typeInfo = advisoryTypeLabels[log.advisoryType] || advisoryTypeLabels.WEATHER;
                    const severityInfo = severityLabels[log.severity] || severityLabels.INFO;
                    const statusInfo = statusLabels[log.deliveryStatus] || statusLabels.CREATED;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedLog(log.id)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.farmerName || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{log.district}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${typeInfo.color} gap-1`}>
                            <TypeIcon className="h-3 w-3" />
                            {language === 'ne' ? typeInfo.ne : typeInfo.en}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={severityInfo.color}>
                            {language === 'ne' ? severityInfo.ne : severityInfo.en}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.ruleName || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {language === 'ne' ? statusInfo.ne : statusInfo.en}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log.id);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </InfiniteScroll>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      {selectedLog && (
        <AdvisoryLogDetailDrawer
          logId={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
};

export default AdvisoryLogsPage;
