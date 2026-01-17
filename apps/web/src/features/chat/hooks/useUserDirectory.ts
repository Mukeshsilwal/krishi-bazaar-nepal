import { useState, useEffect, useCallback } from 'react';
import { chatService, ChatUser } from '../services/chatService';

export const useUserDirectory = () => {
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const loadUsers = useCallback(async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const currentPage = resetPage ? 0 : page;
            let fetchedUsers: ChatUser[] = [];

            if (searchQuery) {
                fetchedUsers = await chatService.searchChatUsers(searchQuery, currentPage, 30);
            } else if (roleFilter) {
                fetchedUsers = await chatService.filterChatUsersByRole(roleFilter, currentPage, 30);
            } else {
                fetchedUsers = await chatService.getChatUsers(currentPage, 30);
            }

            if (resetPage) {
                setUsers(fetchedUsers);
                setPage(0);
            } else {
                setUsers(prev => [...prev, ...fetchedUsers]);
            }

            setHasMore(fetchedUsers.length === 30);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchQuery, roleFilter]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setRoleFilter('');
        setPage(0);
    }, []);

    const handleFilterRole = useCallback((role: string) => {
        setRoleFilter(role);
        setSearchQuery('');
        setPage(0);
    }, []);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, hasMore]);

    const refresh = useCallback(() => {
        setPage(0);
        loadUsers(true);
    }, [loadUsers]);

    // Initial load
    useEffect(() => {
        loadUsers(true);
    }, [searchQuery, roleFilter]);

    // Load more when page changes
    useEffect(() => {
        if (page > 0) {
            loadUsers(false);
        }
    }, [page]);

    return {
        users,
        isLoading,
        error,
        hasMore,
        loadMore,
        refresh,
        handleSearch,
        handleFilterRole
    };
};
