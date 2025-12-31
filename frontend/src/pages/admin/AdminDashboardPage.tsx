import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/context/LanguageContext';
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

const AdminDashboardPage = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const widgets = [
    {
      titleEn: 'Total Published Content',
      titleNe: 'प्रकाशित सामग्री',
      value: stats?.publishedContent || 128,
      icon: FileText,
      color: 'bg-primary',
      trend: '+12%'
    },
    {
      titleEn: 'Pending Reviews',
      titleNe: 'समीक्षा पर्खिदै',
      value: stats?.pendingReviews || 15,
      icon: Clock,
      color: 'bg-amber-500',
      trend: null
    },
    {
      titleEn: 'Active Advisories',
      titleNe: 'सक्रिय सल्लाह',
      value: stats?.activeAdvisories || 42,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      trend: '+5%'
    },
    {
      titleEn: 'High-Risk Alerts Today',
      titleNe: 'आज उच्च जोखिम सूचना',
      value: stats?.highRiskAlerts || 3,
      icon: AlertTriangle,
      color: 'bg-destructive',
      trend: null
    },
  ];

  const recentActivity = [
    {
      type: 'article',
      titleEn: 'Rice Cultivation Guide updated',
      titleNe: 'धान खेती गाइड अपडेट',
      time: '5 मिनेट पहिले',
      timeEn: '5 minutes ago',
      status: 'published'
    },
    {
      type: 'disease',
      titleEn: 'New disease alert: Tomato Blight',
      titleNe: 'नयाँ रोग सूचना: गोलभेडा झुल्सिने',
      time: '1 घण्टा पहिले',
      timeEn: '1 hour ago',
      status: 'alert'
    },
    {
      type: 'review',
      titleEn: 'Pesticide recommendation pending review',
      titleNe: 'कीटनाशक सिफारिस समीक्षा पर्खिदै',
      time: '2 घण्टा पहिले',
      timeEn: '2 hours ago',
      status: 'pending'
    },
    {
      type: 'advisory',
      titleEn: 'Weather advisory sent to Terai region',
      titleNe: 'तराई क्षेत्रमा मौसम सल्लाह पठाइयो',
      time: '3 घण्टा पहिले',
      timeEn: '3 hours ago',
      status: 'sent'
    },
  ];

  const topContent = [
    { titleEn: 'How to grow organic vegetables', titleNe: 'जैविक तरकारी कसरी उमार्ने', views: 2450 },
    { titleEn: 'Rice disease prevention', titleNe: 'धानको रोग रोकथाम', views: 1890 },
    { titleEn: 'Fertilizer application guide', titleNe: 'मल प्रयोग गाइड', views: 1650 },
    { titleEn: 'Seasonal crop calendar', titleNe: 'मौसमी बाली क्यालेन्डर', views: 1420 },
  ];

  return (
    <AdminLayout title="Dashboard" titleNe="ड्यासबोर्ड">
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
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'alert' ? 'bg-destructive/10 text-destructive' :
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
                    {activity.status === 'published' ? (language === 'ne' ? 'प्रकाशित' : 'Published') :
                     activity.status === 'alert' ? (language === 'ne' ? 'सूचना' : 'Alert') :
                     activity.status === 'pending' ? (language === 'ne' ? 'पर्खिदै' : 'Pending') :
                     (language === 'ne' ? 'पठाइयो' : 'Sent')}
                  </Badge>
                </div>
              ))}
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
              {topContent.map((content, index) => (
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
              ))}
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
    </AdminLayout>
  );
};

export default AdminDashboardPage;
