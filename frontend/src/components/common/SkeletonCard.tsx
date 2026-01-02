/**
 * SkeletonCard - Loading placeholder for dashboard cards
 */

export default function SkeletonCard() {
    return (
        <div className="w-full touch-target-large rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center gap-3">
            {/* Icon skeleton */}
            <div className="w-12 h-12 skeleton-circle" />

            {/* Title skeleton */}
            <div className="h-6 w-32 skeleton" />

            {/* Subtitle skeleton */}
            <div className="h-4 w-24 skeleton" />
        </div>
    );
}
