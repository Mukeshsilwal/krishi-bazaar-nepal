import React, { useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfiniteScrollProps {
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    children: React.ReactNode;
    threshold?: number;
    className?: string;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
    isLoading,
    hasMore,
    onLoadMore,
    children,
    threshold = 0.5,
    className = '',
    loader = <div className="p-4 flex justify-center"><LoadingSpinner /></div>,
    endMessage = <p className="text-center text-gray-500 py-4">No more items to load</p>
}) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    onLoadMore();
                }
            }, {
                threshold: threshold
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, hasMore, onLoadMore, threshold]
    );

    return (
        <div className={className}>
            {children}
            <div ref={lastElementRef} className="h-4" />
            {isLoading && loader}
            {!hasMore && !isLoading && endMessage}
        </div>
    );
};

export default InfiniteScroll;
