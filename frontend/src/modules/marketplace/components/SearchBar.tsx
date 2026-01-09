
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (e: React.FormEvent | string) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string;
}

const CROP_ICONS: Record<string, string> = {
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

const getCropIcon = (cropName: string): string => {
    const lowerName = cropName.toLowerCase();
    for (const [key, icon] of Object.entries(CROP_ICONS)) {
        if (key !== 'default' && lowerName.includes(key)) {
            return icon;
        }
    }
    return CROP_ICONS.default;
};

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    onSearch,
    suggestions,
    placeholder = "Search...",
    className = ""
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (value && suggestions.length > 0) {
            const filtered = suggestions.filter(item =>
                item.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    }, [value, suggestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
        onSearch(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(e);
            setShowSuggestions(false);
        }
    };

    const handleSearchClick = (e: React.MouseEvent) => {
        // Create a synthetic event or just pass null if check allows, but strict typing expects FormEvent.
        // We can cast or construct a simple object compatible enough, or just pass the mouse event casted.
        // Ideally onSearch should accept FormEvent | MouseEvent or just void.
        // But let's respect the interface "onSearch: (e: React.FormEvent) => void;"
        onSearch(e as unknown as React.FormEvent);
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <button
                    onClick={handleSearchClick}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 cursor-pointer p-1"
                    type="button"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>

            {showSuggestions && value && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-700 hover:text-green-700 transition-colors flex items-center gap-3"
                        >
                            <span className="text-xl">{getCropIcon(suggestion)}</span>
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
