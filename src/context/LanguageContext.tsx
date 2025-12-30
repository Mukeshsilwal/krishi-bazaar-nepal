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

        // Hero Section
        'hero.title': 'किसान र खरिददारलाई सिधै जोड्ने',
        'hero.subtitle': 'नेपालको पहिलो डिजिटल कृषि बजार',
        'hero.description': 'किसानहरूले आफ्नो उत्पादन सिधै बिक्री गर्नुहोस्। खरिददारहरूले ताजा उत्पादन उचित मूल्यमा किन्नुहोस्।',
        'hero.cta.browse': 'बजार हेर्नुहोस्',
        'hero.cta.register': 'दर्ता गर्नुहोस्',

        // Features
        'features.title': 'किन कृषि हब?',
        'features.farmers.title': 'किसानहरूको लागि',
        'features.farmers.1': 'सिधै खरिददारलाई बिक्री गर्नुहोस्',
        'features.farmers.2': 'आफ्नै मूल्य तोक्नुहोस्',
        'features.farmers.3': 'बिचौलियाको कमिसन छैन',
        'features.farmers.4': 'सुरक्षित भुक्तानी',

        'features.buyers.title': 'खरिददारहरूको लागि',
        'features.buyers.1': 'खेतबाट सिधै ताजा उत्पादन',
        'features.buyers.2': 'उचित र पारदर्शी मूल्य',
        'features.buyers.3': 'गुणस्तरको ग्यारेन्टी',
        'features.buyers.4': 'सजिलो अर्डर प्रक्रिया',

        'features.payment.title': 'सुरक्षित भुक्तानी',
        'features.payment.1': 'eSewa एकीकरण',
        'features.payment.2': 'Khalti समर्थन',
        'features.payment.3': 'Escrow सुरक्षा',
        'features.payment.4': 'लेनदेन ट्र्याकिङ',

        // How It Works
        'how.title': 'यो कसरी काम गर्छ?',
        'how.step1.title': 'दर्ता गर्नुहोस्',
        'how.step1.desc': 'किसान वा खरिददारको रूपमा खाता बनाउनुहोस्',
        'how.step2.title': 'ब्राउज/सूचीबद्ध',
        'how.step2.desc': 'किसानहरूले बाली सूचीबद्ध गर्नुहोस्, खरिददारहरूले बजार हेर्नुहोस्',
        'how.step3.title': 'अर्डर र भुक्तानी',
        'how.step3.desc': 'अर्डर राख्नुहोस् र सुरक्षित भुक्तानी गर्नुहोस्',
        'how.step4.title': 'पिकअप',
        'how.step4.desc': 'पिकअप समन्वय गर्नुहोस् र लेनदेन पूरा गर्नुहोस्',

        // CTA
        'cta.title': 'सुरु गर्न तयार हुनुहुन्छ?',
        'cta.subtitle': 'हजारौं किसान र खरिददारहरू पहिले नै कृषि हब प्रयोग गर्दै छन्',
        'cta.button': 'निःशुल्क खाता बनाउनुहोस्',

        // Footer
        'footer.tagline': 'नेपालभरि किसान र खरिददारलाई जोड्दै',
        'footer.rights': 'सर्वाधिकार सुरक्षित',

        // Dashboard
        'dashboard.myListings': 'मेरो बाली सूची',
        'dashboard.myOrders': 'मेरो अर्डर',
        'dashboard.chat': 'च्याट',
        'dashboard.profile': 'प्रोफाइल',
        'nav.logout': 'लगआउट',

        // Listings
        'listings.manage': 'आफ्नो बाली सूची व्यवस्थापन गर्नुहोस्',
        'listings.create': 'नयाँ बाली थप्नुहोस्',
        'listings.edit': 'सम्पादन गर्नुहोस्',
        'listings.delete': 'मेटाउनुहोस्',
        'listings.confirmDelete': 'के तपाईं यो सूची मेटाउन निश्चित हुनुहुन्छ?',
        'listings.status.active': 'सक्रिय',
        'listings.status.sold': 'बिक्री भयो',
        'listings.status.expired': 'म्याद सकियो',

        // Orders
        'orders.manage': 'आफ्नो अर्डरहरू हेर्नुहोस् र व्यवस्थापन गर्नुहोस्',
        'orders.asBuyer': 'खरिदकर्ताको रूपमा',
        'orders.asFarmer': 'किसानको रूपमा',
        'orders.confirm': 'पुष्टि गर्नुहोस्',
        'orders.cancel': 'रद्द गर्नुहोस्',

        // Chat
        'chat.conversations': 'कुराकानी',
        'chat.noConversations': 'अहिलेसम्म कुनै कुराकानी छैन',
        'chat.typeMessage': 'सन्देश टाइप गर्नुहोस्...',
        'chat.send': 'पठाउनुहोस्',
        'chat.selectConversation': 'च्याट सुरु गर्न कुराकानी चयन गर्नुहोस्',

        // Profile
        'profile.manage': 'आफ्नो खाता जानकारी व्यवस्थापन गर्नुहोस्',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.marketplace': 'Marketplace',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.login': 'Login',
        'nav.register': 'Register',

        // Hero Section
        'hero.title': 'Direct Connection Between Farmers and Buyers',
        'hero.subtitle': "Nepal's First Digital Agricultural Marketplace",
        'hero.description': 'Farmers sell your produce directly. Buyers purchase fresh produce at fair prices.',
        'hero.cta.browse': 'Browse Marketplace',
        'hero.cta.register': 'Get Started',

        // Features
        'features.title': 'Why KrishiHub?',
        'features.farmers.title': 'For Farmers',
        'features.farmers.1': 'Sell directly to buyers',
        'features.farmers.2': 'Set your own prices',
        'features.farmers.3': 'No middleman commission',
        'features.farmers.4': 'Secure payments',

        'features.buyers.title': 'For Buyers',
        'features.buyers.1': 'Fresh produce directly from farms',
        'features.buyers.2': 'Fair and transparent pricing',
        'features.buyers.3': 'Quality guaranteed',
        'features.buyers.4': 'Easy ordering process',

        'features.payment.title': 'Secure Payments',
        'features.payment.1': 'eSewa integration',
        'features.payment.2': 'Khalti support',
        'features.payment.3': 'Escrow protection',
        'features.payment.4': 'Transaction tracking',

        // How It Works
        'how.title': 'How It Works',
        'how.step1.title': 'Register',
        'how.step1.desc': 'Create your account as a farmer or buyer',
        'how.step2.title': 'Browse/List',
        'how.step2.desc': 'Farmers list crops, buyers browse marketplace',
        'how.step3.title': 'Order & Pay',
        'how.step3.desc': 'Place orders and make secure payments',
        'how.step4.title': 'Pickup',
        'how.step4.desc': 'Coordinate pickup and complete transaction',

        // CTA
        'cta.title': 'Ready to Get Started?',
        'cta.subtitle': 'Join thousands of farmers and buyers already using KrishiHub Nepal',
        'cta.button': 'Create Free Account',

        // Footer
        'footer.tagline': 'Connecting Farmers and Buyers Across Nepal',
        'footer.rights': 'All rights reserved',

        // Dashboard
        'dashboard.myListings': 'My Listings',
        'dashboard.myOrders': 'My Orders',
        'dashboard.chat': 'Chat',
        'dashboard.profile': 'Profile',
        'nav.logout': 'Logout',

        // Listings
        'listings.manage': 'Manage your crop listings',
        'listings.create': 'Create New Listing',
        'listings.edit': 'Edit',
        'listings.delete': 'Delete',
        'listings.confirmDelete': 'Are you sure you want to delete this listing?',
        'listings.status.active': 'Active',
        'listings.status.sold': 'Sold',
        'listings.status.expired': 'Expired',

        // Orders
        'orders.manage': 'View and manage your orders',
        'orders.asBuyer': 'As Buyer',
        'orders.asFarmer': 'As Farmer',
        'orders.confirm': 'Confirm',
        'orders.cancel': 'Cancel',

        // Chat
        'chat.conversations': 'Conversations',
        'chat.noConversations': 'No conversations yet',
        'chat.typeMessage': 'Type a message...',
        'chat.send': 'Send',
        'chat.selectConversation': 'Select a conversation to start chatting',

        // Profile
        'profile.manage': 'Manage your account information',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('ne'); // Default to Nepali

    const t = (key: string): string => {
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
