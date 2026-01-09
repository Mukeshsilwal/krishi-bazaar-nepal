import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminTitle } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  Bug
} from 'lucide-react';
import adminService from '@/services/adminService';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  // User Metrics
  totalUsers: number;
  totalFarmers: number;
  pendingVerifications: number;

  // Content Metrics
  totalArticles: number;
  publishedArticles: number;
  pendingReviews: number;

  // Advisory Metrics
  activeAdvisories: number;
  highRiskAlerts: number;
  advisoriesDeliveredToday: number;

  // System Metrics
  totalOrders: number;
  aiDiagnosisCount: number;

  recentActivity: {
    type: string;
    titleEn: string;
    titleNe: string;
    time: string;
    timeEn: string;
    status: string;
  }[];

  topContent: {
    titleEn: string;
    titleNe: string;
    views: number;
  }[];
}

const AdminDashboardPage = () => {
  const { language } = useLanguage();
  const { setTitle } = useAdminTitle();

  React.useEffect(() => {
    setTitle('Dashboard', 'ड्यासबोर्ड');
  }, [setTitle]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminService.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const widgets = [
    {
      titleEn: 'Total Published Content',
      titleNe: 'प्रकाशित सामग्री',
      value: stats?.publishedArticles || 0,
      icon: FileText,
      color: 'bg-primary',
      trend: null
    },
    {
      titleEn: 'Pending Reviews',
      titleNe: 'समीक्षा पर्खिदै',
      value: stats?.pendingReviews || 0,
      icon: Clock,
      color: 'bg-amber-500',
      trend: null
    },
    {
      titleEn: 'Active Advisories (7d)',
      titleNe: 'सक्रिय सल्लाह (७ दिन)',
      value: stats?.activeAdvisories || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      trend: null
    },
    {
      titleEn: 'High-Risk Alerts Today',
      titleNe: 'आज उच्च जोखिम सूचना',
      value: stats?.highRiskAlerts || 0,
      icon: AlertTriangle,
      color: 'bg-destructive',
      trend: null
    },
  ];



  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'ne' ? widget.titleNe : widget.titleEn}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{widget.value}</p>
                    {widget.trend && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-emerald-500">{widget.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`${widget.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {language === 'ne' ? 'भर्खरको गतिविधि' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${activity.status === 'alert' ? 'bg-destructive/10 text-destructive' :
                      activity.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                      {activity.type === 'disease' ? <Bug className="h-4 w-4" /> :
                        activity.type === 'article' ? <FileText className="h-4 w-4" /> :
                          <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {language === 'ne' ? activity.titleNe : activity.titleEn}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ne' ? activity.time : activity.timeEn}
                      </p>
                    </div>
                    <Badge
                      variant={activity.status === 'alert' ? 'destructive' :
                        activity.status === 'pending' ? 'outline' : 'default'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {language === 'ne' ? 'कुनै गतिविधि छैन' : 'No recent activity'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {language === 'ne' ? 'लोकप्रिय सामग्री' : 'Top Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topContent && stats.topContent.length > 0 ? (
                stats.topContent.map((content, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {language === 'ne' ? content.titleNe : content.titleEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">{content.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {language === 'ne' ? 'कुनै सामग्री छैन' : 'No top content'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {language === 'ne' ? 'द्रुत कार्यहरू' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { labelEn: 'Add Article', labelNe: 'लेख थप्नुहोस्', icon: FileText, path: '/admin/knowledge' },
                { labelEn: 'Add Disease', labelNe: 'रोग थप्नुहोस्', icon: Bug, path: '/admin/diseases' },
                { labelEn: 'Review AI', labelNe: 'AI समीक्षा', icon: CheckCircle, path: '/admin/ai-review' },
                { labelEn: 'Send Alert', labelNe: 'सूचना पठाउनुहोस्', icon: AlertTriangle, path: '/admin/weather' },
                { labelEn: 'Activity Logs', labelNe: 'गतिविधि लगहरू', icon: Clock, path: '/admin/activities' },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.path}
                    className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {language === 'ne' ? action.labelNe : action.labelEn}
                    </span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboardPage;
