export const CROP_ICONS: Record<string, string> = {
    // Vegetables
    tomato: "🍅",
    potato: "🥔",
    onion: "🧅",
    carrot: "🥕",
    cabbage: "🥬",
    cauliflower: "🥦",
    broccoli: "🥦",
    spinach: "🍃",
    lettuce: "🥬",
    cucumber: "🥒",
    eggplant: "🍆",
    brinjal: "🍆",
    pepper: "🌶️",
    chili: "🌶️",
    corn: "🌽",
    maize: "🌽",
    pumpkin: "🎃",
    mushroom: "🍄",
    radish: "🥕",
    bean: "🫘",
    garlic: "🧄",
    ginger: "🫚",
    okra: "🌿",
    asparagus: "🎋",
    peas: "🫛",
    sweetpotato: "🥔",
    yam: "🥔",
    bittergourd: "🥒",
    bottlegourd: "🥒",
    turmeric: "🫚",
    corlander: "🌿",
    mint: "🌿",

    // Fruits
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    grape: "🍇",
    strawberry: "🍓",
    watermelon: "🍉",
    lemon: "🍋",
    peach: "🍑",
    cherry: "🍒",
    pear: "🍐",
    pineapple: "🍍",
    mango: "🥭",
    coconut: "🥥",
    kiwi: "🥝",
    avocado: "🥑",
    pomegranate: "🍎",
    papaya: "🥭",

    // Grains & Others
    rice: "🌾",
    wheat: "🌾",
    millet: "🌾",
    barley: "🌾",
    sugarcane: "🎋",
    tea: "🍃",
    coffee: "☕",
    honey: "🍯",
    default: "🌱"
};

export const getCropIcon = (cropName: string): string => {
    const lowerName = cropName.toLowerCase();
    for (const [key, icon] of Object.entries(CROP_ICONS)) {
        if (key !== 'default' && lowerName.includes(key)) {
            return icon;
        }
    }
    return CROP_ICONS.default;
};
