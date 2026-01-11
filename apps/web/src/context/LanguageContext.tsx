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
        'nav.marketplace': 'बजारस्थल',
        'nav.prices': 'मूल्य',
        'nav.logistics': 'रसद व्यवस्थापन',
        'nav.knowledge': 'ज्ञान',
        'nav.diagnosis': 'रोग निदान',
        'nav.finance': 'वित्त',
        'nav.ai': 'एआई सहायक',
        'nav.admin': 'प्रशासक',
        'nav.about': 'हाम्रो बारेमा',
        'nav.contact': 'सम्पर्क',
        'nav.login': 'लगइन',
        'nav.register': 'दर्ता गर्नुहोस्',
        'nav.logout': 'लगआउट',
        'nav.more': 'थप',
        'nav.calendar': 'कृषि क्यालेन्डर',

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

        // Orders
        'orders.manage': 'आफ्नो अर्डरहरू हेर्नुहोस् र व्यवस्थापन गर्नुहोस्',
        'orders.asBuyer': 'खरिददारको रूपमा',
        'orders.asFarmer': 'किसानको रूपमा',

        // Profile
        'profile.manage': 'आफ्नो खाताको जानकारी व्यवस्थापन गर्नुहोस्',
        'profile.accountType': 'खाताको प्रकार',
        'profile.memberSince': 'सदस्य मिति',
        'profile.verificationStatus': 'प्रमाणीकरण स्थिति',
        'profile.verified': 'प्रमाणित',
        'profile.pending': 'लम्बित',

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
        'listings.form.harvestWindow': 'काट्ने अवधि',
        'listings.form.dailyQuantityLimit': 'दैनिक परिमाण सीमा',
        'listings.form.orderCutoffTime': 'अर्डर गर्ने अन्तिम समय',
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

        // Common
        'common.days': 'दिन',

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

        // Market Price Dashboard
        'market.title': 'बजार जानकारी',
        'market.subtitle': 'ताजा कृषि बजार मूल्य र रुझानहरू',
        'market.hero.title': 'बजार जानकारी',
        'market.hero.subtitle': 'वास्तविक समयमा बजार मूल्य ट्र्याक गर्नुहोस् र बजारको अवस्था विश्लेषण गर्नुहोस्।',
        'market.search.placeholder': 'आलु, स्याउ आदीको मूल्य खोज्नुहोस्...',
        'market.filter.district': 'जिल्ला:',
        'market.table.title': 'दैनिक दरहरू',
        'market.table.commodity': 'कृषि उपज',
        'market.table.unit': 'इकाई',
        'market.table.min': 'न्यूनतम',
        'market.table.max': 'अधिकतम',
        'market.table.avg': 'औसत',
        'market.table.source': 'स्रोत',
        'market.trend.title': 'मूल्य प्रवृत्ति',
        'market.trend.select': 'बाली छान्नुहोस्',
        'market.trend.noData': 'इतिहास उपलब्ध छैन',
        'market.tips.title': 'बजार सुझावहरू',
        'market.tips.1': '• मूल्यहरू प्रमुख बजारहरूबाट हरेक घण्टा अपडेट हुन्छन्।',
        'market.tips.2': '• थोक मूल्यमा सामान्यतया भ्याट समावेश हुँदैन।',
        'market.tips.3': '• थप बजार विवरणको लागि "राम्रोपात्रो" हेर्नुहोस्।',
        'market.empty': 'मा कुनै मूल्य फेला परेन',
        'market.loading': 'थप मूल्यहरू लोड हुँदै...',
        'market.end': 'सूची समाप्त',

        // Marketplace Page
        'marketplace.hero.title': 'ताजा कृषि उपज खोज्नुहोस्',
        'marketplace.hero.subtitle': 'किसानहरूसँग सिधै जोडिनुहोस् र ताजा तरकारी, फलफूल र अन्नको उत्कृष्ट मूल्य पाउनुहोस्।',
        'marketplace.search.placeholder': 'विशेष तरकारी, फलफूल खोज्नुहोस् (जस्तै: आलु, आँप)...',

        // Hero Actions
        'hero.action.sell': 'बाली बेच्नुहोस्',
        'hero.action.sell.sub': 'धेरै ग्राहकसम्म पुग्नुहोस्',
        'hero.action.price': 'बजार मूल्य',
        'hero.action.price.sub': 'दैनिक भाउ',
        'hero.action.buy': 'किन्नुहोस्',
        'hero.action.buy.sub': 'ताजा उत्पादन',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.marketplace': 'Marketplace',
        'nav.prices': 'Prices',
        'nav.logistics': 'Logistics',
        'nav.knowledge': 'Knowledge',
        'nav.diagnosis': 'Diagnosis',
        'nav.finance': 'Finance',
        'nav.ai': 'AI Assistant',
        'nav.admin': 'Admin',
        'nav.features': 'Features',
        'nav.howItWorks': 'How It Works',
        'nav.market': 'Market',
        'nav.contact': 'Contact',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.logout': 'Logout',
        'nav.more': 'More',
        'nav.calendar': 'Agri Calendar',

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

        // Orders
        'orders.manage': 'View and manage your orders',
        'orders.asBuyer': 'As Buyer',
        'orders.asFarmer': 'As Farmer',

        // Profile
        'profile.manage': 'Manage your account information',
        'profile.accountType': 'Account Type',
        'profile.memberSince': 'Member Since',
        'profile.verificationStatus': 'Verification Status',
        'profile.verified': 'Verified',
        'profile.pending': 'Pending',

        // Listings
        'listings.manage': 'Manage your crop listings',
        'listings.create': 'Create New Listing',
        'listings.subtitle': 'Fill in the details of your produce for sale',
        'listings.back': 'Back to My Listings',
        'listings.form.cropName': 'Crop Name',
        'listings.form.variety': 'Variety',
        'listings.form.quantity': 'Quantity',
        'listings.form.unit': 'Unit',
        'listings.form.price': 'Price per Unit (Rs.)',
        'listings.form.location': 'Location',
        'listings.form.harvestDate': 'Harvest Date',
        'listings.form.harvestWindow': 'Harvest Window',
        'listings.form.dailyQuantityLimit': 'Daily Quantity Limit',
        'listings.form.orderCutoffTime': 'Order Cutoff Time',
        'listings.form.description': 'Description',
        'listings.form.image': 'Crop Image',
        'listings.form.chooseImage': 'Choose Image',
        'listings.form.cancel': 'Cancel',
        'listings.form.submit': 'Create Listing',
        'listings.form.submitting': 'Creating...',
        'listings.form.selectCrop': 'Select Crop',
        'listings.form.placeholder.variety': 'e.g., Basmati, Hybrid',
        'listings.form.placeholder.quantity': '100',
        'listings.form.placeholder.price': '50',
        'listings.form.placeholder.location': 'e.g., Kathmandu, Ward 5',
        'listings.form.placeholder.description': 'Describe quality, organic certification, etc.',
        'listings.form.unit.kg': 'Kg',
        'listings.form.unit.quintal': 'Quintal',
        'listings.form.unit.ton': 'Ton',
        'listings.form.unit.piece': 'Piece',

        // Common
        'common.days': 'Days',

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

        // Market Price Dashboard
        'market.title': 'Market Intelligence',
        'market.subtitle': 'Real-time agricultural commodity prices and trends',
        'market.hero.title': 'Market Intelligence',
        'market.hero.subtitle': 'Track real-time agricultural prices and analyze market trends.',
        'market.search.placeholder': 'Search price for Potato, Apple...',
        'market.filter.district': 'District:',
        'market.table.title': 'Daily Rates',
        'market.table.commodity': 'Commodity',
        'market.table.unit': 'Unit',
        'market.table.min': 'Min',
        'market.table.max': 'Max',
        'market.table.avg': 'Avg',
        'market.table.source': 'Source',
        'market.trend.title': 'Price Trend',
        'market.trend.select': 'Select a crop',
        'market.trend.noData': 'No history data available',
        'market.tips.title': 'Market Tips',
        'market.tips.1': '• Prices are updated hourly from major markets.',
        'market.tips.2': '• Wholesale prices usually exclude VAT.',
        'market.tips.3': '• Check "RamroPatro" for additional market listings.',
        'market.empty': 'No prices found in',
        'market.loading': 'Loading more prices...',
        'market.end': 'End of list',

        // Marketplace Page
        'marketplace.hero.title': 'Find Fresh Agricultural Produce',
        'marketplace.hero.subtitle': 'Connect directly with farmers and get the best prices for fresh vegetables, fruits, and grains.',
        'marketplace.search.placeholder': 'Search for specific vegetables, fruits (e.g. Potato, Mango)...',
        'hero.action.sell': 'Sell Crops',
        'hero.action.sell.sub': 'Reach more buyers',
        'hero.action.price': 'Check Prices',
        'hero.action.price.sub': 'Today\'s market rates',
        'hero.action.buy': 'Buy Produce',
        'hero.action.buy.sub': 'Fresh from farm',
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
