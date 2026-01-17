import React, { useState } from 'react';
import { ChatUser } from '../services/chatService';
import { Search, Users, Filter, X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface UserDirectoryProps {
    users: ChatUser[];
    onSelect: (user: ChatUser) => void;
    isLoading: boolean;
    onSearch: (query: string) => void;
    onFilterRole: (role: string) => void;
}

const ROLE_COLORS: Record<string, string> = {
    FARMER: 'bg-green-100 text-green-800 border-green-200',
    BUYER: 'bg-blue-100 text-blue-800 border-blue-200',
    VENDOR: 'bg-purple-100 text-purple-800 border-purple-200',
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    EXPERT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SUPER_ADMIN: 'bg-gray-100 text-gray-800 border-gray-200'
};

const ROLE_LABELS: Record<string, string> = {
    FARMER: 'किसान',
    BUYER: 'खरिददार',
    VENDOR: 'विक्रेता',
    ADMIN: 'प्रशासक',
    EXPERT: 'विशेषज्ञ',
    SUPER_ADMIN: 'सुपर प्रशासक'
};

export const UserDirectory: React.FC<UserDirectoryProps> = ({
    users,
    onSelect,
    isLoading,
    onSearch,
    onFilterRole
}) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    const handleRoleFilter = (role: string) => {
        if (selectedRole === role) {
            setSelectedRole('');
            onFilterRole('');
        } else {
            setSelectedRole(role);
            onFilterRole(role);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedRole('');
        onSearch('');
        onFilterRole('');
    };

    if (isLoading && users.length === 0) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Search Bar */}
            <div className="p-3 bg-white border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('chat.searchUsers') || 'Search users...'}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearFilters}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${showFilters || selectedRole
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Filter size={16} />
                    <span>Filter by Role</span>
                    {selectedRole && (
                        <span className="ml-1 px-2 py-0.5 bg-green-600 text-white rounded-full text-xs">
                            {ROLE_LABELS[selectedRole] || selectedRole}
                        </span>
                    )}
                </button>
            </div>

            {/* Role Filters */}
            {showFilters && (
                <div className="p-3 bg-white border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                        {['FARMER', 'BUYER', 'VENDOR', 'ADMIN', 'EXPERT'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleFilter(role)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${selectedRole === role
                                        ? ROLE_COLORS[role] + ' ring-2 ring-offset-1 ring-green-500'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {ROLE_LABELS[role] || role}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('chat.noUsersFound') || 'No users found'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your search or filters
                        </p>
                        {(searchQuery || selectedRole) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {users.map((user) => (
                            <button
                                key={user.userId}
                                onClick={() => onSelect(user)}
                                className="w-full p-3 text-left bg-white hover:bg-green-50 transition rounded-lg border border-transparent hover:border-green-200 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        {user.online && (
                                            <div
                                                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"
                                                title={t('chat.online') || 'Online'}
                                            />
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 truncate text-sm">
                                                {user.name || t('chat.unknownUser') || 'Unknown User'}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                {ROLE_LABELS[user.role] || user.role}
                                            </span>
                                        </div>

                                        {user.lastMessage ? (
                                            <p className="text-xs text-gray-600 truncate">
                                                {user.lastMessage}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">
                                                {t('chat.noMessages') || 'No messages yet'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unread Badge or Status */}
                                    <div className="flex-shrink-0">
                                        {user.unreadCount > 0 ? (
                                            <div className="bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-sm">
                                                {user.unreadCount > 9 ? '9+' : user.unreadCount}
                                            </div>
                                        ) : user.hasConversation ? (
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            {users.length > 0 && (
                <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{users.length} {users.length === 1 ? 'user' : 'users'} found</span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {users.filter(u => u.online).length} online
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
