import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/modules/auth/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Bug,
  Pill,
  CloudSun,
  FileText,
  Brain,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Globe,
  ChevronDown,
  Sprout,
  ShieldAlert,
  MessageSquare,
  LineChart,
  Tractor,
  BookOpenCheck,
  Database,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  titleNe?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, titleNe }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      labelEn: 'Dashboard',
      labelNe: 'ड्यासबोर्ड'
    },
    {
      path: '/admin/knowledge',
      icon: BookOpen,
      labelEn: 'Knowledge Content',
      labelNe: 'ज्ञान सामग्री'
    },
    {
      path: '/admin/diseases',
      icon: Bug,
      labelEn: 'Disease & Pest',
      labelNe: 'रोग र कीरा'
    },
    {
      path: '/admin/pesticides',
      icon: Pill,
      labelEn: 'Pesticides & Medicine',
      labelNe: 'कीटनाशक र औषधि'
    },
    {
      path: '/admin/weather',
      icon: CloudSun,
      labelEn: 'Weather Advisories',
      labelNe: 'मौसम सल्लाह'
    },
    {
      path: '/admin/schemes',
      icon: FileText,
      labelEn: 'Govt Schemes',
      labelNe: 'सरकारी योजना'
    },
    {
      path: '/admin/ai-review',
      icon: Brain,
      labelEn: 'AI Diagnosis Review',
      labelNe: 'AI निदान समीक्षा'
    },
    {
      path: '/admin/logs',
      icon: ClipboardList,
      labelEn: 'Advisory Logs',
      labelNe: 'सल्लाह लग'
    },
    {
      path: '/admin/users',
      icon: Users,
      labelEn: 'Users & Roles',
      labelNe: 'प्रयोगकर्ता र भूमिका'
    },
    {
      path: '/admin/analytics',
      icon: LineChart,
      labelEn: 'Analytics',
      labelNe: 'तथ्याङ्क'
    },
    {
      path: '/admin/cms',
      icon: BookOpenCheck,
      labelEn: 'Content Workflow',
      labelNe: 'सामग्री प्रवाह'
    },
    {
      path: '/admin/rules',
      icon: ShieldAlert,
      labelEn: 'Rules Engine',
      labelNe: 'नियम इन्जिन'
    },
    {
      path: '/admin/notifications',
      icon: MessageSquare,
      labelEn: 'Notifications',
      labelNe: 'सूचनाहरू'
    },
    {
      path: '/admin/farmers',
      icon: Tractor,
      labelEn: 'Farmer Management',
      labelNe: 'किसान व्यवस्थापन'
    },
    {
      path: '/admin/master-data',
      icon: Database,
      labelEn: 'Master Data',
      labelNe: 'प्रमुख तथ्याङ्क'
    },
    {
      path: '/admin/roles',
      icon: Users,
      labelEn: 'RbAC Roles',
      labelNe: 'भूमिकाहरू'
    },
    {
      path: '/admin/settings',
      icon: Settings,
      labelEn: 'Settings',
      labelNe: 'सेटिङ'
    },
    {
      path: '/admin/system-health',
      icon: Activity,
      labelEn: 'System Health',
      labelNe: 'प्रणाली स्थिति'
    },
    {
      path: '/admin/feedback',
      icon: MessageSquare,
      labelEn: 'Support Tickets',
      labelNe: 'समर्थन टिकट'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 lg:w-20'
          } overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-primary/5">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-foreground text-lg">Kisan Sarathi</h1>
                <p className="text-xs text-muted-foreground">किसान सारथी</p>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {language === 'ne' ? item.labelNe : item.labelEn}
                    </span>
                    {language === 'ne' && (
                      <span className="text-xs opacity-70">{item.labelEn}</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {language === 'ne' && titleNe ? titleNe : title}
              </h2>
              {language === 'ne' && titleNe && (
                <p className="text-xs text-muted-foreground">{title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'ne' ? 'en' : 'ne')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'ne' ? 'EN' : 'ने'}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ne' ? 'व्यवस्थापक' : 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2">
                  <LogOut className="h-4 w-4" />
                  {language === 'ne' ? 'लगआउट' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
