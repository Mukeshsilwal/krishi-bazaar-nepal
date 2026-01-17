import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../features/chat/hooks/useChat';
import { useUserDirectory } from '../features/chat/hooks/useUserDirectory';
import { ChatLayout } from '../features/chat/components/ChatLayout';
import { ConversationList } from '../features/chat/components/ConversationList';
import { UserDirectory } from '../features/chat/components/UserDirectory';
import { MessageArea } from '../features/chat/components/MessageArea';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, MessageSquare, Users } from 'lucide-react';
import { ChatUser } from '../features/chat/services/chatService';

export default function ChatPage() {
    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');

    const {
        conversations,
        activeConversation,
        messages,
        selectConversation,
        startConversation,
        sendMessage,
        sendTyping,
        isLoadingConversations,
        isLoadingMessages,
        loadMoreMessages,
        hasMore,
        onlineUsers,
        typingUsers
    } = useChat();

    const {
        users,
        isLoading: isLoadingUsers,
        handleSearch,
        handleFilterRole
    } = useUserDirectory();

    useEffect(() => {
        if (userId) {
            startConversation(userId);
        } else if (location.state?.targetUser) {
            startConversation(location.state.targetUser.id);
        }
    }, [userId, location.state, startConversation]);

    useEffect(() => {
        if (!userId && !activeConversation && conversations.length > 0 && !isLoadingConversations) {
            if (window.innerWidth >= 768) {
                selectConversation(conversations[0]);
            }
        }
    }, [conversations, activeConversation, userId, isLoadingConversations, selectConversation]);

    const handleBack = () => {
        if (userId) {
            navigate('/chat');
        } else {
            navigate('/chat');
        }
    };

    const handleUserSelect = (user: ChatUser) => {
        if (user.conversationId) {
            const existingConv = conversations.find(c => c.id === user.conversationId);
            if (existingConv) {
                selectConversation(existingConv);
                setActiveTab('conversations');
                return;
            }
        }

        startConversation(user.userId);
        setActiveTab('conversations');
    };

    const showSidebarOnMobile = !activeConversation;

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    return (
        <ChatLayout
            showSidebarOnMobile={showSidebarOnMobile}
            sidebar={
                <div className="flex flex-col h-full bg-white">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageCircle className="text-green-600" size={24} />
                            {t('chat.title') || 'Messages'}
                        </h2>

                        {/* Tab Switcher */}
                        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setActiveTab('conversations')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-medium transition-all ${activeTab === 'conversations'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <MessageSquare size={18} />
                                <span className="text-sm">{t('chat.conversations') || 'Chats'}</span>
                                {totalUnread > 0 && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'conversations'
                                            ? 'bg-green-700 text-white'
                                            : 'bg-red-500 text-white'
                                        }`}>
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-medium transition-all ${activeTab === 'users'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Users size={18} />
                                <span className="text-sm">{t('chat.allUsers') || 'Users'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'conversations' ? (
                        <ConversationList
                            conversations={conversations}
                            activeConversationId={activeConversation?.id}
                            onSelect={(c) => {
                                selectConversation(c);
                            }}
                            onlineUsers={onlineUsers}
                            typingUsers={typingUsers}
                            isLoading={isLoadingConversations}
                        />
                    ) : (
                        <UserDirectory
                            users={users}
                            onSelect={handleUserSelect}
                            isLoading={isLoadingUsers}
                            onSearch={handleSearch}
                            onFilterRole={handleFilterRole}
                        />
                    )}
                </div>
            }
            main={
                activeConversation ? (
                    <MessageArea
                        conversation={activeConversation}
                        messages={messages}
                        onSendMessage={sendMessage}
                        onTyping={sendTyping}
                        isTyping={!!typingUsers[activeConversation.userId]}
                        isOnline={!!onlineUsers[activeConversation.userMobile]}
                        onBack={handleBack}
                        hasMore={hasMore}
                        onLoadMore={loadMoreMessages}
                        isLoadingMore={isLoadingMessages}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
                        <div className="text-center max-w-md px-6">
                            <div className="bg-white p-8 rounded-2xl shadow-lg inline-block mb-6">
                                <MessageCircle size={64} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t('chat.welcome') || 'Welcome to Kisan Chat'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t('chat.selectConversation') || 'Select a conversation to start messaging'}
                            </p>
                            <div className="flex flex-col gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Real-time messaging</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Online status tracking</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Message read receipts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        />
    );
}
