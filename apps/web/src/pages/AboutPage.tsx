
import React from 'react';
import { Leaf, Users, Globe, ShieldCheck, TrendingUp, Truck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const AboutPage = () => {
    const { t } = useLanguage();
    const { getSetting } = useSettings();

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4 py-12">
                <h1 className="text-4xl md:text-5xl font-bold text-green-700">{getSetting('ABOUT_TITLE', t('about.title'))}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {getSetting('ABOUT_SUBTITLE', t('about.subtitle'))}
                </p>
            </section>

            {/* Mission & Vision */}
            <section className="grid md:grid-cols-2 gap-8">
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                            <Leaf className="h-6 w-6" /> {t('about.mission.title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {getSetting('ABOUT_MISSION_DESC', t('about.mission.desc'))}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                            <Globe className="h-6 w-6" /> {t('about.vision.title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {getSetting('ABOUT_VISION_DESC', t('about.vision.desc'))}
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* What We Do Icon Grid */}
            <section className="space-y-8">
                <h2 className="text-3xl font-bold text-center text-gray-800">{t('about.why.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: <Users className="h-8 w-8 text-green-600" />,
                            title: t('about.why.1.title'),
                            description: t('about.why.1.desc')
                        },
                        {
                            icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
                            title: t('about.why.2.title'),
                            description: t('about.why.2.desc')
                        },
                        {
                            icon: <Truck className="h-8 w-8 text-orange-600" />,
                            title: t('about.why.3.title'),
                            description: t('about.why.3.desc')
                        },
                        {
                            icon: <ShieldCheck className="h-8 w-8 text-purple-600" />,
                            title: t('about.why.4.title'),
                            description: t('about.why.4.desc')
                        }
                    ].map((item, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 text-center space-y-3">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-green-700 rounded-2xl p-8 md:p-12 text-white text-center space-y-6">
                <h2 className="text-3xl font-bold">{t('about.cta.title')}</h2>
                <p className="text-green-100 max-w-2xl mx-auto">
                    {t('about.cta.subtitle')}
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild size="lg" variant="secondary" className="font-semibold">
                        <Link to="/register">{t('about.cta.join')}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                        <Link to="/marketplace">{t('about.cta.explore')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
