
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (e: React.FormEvent) => void;
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
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    grape: "🍇",
    strawberry: "🍓",
    rice: "🌾",
    wheat: "🌾",
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
        // Optional: Trigger search immediately on suggestion click
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
