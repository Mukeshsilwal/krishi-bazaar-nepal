import React from 'react';
import WeatherCard from '@/features/dashboard/components/WeatherCard';
import StatCard from '@/features/dashboard/components/StatCard';
import MarketStats from '@/features/dashboard/components/MarketStats';
import AdvisoryWidget from '@/features/dashboard/components/AdvisoryWidget';
import { Sprout, Wheat, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'ne') {
      return 'नमस्ते';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting - Migrated from DashboardLayout */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, <span className="text-green-700">{user?.name || (language === 'ne' ? 'किसान मित्र' : 'Farmer Friend')}!</span>
        </h1>
        <p className="text-gray-500 mt-2">
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
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 h-[220px]">
          <StatCard
            titleEn="Apple Price"
            titleNe="स्याउ मूल्य"
            value="Rs 245"
            subValue="Per Kg"
            trend={12}
            icon={<Sprout size={24} />}
          />
          <StatCard
            titleEn="Wheat Price"
            titleNe="गहुँ मूल्य"
            value="Rs 3,200"
            subValue="Per Quintal"
            trend={-5}
            icon={<Wheat size={24} />}
          />
          <StatCard
            titleEn="Pending Orders"
            titleNe="नयाँ अर्डरहरू"
            value="12"
            subValue="40+ Items"
            variant="primary"
            icon={<ShoppingBag size={24} />}
          />
        </div>
      </div>



      {/* Market Prices Table */}
      <MarketStats />

      {/* Bottom Row: Advisory + Schemes/Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdvisoryWidget />

        {/* Mocking the 'Government Schemes' card from reference using similar style */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2620/2620614.png"
              alt="Gov"
              className="w-8 h-8 opacity-70"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">Pradhanmantri Krishi Pariyojana</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6">
            Subsidy available for modern farming equipment and seeds.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            View Details
          </button>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-green-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-2">Sell Your Crops Online</h2>
          <p className="text-green-100 mb-6">Connect directly with buyers and get the best price for your produce.</p>
          <button className="bg-white text-green-800 px-6 py-2.5 rounded-lg font-bold hover:bg-green-50 transition-colors">
            Start Selling
          </button>
        </div>
        <div className="relative z-10 mt-6 md:mt-0">
          {/* Character Image Placeholder */}
          {/* <img src="/character.png" className="h-48" /> */}
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
