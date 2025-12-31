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

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import KnowledgeCMSPage from './pages/admin/KnowledgeCMSPage';
import DiseaseCMSPage from './pages/admin/DiseaseCMSPage';
import PesticideCMSPage from './pages/admin/PesticideCMSPage';
import AIReviewPage from './pages/admin/AIReviewPage';
import AdvisoryLogsPage from './pages/admin/AdvisoryLogsPage';

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
            <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/knowledge" element={<ProtectedRoute requiredRole="ADMIN"><KnowledgeCMSPage /></ProtectedRoute>} />
            <Route path="/admin/diseases" element={<ProtectedRoute requiredRole="ADMIN"><DiseaseCMSPage /></ProtectedRoute>} />
            <Route path="/admin/pesticides" element={<ProtectedRoute requiredRole="ADMIN"><PesticideCMSPage /></ProtectedRoute>} />
            <Route path="/admin/ai-review" element={<ProtectedRoute requiredRole="ADMIN"><AIReviewPage /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute requiredRole="ADMIN"><AdvisoryLogsPage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;

