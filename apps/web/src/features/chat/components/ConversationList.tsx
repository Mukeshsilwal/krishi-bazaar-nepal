import React from 'react';
import { Conversation } from '../services/chatService';
import { MessageCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId?: string;
    onSelect: (conversation: Conversation) => void;
    onlineUsers: Record<string, boolean>;
    typingUsers: Record<string, boolean>;
    isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeConversationId,
    onSelect,
    onlineUsers,
    typingUsers,
    isLoading
}) => {
    const { t } = useLanguage();

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="p-2 space-y-1">
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

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('chat.noConversations') || 'No conversations yet'}
                </h3>
                <p className="text-sm text-gray-500">
                    Start a conversation from the Users tab
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-2 space-y-1">
                {conversations.map((conversation) => {
                    const isActive = activeConversationId === conversation.id;
                    const isOnline = onlineUsers[conversation.userMobile];
                    const isTyping = typingUsers[conversation.userId];

                    return (
                        <button
                            key={conversation.id}
                            onClick={() => onSelect(conversation)}
                            className={`w-full p-3 text-left transition rounded-lg border ${isActive
                                    ? 'bg-green-50 border-green-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-green-50 hover:border-green-200 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${isActive
                                            ? 'bg-gradient-to-br from-green-500 to-green-700'
                                            : 'bg-gradient-to-br from-green-400 to-green-600'
                                        }`}>
                                        {conversation.userName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    {isOnline && (
                                        <div
                                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"
                                            title={t('chat.online') || 'Online'}
                                        />
                                    )}
                                </div>

                                {/* Conversation Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className={`font-semibold truncate text-sm ${isActive ? 'text-green-900' : 'text-gray-900'
                                            }`}>
                                            {conversation.userName || t('chat.unknownUser') || 'Unknown User'}
                                        </p>
                                        {conversation.lastMessageTime && (
                                            <span className={`text-xs flex-shrink-0 ml-2 ${isActive ? 'text-green-700' : 'text-gray-500'
                                                }`}>
                                                {formatTime(conversation.lastMessageTime)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs truncate flex-1 ${isTyping
                                                ? 'text-green-600 italic font-medium'
                                                : conversation.unreadCount > 0
                                                    ? 'text-gray-900 font-medium'
                                                    : 'text-gray-600'
                                            }`}>
                                            {isTyping ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="animate-pulse">{t('chat.typing') || 'Typing...'}</span>
                                                </span>
                                            ) : (
                                                conversation.lastMessage ||
                                                <span className="text-gray-400 italic">{t('chat.noMessages') || 'No messages'}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Unread Badge */}
                                {conversation.unreadCount > 0 && (
                                    <div className="flex-shrink-0">
                                        <div className="bg-green-600 text-white text-xs rounded-full min-w-[1.5rem] h-6 px-2 flex items-center justify-center font-medium shadow-sm">
                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer Stats */}
            {conversations.length > 0 && (
                <div className="p-3 bg-white border-t border-gray-200 mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {conversations.filter(c => c.unreadCount > 0).length} unread
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
