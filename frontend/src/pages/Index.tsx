/**
 * Home Page - Card-Based Dashboard for Rural Users
 * Redesigned for simplicity: "अब म के गर्न सक्छु?" (What can I do now?)
 */

import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { icons } from '@/constants/icons';
import DashboardCard from '@/components/common/DashboardCard';
import BottomNav from '@/components/navigation/BottomNav';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const dashboardCards = [
    {
      icon: icons.weather.cloudy,
      titleKey: 'home.weather.title',
      subtitleKey: 'home.weather.subtitle',
      path: '/weather',
      priority: 'normal' as const,
    },
    {
      icon: icons.crops.general,
      titleKey: 'home.advisory.title',
      subtitleKey: 'home.advisory.subtitle',
      path: '/advisory',
      priority: 'normal' as const,
    },
    {
      icon: icons.disease.diagnosis,
      titleKey: 'home.diagnosis.title',
      subtitleKey: 'home.diagnosis.subtitle',
      path: '/diagnosis',
      priority: 'normal' as const,
    },
    {
      icon: icons.nav.notifications,
      titleKey: 'home.notifications.title',
      subtitleKey: 'home.notifications.subtitle',
      path: '/notifications',
      priority: 'normal' as const,
      badge: 3, // TODO: Get from notification count
    },
    {
      icon: icons.nav.knowledge,
      titleKey: 'home.knowledge.title',
      subtitleKey: 'home.knowledge.subtitle',
      path: '/knowledge',
      priority: 'normal' as const,
    },
    {
      icon: icons.marketplace.cart,
      titleKey: 'home.marketplace.title',
      subtitleKey: 'home.marketplace.subtitle',
      path: '/marketplace',
      priority: 'normal' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft pb-24">
      {/* Header */}
      <div className="bg-gradient-hero text-white px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">{t('home.welcome')}</h1>
        <p className="text-lg opacity-90">{t('home.whatCanIDo')}</p>
      </div>

      {/* Dashboard Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={index}
              icon={card.icon}
              title={t(card.titleKey)}
              subtitle={t(card.subtitleKey)}
              onClick={() => navigate(card.path)}
              priority={card.priority}
              badge={card.badge}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
