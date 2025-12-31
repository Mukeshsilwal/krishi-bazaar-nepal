import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import MarketplacePage from './modules/marketplace/pages/MarketplacePage';
import ListingDetailPage from './modules/marketplace/pages/ListingDetailPage';
import OrderDetailPage from './modules/orders/pages/OrderDetailPage';
import PaymentRedirectPage from './modules/orders/pages/PaymentRedirectPage';
import MyListingsPage from './modules/marketplace/pages/MyListingsPage';
import MyOrdersPage from './modules/orders/pages/MyOrdersPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CreateListingPage from './modules/marketplace/pages/CreateListingPage';
import MarketPriceDashboard from './modules/marketplace/pages/MarketPriceDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import AiAssistant from './pages/AiAssistant';
import NotificationList from './pages/NotificationList';
import KnowledgePage from './modules/knowledge/pages/KnowledgePage';
import ArticleDetailPage from './modules/knowledge/pages/ArticleDetailPage';
import DiagnosticTool from './modules/advisory/pages/DiagnosticTool';

import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import KnowledgeCMSPage from './pages/admin/KnowledgeCMSPage';
import DiseaseCMSPage from './pages/admin/DiseaseCMSPage';
import PesticideCMSPage from './pages/admin/PesticideCMSPage';
import AIReviewPage from './pages/admin/AIReviewPage';
import AdvisoryLogsPage from './pages/admin/AdvisoryLogsPage';
import RoleManagement from './pages/admin/RoleManagement';
import CmsDashboard from './pages/admin/CmsDashboard';
import RulePlayground from './pages/admin/RulePlayground';
import FarmerManager from './pages/admin/FarmerManager';
import NotificationManager from './pages/admin/NotificationManager';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

import MasterDataManager from './pages/admin/MasterDataManager';
import SystemHealth from './pages/admin/SystemHealth';
import FeedbackManager from './pages/admin/FeedbackManager';
import SupportPage from './pages/SupportPage';
import ComingSoon from './pages/admin/ComingSoon';
import SettingsManager from './pages/admin/SettingsManager';
import WeatherAdvisoryManager from './pages/admin/WeatherAdvisoryManager';
import SchemeManager from './pages/admin/SchemeManager';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
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
            <Route path="/diagnosis" element={<DiagnosticTool />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route path="/orders/esewa-redirect" element={<ProtectedRoute><PaymentRedirectPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
            <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/knowledge" element={<ProtectedRoute requiredRole="ADMIN"><KnowledgeCMSPage /></ProtectedRoute>} />
            <Route path="/admin/diseases" element={<ProtectedRoute requiredRole="ADMIN"><DiseaseCMSPage /></ProtectedRoute>} />
            <Route path="/admin/pesticides" element={<ProtectedRoute requiredRole="ADMIN"><PesticideCMSPage /></ProtectedRoute>} />
            <Route path="/admin/ai-review" element={<ProtectedRoute requiredRole="ADMIN"><AIReviewPage /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute requiredRole="ADMIN"><AdvisoryLogsPage /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute requiredRole="ADMIN"><RoleManagement /></ProtectedRoute>} />
            <Route path="/admin/cms" element={<ProtectedRoute requiredRole="ADMIN"><CmsDashboard /></ProtectedRoute>} />
            <Route path="/admin/rules" element={<ProtectedRoute requiredRole="ADMIN"><RulePlayground /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute requiredRole="ADMIN"><FarmerManager /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="ADMIN"><NotificationManager /></ProtectedRoute>} />
            <Route path="/admin/master-data" element={<ProtectedRoute requiredRole="ADMIN"><MasterDataManager /></ProtectedRoute>} />
            <Route path="/admin/system-health" element={<ProtectedRoute requiredRole="ADMIN"><SystemHealth /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={<ProtectedRoute requiredRole="ADMIN"><FeedbackManager /></ProtectedRoute>} />
            <Route path="/admin/weather" element={<ProtectedRoute requiredRole="ADMIN"><WeatherAdvisoryManager /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute requiredRole="ADMIN"><SchemeManager /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="ADMIN"><SettingsManager /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="ADMIN"><AnalyticsDashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router >
  );
}

export default App;

