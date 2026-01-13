import React, { useEffect, useState } from 'react';
import WeatherCard from '@/features/dashboard/components/WeatherCard';
import StatCard from '@/features/dashboard/components/StatCard';
import MarketStats from '@/features/dashboard/components/MarketStats';
import AdvisoryWidget from '@/features/dashboard/components/AdvisoryWidget';
import { Sprout, ShoppingBag, ExternalLink, MapPin } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import marketPriceService from '@/modules/marketplace/services/marketPriceService';
import orderService from '@/modules/orders/services/orderService';
import financeService from '@/services/financeService';
import { Link } from 'react-router-dom';

import { useSettings } from '@/context/SettingsContext';

const Index = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { getSetting } = useSettings();

  // State for dynamic data
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [latestScheme, setLatestScheme] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Pending Orders Count
        if (user) {
          const orders = await orderService.getMyOrders(user.role, 0, 10);
          // Assuming orders API returns a paginated response with totalElements or content array
          const count = orders.totalElements || (Array.isArray(orders.content) ? orders.content.length : 0);
          setPendingOrdersCount(count);
        }

        // 3. Fetch Government Schemes
        const schemes = await financeService.getAllSubsidies();
        if (schemes && schemes.length > 0) {
          // Show the most recent or random one
          setLatestScheme(schemes[0]);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'ne') {
      if (hour >= 5 && hour < 12) return 'शुभ प्रभात ☀️';
      if (hour >= 12 && hour < 18) return 'शुभ दिन 🌤';
      return 'शुभ सन्ध्या 🌙';
    }
    if (hour >= 5 && hour < 12) return 'Good Morning ☀️';
    if (hour >= 12 && hour < 18) return 'Good Afternoon 🌤';
    return 'Good Evening 🌙';
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, <span className="text-green-700">{user?.name || (language === 'ne' ? 'किसान मित्र' : 'Farmer Friend')}!</span>
        </h1>
        <div className="flex items-center gap-1.5 text-gray-500 mt-2">
          <MapPin size={16} className="text-green-600" />
          <span>{user?.district || (language === 'ne' ? 'नेपाल' : 'Nepal')}</span>
        </div>
        <p className="text-gray-500 mt-1">
          {language === 'ne'
            ? 'आजको बजार मूल्य र कृषि जानकारी यहाँ पाउनुहोस्'
            : 'Find today\'s market prices and agri-updates here.'}
        </p>
      </header>

      {/* Top Row: Weather + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weather - Takes 4 cols (1/3 width) on Large screens */}
        <div className="md:col-span-5 lg:col-span-4 h-[220px]">
          <WeatherCard />
        </div>

        {/* Stats - Takes remaining space */}
        {/* Stats - Takes remaining space */}
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 h-[220px]">
          <StatCard
            titleEn="My Orders"
            titleNe="मेरो अर्डरहरू"
            value={pendingOrdersCount.toString()}
            subValue={language === 'ne' ? "कुल अर्डरहरू" : "Total Orders"}
            variant="primary"
            icon={<ShoppingBag size={24} />}
            emptyStateLink="/marketplace"
            emptyStateTextEn="Explore the marketplace →"
            emptyStateTextNe="बजार हेर्नुहोस् →"
          />
        </div>
      </div>

      {/* Market Prices Table */}
      <MarketStats />

      {/* Bottom Row: Advisory + Schemes/Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdvisoryWidget />

        {/* Government Schemes / Subsidies */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center h-full">
          {latestScheme ? (
            <>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2620/2620614.png"
                  alt="Gov"
                  className="w-8 h-8 opacity-70"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">{latestScheme.title}</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6 line-clamp-2">
                {latestScheme.description}
              </p>
              <Link to="/finance" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                {language === 'ne' ? 'विवरण हेर्नुहोस्' : 'View Details'}
              </Link>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ExternalLink className="text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-500">
                {language === 'ne' ? 'उपलब्ध योजनाहरू छैनन्' : 'No Active Schemes'}
              </h3>
              <Link to="/finance" className="text-blue-600 font-medium text-sm mt-2 hover:underline block">
                {language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All Finance'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-green-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-2">
            {getSetting('HERO_TITLE_PREFIX', "Farmers' Companion,")} <span className="text-green-300">{getSetting('HERO_TITLE_SUFFIX', "Nepal's Progress")}</span>
          </h2>
          <p className="text-green-100 mb-6">{getSetting('HERO_DESCRIPTION', "Krishi Sarathi connects farmers directly with markets.")}</p>
          <Link to="/marketplace/create" className="bg-white text-green-800 px-6 py-2.5 rounded-lg font-bold hover:bg-green-50 transition-colors inline-block">
            {language === 'ne' ? 'बेच्न सुरु गर्नुहोस्' : 'Start Selling'}
          </Link>
        </div>

        {/* Decoration */}
        <div className="absolute right-0 bottom-0 opacity-10">
          <Sprout size={300} />
        </div>
      </div>
    </div>
  );
};

export default Index;
