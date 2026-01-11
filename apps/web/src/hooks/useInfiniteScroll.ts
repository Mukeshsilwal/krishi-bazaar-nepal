import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
    fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
    initialPage?: number;
}

export function useInfiniteScroll<T>({ fetchData, initialPage = 0 }: UseInfiniteScrollOptions<T>) {
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Ref for the intersection observer target
    const loaderRef = useRef<HTMLDivElement>(null);

    // To prevent double-fetching in React Strict Mode or fast scrolls
    const isFetchingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await fetchData(page);

            setData(prev => {
                // simple deduping by ID if objects have ID, otherwise just concat
                // Assuming generic T might not have ID, so we rely on backend for correct pagination
                return [...prev, ...result.data];
            });

            setHasMore(result.hasMore);
            if (result.hasMore) {
                setPage(prev => prev + 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [fetchData, page, hasMore]);

    // Reset function to clear list and restart from page 0 (e.g. on filter change)
    const reset = useCallback(() => {
        setData([]);
        setPage(initialPage);
        setHasMore(true);
        setError(null);
        isFetchingRef.current = false;
        // We might want to trigger a fetch immediately after reset or let the observer handle it
        // Often nicer to let the observer trigger if the list is empty and loader is visible
    }, [initialPage]);

    // Intersection Observer setup
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !isFetchingRef.current) {
                    loadMore();
                }
            },
            { threshold: 0.1 } // Load when 10% of loader is visible
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasMore, loading, loadMore]);

    return {
        data,
        loading,
        error,
        hasMore,
        loaderRef,
        reset,
        setData // Expose in case we need to verify/modify manually (e.g. optimistic delete)
    };
}
