import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ne' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    ne: {
        // Navbar
        'nav.home': 'गृहपृष्ठ',
        'nav.marketplace': 'बजार',
        'nav.about': 'हाम्रो बारेमा',
        'nav.contact': 'सम्पर्क',
        'nav.login': 'लगइन',
        'nav.register': 'दर्ता गर्नुहोस्',
        'nav.logout': 'लगआउट',

        // Hero Section
        'hero.badge': 'नेपालको #१ कृषि प्लेटफर्म',
        'hero.title.prefix': 'किसानको साथी,',
        'hero.title.suffix': 'नेपालको प्रगति',
        'hero.subtitle': 'आफ्नो उब्जनी सिधै किन्नेलाई बेच्नुहोस्',
        'hero.description': 'Sell your crops directly to buyers',
        'hero.cta.start': 'बेच्न सुरु गर्नुहोस्',
        'hero.cta.start.sub': 'Start Selling',
        'hero.cta.video': 'भिडियो हेर्नुहोस्',
        'hero.cta.video.sub': 'Watch Video',
        'hero.stat.farmers': 'किसानहरू',
        'hero.stat.trade': 'मासिक कारोबार',
        'hero.stat.districts': 'जिल्लाहरू',

        // Features
        'features.badge': 'सुविधाहरू / Features',
        'features.title.prefix': 'के-के',
        'features.title.highlight': 'पाइन्छ?',
        'features.subtitle': 'What can you do here?',

        // How It Works
        'how.badge': 'कसरी काम गर्छ / How It Works',
        'how.title.highlight': '४ सजिलो',
        'how.title.suffix': 'चरणमा',
        'how.subtitle': '4 Simple Steps',

        // CTA
        'cta.title': 'सुरु गर्न तयार हुनुहुन्छ?',
        'cta.subtitle': 'हजारौं किसान र खरिददारहरू पहिले नै किसान सारथी प्रयोग गर्दै छन्',
        'cta.button': 'निःशुल्क खाता बनाउनुहोस्',

        // Footer
        'footer.tagline': 'किसानको साथी, नेपालको प्रगति',
        'footer.subtagline': 'प्रविधिको प्रयोगबाट नेपाली किसानको सशक्तिकरण।',
        'footer.rights': 'सर्वाधिकार सुरक्षित।',

        // Dashboard keys
        'dashboard.myListings': 'मेरो बाली सूची',
        'dashboard.myOrders': 'मेरो अर्डर',
        'dashboard.chat': 'च्याट',
        'dashboard.profile': 'प्रोफाइल',
        // 'listings.manage': 'आफ्नो बाली सूची व्यवस्थापन गर्नुहोस्', // This was removed as per the instruction
        // 'listings.create': 'नयाँ बाली थप्नुहोस्', // This was removed as per the instruction

        // Listings
        'listings.create': 'नयाँ सूची सिर्जना गर्नुहोस्',
        'listings.subtitle': 'बिक्रीको लागि आफ्नो उब्जनीको विवरण भर्नुहोस्',
        'listings.back': 'मेरो सूचीमा फर्कनुहोस्',
        'listings.form.cropName': 'बालीको नाम',
        'listings.form.variety': 'जात',
        'listings.form.quantity': 'परिमाण',
        'listings.form.unit': 'इकाई',
        'listings.form.price': 'प्रति इकाई मूल्य (रु.)',
        'listings.form.location': 'स्थान',
        'listings.form.harvestDate': 'काट्ने मिति',
        'listings.form.description': 'विवरण',
        'listings.form.image': 'बालीको फोटो',
        'listings.form.chooseImage': 'फोटो छान्नुहोस्',
        'listings.form.cancel': 'रद्द गर्नुहोस्',
        'listings.form.submit': 'सूची सिर्जना गर्नुहोस्',
        'listings.form.submitting': 'सिर्जना हुँदैछ...',
        'listings.form.selectCrop': 'बाली छान्नुहोस्',
        'listings.form.placeholder.variety': 'जस्तै: बासमती, हाइब्रिड',
        'listings.form.placeholder.quantity': '१००',
        'listings.form.placeholder.price': '५०',
        'listings.form.placeholder.location': 'जस्तै: काठमाडौं, वडा ५',
        'listings.form.placeholder.description': 'आफ्नो बालीको गुणस्तर, अर्गानिक प्रमाणीकरण, आदि बारे वर्णन गर्नुहोस्।',
        'listings.form.unit.kg': 'के.जी.',
        'listings.form.unit.quintal': 'क्विन्टल',
        'listings.form.unit.ton': 'टन',
        'listings.form.unit.piece': 'गोटा',

        // My Listings Page
        'listings.stats.total': 'जम्मा सूची',
        'listings.stats.active': 'सक्रिय',
        'listings.stats.sold': 'बिक्री भएको',
        'listings.refresh': 'रिफ्रेस',
        'listings.empty.title': 'कुनै सूची छैन',
        'listings.empty.desc': 'बिक्री सुरु गर्न आफ्नो पहिलो बाली सूची बनाउनुहोस्',
        'listings.actions.view': 'हेर्नुहोस्',
        'listings.actions.edit': 'सम्पादन',
        'listings.actions.delete': 'हटाउनुहोस्',
        'listings.confirmDelete': 'के तपाइँ यो सूची मेटाउन निश्चित हुनुहुन्छ?',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.features': 'Features',
        'nav.howItWorks': 'How It Works',
        'nav.market': 'Market',
        'nav.contact': 'Contact',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.logout': 'Logout',

        // Hero Section
        'hero.badge': 'No. 1 Agri-Tech Platform in Nepal',
        'hero.title.prefix': 'Farmers\' Companion,',
        'hero.title.suffix': 'Nepal\'s Progress',
        'hero.subtitle': 'Get the right price for your produce. Connect directly with buyers.',
        'hero.description': 'Krishi Sarathi connects farmers directly with markets. Sell crops, buy seeds/fertilizers, and get expert advice—all in one place.',
        'hero.cta.start': 'Start Selling',
        'hero.cta.start.sub': 'It\'s free',
        'hero.cta.video': 'How it works',
        'hero.cta.video.sub': 'Watch video',
        'hero.stat.farmers': 'Active Farmers',
        'hero.stat.trade': 'Trade Volume',
        'hero.stat.districts': 'Districts Covered',

        // Features
        'features.badge': 'Features',
        'features.title.prefix': 'What do you',
        'features.title.highlight': 'get?',
        'features.subtitle': 'Everything you need for farming and marketing in one place.',

        // How It Works
        'how.badge': 'How It Works',
        'how.title.highlight': '4 Simple',
        'how.title.suffix': 'Steps',
        'how.subtitle': 'Easily sell your produce using mobile.',

        // CTA
        'cta.title': 'Ready to Get Started?',
        'cta.subtitle': 'Join thousands of farmers and buyers already using Kisan Sarathi',
        'cta.button': 'Create Free Account',

        // Footer
        'footer.tagline': 'Farmers\' Companion, Nepal\'s Progress',
        'footer.subtagline': 'Empowering Nepali farmers with technology.',
        'footer.rights': 'All rights reserved.',

        // Dashboard keys
        'dashboard.myListings': 'My Listings',
        'dashboard.myOrders': 'My Orders',
        'dashboard.chat': 'Chat',
        'dashboard.profile': 'Profile',
        'listings.manage': 'Manage your crop listings',
        'listings.create': 'Create New Listing',
        'listings.form.unit.ton': 'Ton',
        'listings.form.unit.piece': 'Piece',

        // My Listings Page
        'listings.stats.total': 'Total Listings',
        'listings.stats.active': 'Active',
        'listings.stats.sold': 'Sold',
        'listings.refresh': 'Refresh',
        'listings.empty.title': 'No listings yet',
        'listings.empty.desc': 'Create your first crop listing to start selling',
        'listings.actions.view': 'View',
        'listings.actions.edit': 'Edit',
        'listings.actions.delete': 'Delete',
        'listings.confirmDelete': 'Are you sure you want to delete this listing?',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('ne'); // Default to Nepali

    const t = (key: string): string => {
        // Fallback to key if translation missing
        return translations[language][key as keyof typeof translations.ne] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
