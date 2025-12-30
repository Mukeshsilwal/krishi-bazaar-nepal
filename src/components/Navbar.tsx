import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Package, ShoppingBag, MessageCircle, UserCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../hooks/useMessages';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();

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
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <Logo size={44} />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              KrishiHub Nepal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              {t('nav.home') || 'Home'}
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              {t('nav.marketplace') || 'Marketplace'}
            </Link>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition font-semibold"
            >
              {language === 'ne' ? 'English' : 'नेपाली'}
            </button>

            {/* User Menu or Auth Buttons */}
            {user ? (
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
                      <Link
                        to="/my-listings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Package size={18} />
                        {t('dashboard.myListings') || 'My Listings'}
                      </Link>
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
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User size={18} />
                      {t('dashboard.profile') || 'Profile'}
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
            ) : (
              <div className="flex gap-3">
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

              {user ? (
                <>
                  {user.role === 'FARMER' && (
                    <Link
                      to="/my-listings"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      {t('dashboard.myListings') || 'My Listings'}
                    </Link>
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
