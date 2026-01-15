import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Package, ShoppingBag, MessageCircle, UserCircle, ShieldAlert } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../modules/auth/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMessages } from '../hooks/useMessages';
import { useSettings } from '@/context/SettingsContext';
import Logo from './Logo';
import MoreMenu from './navigation/MoreMenu';

interface NavbarProps {
  variant?: 'public' | 'dashboard';
}

const Navbar = ({ variant = 'public' }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { getSetting } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { unreadCount } = useMessages();
  const { settings } = useSettings();

  const toggleLanguage = () => {
    setLanguage(language === 'ne' ? 'en' : 'ne');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
            <Logo size={40} />
            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent whitespace-nowrap">
              {settings.COMPANY_NAME || 'Kisan Sarathi'}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={`hidden md:flex items-center gap-4 ${variant === 'dashboard' ? 'lg:hidden' : ''}`}>
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition px-1.5 py-2"
            >
              {t('nav.home') || 'Home'}
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-700 hover:text-green-600 font-medium transition px-1.5 py-2"
            >
              {t('nav.marketplace') || 'Marketplace'}
            </Link>
            <Link
              to="/diagnosis"
              className="text-gray-700 hover:text-green-600 font-medium transition px-1.5 py-2"
            >
              {t('nav.diagnosis') || 'Diagnosis'}
            </Link>
            <Link
              to="/agriculture-calendar"
              className="text-gray-700 hover:text-green-600 font-medium transition px-1.5 py-2"
            >
              {t('nav.calendar') || 'Calendar'}
            </Link>

            {/* More Menu - Secondary Navigation */}
            <MoreMenu label={t('nav.more') || 'More'}>
              <Link
                to="/prices"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
              >
                {t('nav.prices') || 'Prices'}
              </Link>
              <Link
                to="/logistics"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
              >
                {t('nav.logistics') || 'Logistics'}
              </Link>
              <Link
                to="/knowledge"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
              >
                {t('nav.knowledge') || 'Knowledge'}
              </Link>
              {user && (
                <>
                  <Link
                    to="/finance"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
                  >
                    {t('nav.finance') || 'Finance'}
                  </Link>
                  <Link
                    to="/ai-assistant"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
                  >
                    {t('nav.ai') || 'AI'}
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition block"
                >
                  {t('nav.admin') || 'Admin'}
                </Link>
              )}
            </MoreMenu>
          </div>

          {/* Right Side Actions (Language + Auth) - Always visible on Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2.5 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition font-semibold min-h-[44px] text-sm"
            >
              {language === 'ne' ? 'EN' : 'नेपाली'}
            </button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                  >
                    <UserCircle size={20} />
                    <span className="font-medium">{user.name || 'User'}</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {user.role === 'FARMER' && (
                        <>
                          <Link
                            to="/my-listings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <Package size={18} />
                            {t('dashboard.myListings') || 'My Listings'}
                          </Link>
                          <Link
                            to="/advisory-history"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            <ShieldAlert size={18} />
                            {language === 'ne' ? 'मेरो सल्लाह' : 'My Advisories'}
                          </Link>
                        </>
                      )}
                      <Link
                        to="/my-orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <ShoppingBag size={18} />
                        {t('dashboard.myOrders') || 'My Orders'}
                      </Link>
                      <Link
                        to="/chat"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <MessageCircle size={18} />
                        {t('dashboard.chat') || 'Chat'}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <User size={18} />
                        {t('dashboard.settings') || 'Settings'}
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={18} />
                        {t('nav.logout') || 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/cart" className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition mr-2">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  {t('nav.login') || 'Login'}
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  {t('nav.register') || 'Register'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.home') || 'Home'}
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.marketplace') || 'Marketplace'}
              </Link>
              <Link
                to="/prices"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.prices') || 'Prices'}
              </Link>
              <Link
                to="/logistics"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.logistics') || 'Logistics'}
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.knowledge') || 'Knowledge'}
              </Link>
              <Link
                to="/diagnosis"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.diagnosis') || 'Diagnosis'}
              </Link>
              <Link
                to="/agriculture-calendar"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('nav.calendar') || 'Calendar'}
              </Link>
              {user && (
                <>
                  <Link
                    to="/finance"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {t('nav.finance') || 'Finance'}
                  </Link>
                  <Link
                    to="/ai-assistant"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {t('nav.ai') || 'AI Assistant'}
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  {t('nav.admin') || 'Admin Dashboard'}
                </Link>
              )}

              {user ? (
                <>
                  {user.role === 'FARMER' && (
                    <>
                      <Link
                        to="/my-listings"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {t('dashboard.myListings') || 'My Listings'}
                      </Link>
                      <Link
                        to="/advisory-history"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {language === 'ne' ? 'मेरो सल्लाह' : 'My Advisories'}
                      </Link>
                    </>
                  )}
                  <Link
                    to="/my-orders"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {t('dashboard.myOrders') || 'My Orders'}
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                  >
                    <span>{t('dashboard.chat') || 'Chat'}</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {t('dashboard.profile') || 'Profile'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    {t('nav.logout') || 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    {t('nav.login') || 'Login'}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-center"
                  >
                    {t('nav.register') || 'Register'}
                  </Link>
                </>
              )}

              <button
                onClick={toggleLanguage}
                className="px-4 py-2 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-semibold"
              >
                {language === 'ne' ? 'English' : 'नेपाली'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
