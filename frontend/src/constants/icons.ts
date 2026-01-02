/**
 * Icon Mapping for Rural-First UI
 * Using Lucide React icons with semantic naming
 */

import {
    // Weather Icons
    Cloud,
    CloudRain,
    CloudDrizzle,
    CloudSnow,
    Sun,
    CloudSun,
    Wind,
    Droplets,

    // Crop & Plant Icons
    Sprout,
    Wheat,
    Leaf,
    TreePine,

    // Disease & Health Icons
    Bug,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    Activity,
    Stethoscope,

    // Actions
    Camera,
    Upload,
    Send,
    Check,
    X,
    Search,
    Filter,
    Plus,
    Minus,
    Edit,
    Trash2,
    Save,
    Download,

    // Navigation
    Home,
    Bell,
    BookOpen,
    User,
    Settings,
    HelpCircle,
    Menu,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    ArrowRight,

    // Status & Priority
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,

    // Marketplace
    ShoppingCart,
    Package,
    TrendingUp,
    DollarSign,
    MapPin,

    // Communication
    MessageCircle,
    Phone,
    Mail,

    // Time
    Clock,
    Calendar,
    History,

    // Other
    Eye,
    EyeOff,
    LogOut,
    LogIn,
    RefreshCw,
    ExternalLink,
} from 'lucide-react';

export const icons = {
    // Weather
    weather: {
        sunny: Sun,
        cloudy: Cloud,
        rainy: CloudRain,
        drizzle: CloudDrizzle,
        snowy: CloudSnow,
        partlyCloudy: CloudSun,
        wind: Wind,
        humidity: Droplets,
    },

    // Crops
    crops: {
        general: Sprout,
        wheat: Wheat,
        leaf: Leaf,
        tree: TreePine,
    },

    // Disease & Diagnosis
    disease: {
        bug: Bug,
        warning: AlertTriangle,
        critical: ShieldAlert,
        safe: ShieldCheck,
        diagnosis: Stethoscope,
        health: Activity,
    },

    // Actions
    actions: {
        camera: Camera,
        upload: Upload,
        send: Send,
        check: Check,
        close: X,
        search: Search,
        filter: Filter,
        add: Plus,
        remove: Minus,
        edit: Edit,
        delete: Trash2,
        save: Save,
        download: Download,
    },

    // Navigation
    nav: {
        home: Home,
        notifications: Bell,
        knowledge: BookOpen,
        profile: User,
        settings: Settings,
        help: HelpCircle,
        menu: Menu,
        next: ChevronRight,
        previous: ChevronLeft,
        back: ArrowLeft,
        forward: ArrowRight,
    },

    // Status
    status: {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: Info,
    },

    // Marketplace
    marketplace: {
        cart: ShoppingCart,
        package: Package,
        trending: TrendingUp,
        price: DollarSign,
        location: MapPin,
    },

    // Communication
    communication: {
        message: MessageCircle,
        phone: Phone,
        email: Mail,
    },

    // Time
    time: {
        clock: Clock,
        calendar: Calendar,
        history: History,
    },

    // Other
    other: {
        view: Eye,
        hide: EyeOff,
        logout: LogOut,
        login: LogIn,
        refresh: RefreshCw,
        external: ExternalLink,
    },
};

/**
 * Priority Color Mapping
 * Rural-first: Red = Urgent, Yellow = Warning, Green = Safe
 */
export const priorityColors = {
    critical: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800',
    },
    high: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800',
    },
    medium: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800',
    },
    low: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800',
    },
    normal: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800',
    },
};

/**
 * Touch Target Sizes (minimum 48px for rural users)
 */
export const touchTargets = {
    small: 'min-h-[48px] min-w-[48px]',
    medium: 'min-h-[56px] min-w-[56px]',
    large: 'min-h-[64px] min-w-[64px]',
};

/**
 * Icon Sizes
 */
export const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
};
