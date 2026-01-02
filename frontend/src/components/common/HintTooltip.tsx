/**
 * HintTooltip - Reusable hint component for complex actions
 * Displays an info icon with tooltip on hover/tap
 * Nepali-friendly text support
 */

import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HintTooltipProps {
    text: string;
    className?: string;
}

export default function HintTooltip({ text, className }: HintTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'inline-flex items-center justify-center',
                            'w-5 h-5 rounded-full',
                            'text-muted-foreground hover:text-foreground',
                            'transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            className
                        )}
                        aria-label="More information"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-sm leading-relaxed">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
