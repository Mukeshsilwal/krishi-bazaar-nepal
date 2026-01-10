import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './modules/auth/context/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

const MainLayout = lazy(() => import('./components/layout/MainLayout'));

// Pages
const Index = lazy(() => import('./pages/Index'));
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage'));
const MarketplacePage = lazy(() => import('./modules/marketplace/pages/MarketplacePage'));
const ListingDetailPage = lazy(() => import('./modules/marketplace/pages/ListingDetailPage'));
const OrderDetailPage = lazy(() => import('./modules/orders/pages/OrderDetailPage'));
// const PaymentRedirectPage = lazy(() => import('./modules/orders/pages/PaymentRedirectPage')); // Replaced
const PaymentSuccessPage = lazy(() => import('./modules/orders/pages/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('./pages/PaymentFailurePage'));
const MyListingsPage = lazy(() => import('./modules/marketplace/pages/MyListingsPage'));
const MyOrdersPage = lazy(() => import('./modules/orders/pages/MyOrdersPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateListingPage = lazy(() => import('./modules/marketplace/pages/CreateListingPage'));
const MarketPriceDashboard = lazy(() => import('./modules/marketplace/pages/MarketPriceDashboard'));
const LogisticsDashboard = lazy(() => import('./pages/LogisticsDashboard'));
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const NotificationList = lazy(() => import('./pages/NotificationList'));
const KnowledgePage = lazy(() => import('./modules/knowledge/pages/KnowledgePage'));
const ArticleDetailPage = lazy(() => import('./modules/knowledge/pages/ArticleDetailPage'));
const DiagnosticTool = lazy(() => import('./modules/advisory/pages/DiagnosticTool'));

const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage'));

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminRegisterPage = lazy(() => import('./pages/admin/AdminRegisterPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const KnowledgeCMSPage = lazy(() => import('./pages/admin/KnowledgeCMSPage'));
const DiseaseCMSPage = lazy(() => import('./pages/admin/DiseaseCMSPage'));
const PesticideCMSPage = lazy(() => import('./pages/admin/PesticideCMSPage'));
const AIReviewPage = lazy(() => import('./pages/admin/AIReviewPage'));
const ActivityLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage'));
const AdvisoryLogsPage = lazy(() => import('./pages/admin/AdvisoryLogsPage'));
const RoleManagement = lazy(() => import('./pages/admin/RoleManagement'));
const CmsDashboard = lazy(() => import('./pages/admin/CmsDashboard'));
const RuleCMSPage = lazy(() => import('./pages/admin/RuleCMSPage'));
const RulePlayground = lazy(() => import('./pages/admin/RulePlayground'));
const FarmerManager = lazy(() => import('./pages/admin/FarmerManager'));
const NotificationManager = lazy(() => import('./pages/admin/NotificationManager'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));

const MasterDataManager = lazy(() => import('./pages/admin/MasterDataManager'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));
const FeedbackManager = lazy(() => import('./pages/admin/FeedbackManager'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const WeatherAdvisoryManager = lazy(() => import('./pages/admin/WeatherAdvisoryManager'));
const SchemeManager = lazy(() => import('./pages/admin/SchemeManager'));
const AdminLogisticsPage = lazy(() => import('./pages/AdminLogisticsPage'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SourceManager = lazy(() => import('./pages/admin/SourceManager'));
const ModerationQueue = lazy(() => import('./pages/admin/ModerationQueue'));
const ContentDashboard = lazy(() => import('./pages/admin/content/ContentDashboard'));
const ContentEditor = lazy(() => import('./pages/admin/content/ContentEditor'));
const MarketPriceManager = lazy(() => import('./pages/admin/MarketPriceManager'));

// Agriculture Calendar
const AgricultureCalendarPage = lazy(() => import('./features/agricultureCalendar/AgricultureCalendarPage'));
const AdminAgricultureCalendarPage = lazy(() => import('./pages/admin/AdminAgricultureCalendarPage'));

// Agri Store
const AgriStorePage = lazy(() => import('./features/agriStore/AgriStorePage'));
const ProductDetailPage = lazy(() => import('./features/agriStore/ProductDetailPage'));
const AgriProductManager = lazy(() => import('./pages/admin/AgriProductManager'));

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Main App Layout */}
              <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
                <Route path="/market-prices" element={<MarketPriceDashboard />} />
                <Route path="/logistics" element={<LogisticsDashboard />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/knowledge/:id" element={<ArticleDetailPage />} />

                <Route path="/agriculture-calendar" element={<AgricultureCalendarPage />} />
                <Route path="/diagnosis" element={<DiagnosticTool />} />

                <Route path="/agri-store" element={<AgriStorePage />} />
                <Route path="/agri-store/product/:id" element={<ProductDetailPage />} />

                {/* Auth Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/register" element={<AdminRegisterPage />} />
                <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

                {/* Protected User Routes */}
                <Route path="/orders/esewa-redirect" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                <Route path="/payment/failure" element={<ProtectedRoute><PaymentFailurePage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
                <Route path="/edit-listing/:id" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              </Route>

              {/* Admin Routes */}
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="knowledge" element={<KnowledgeCMSPage />} />
                <Route path="diseases" element={<DiseaseCMSPage />} />
                <Route path="pesticides" element={<PesticideCMSPage />} />
                <Route path="ai-review" element={<AIReviewPage />} />
                <Route path="logs" element={<AdvisoryLogsPage />} />

                <Route path="cms" element={<CmsDashboard />} />
                <Route path="rules" element={<RulePlayground />} />
                <Route path="rules-manager" element={<RuleCMSPage />} />
                <Route path="farmers" element={<FarmerManager />} />
                <Route path="notifications" element={<NotificationManager />} />
                <Route path="master-data" element={<MasterDataManager />} />
                <Route path="system-health" element={<SystemHealth />} />
                <Route path="feedback" element={<FeedbackManager />} />
                <Route path="weather" element={<WeatherAdvisoryManager />} />
                <Route path="schemes" element={<SchemeManager />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SettingsManager />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="sources" element={<SourceManager />} />
                <Route path="moderation" element={<ModerationQueue />} />
                <Route path="content" element={<ContentDashboard />} />
                <Route path="content/:id" element={<ContentEditor />} />
                <Route path="market-prices" element={<MarketPriceManager />} />
                <Route path="agriculture-calendar" element={<AdminAgricultureCalendarPage />} />
                <Route path="activities" element={<ActivityLogsPage />} />
                <Route path="activities" element={<ActivityLogsPage />} />
                <Route path="agri-products" element={<AgriProductManager />} />
                <Route path="logistics" element={<AdminLogisticsPage />} />

              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
      <Toaster richColors closeButton position="top-right" />
    </Router >
  );
}

export default App;

