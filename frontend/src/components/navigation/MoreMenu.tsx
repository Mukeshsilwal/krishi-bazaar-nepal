import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface MoreMenuProps {
    label: string;
    children: ReactNode;
}

/**
 * MoreMenu - Dropdown wrapper for secondary navigation items
 * Non-destructive component that wraps existing Link components
 * Preserves all child props and behavior
 */
const MoreMenu = ({ label, children }: MoreMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium transition px-1.5 py-2"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {label}
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Render children (existing Link components) with dropdown styling */}
                    <div className="flex flex-col">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoreMenu;
