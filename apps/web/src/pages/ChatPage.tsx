import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatPage() {
    const { userId } = useParams();
    const { conversations, messages, sendMessage, sendTyping, onlineUsers, typingUsers, loading } = useMessages(userId);
    const { t } = useLanguage();
    const { user } = useAuth();
    const [messageText, setMessageText] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(userId || null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]); // Scroll when message added or typing status changes

    useEffect(() => {
        if (userId) {
            setSelectedConversation(userId);
        }
    }, [userId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;

        try {
            await sendMessage({
                receiverId: selectedConversation,
                message: messageText,
            });
            setMessageText('');
        } catch (err) {
            alert('Failed to send message');
        }
    };

    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        if (selectedConversation && e.target.value.length > 0) {
            sendTyping(selectedConversation);
        }
    }

    // Ensure conversations and messages are always arrays
    const conversationsArray = Array.isArray(conversations) ? conversations : [];
    const messagesArray = Array.isArray(messages) ? messages : [];
    const selectedUser = conversationsArray.find((c) => c.userId === selectedConversation);
    const isSelectedUserOnline = selectedUser ? onlineUsers[selectedUser.userMobile] : false;

    return (
        <div className="bg-gray-50 flex flex-col h-[calc(100vh-64px)]">
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow h-full flex overflow-hidden">
                    {/* Conversations Sidebar */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('chat.conversations') || 'Conversations'}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading && conversationsArray.length === 0 ? (
                                <div className="p-4 text-center text-gray-600">Loading...</div>
                            ) : conversationsArray.length === 0 ? (
                                <div className="p-4 text-center text-gray-600">
                                    <MessageCircle className="mx-auto mb-2" size={48} />
                                    <p>{t('chat.noConversations') || 'No conversations yet'}</p>
                                </div>
                            ) : (
                                conversationsArray.map((conversation) => (
                                    <button
                                        key={conversation.userId}
                                        onClick={() => setSelectedConversation(conversation.userId)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${selectedConversation === conversation.userId
                                            ? 'bg-green-50'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                                    {conversation.userName?.charAt(0) || '?'}
                                                </div>
                                                {onlineUsers[conversation.userMobile] && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Online" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {conversation.userName || 'Unknown User'}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {typingUsers[conversation.userId] ?
                                                        <span className="text-green-600 italic">Typing...</span> :
                                                        (conversation.lastMessage || 'No messages')}
                                                </p>
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <div className="bg-green-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                    {conversation.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                                {selectedUser?.userName?.charAt(0) || '?'}
                                            </div>
                                            {isSelectedUserOnline && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {selectedUser?.userName || 'Unknown User'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {typingUsers[selectedConversation] ?
                                                    <span className="text-green-600 italic">Typing...</span> :
                                                    (isSelectedUserOnline ? 'Online' : (selectedUser?.role || 'User'))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesArray.map((message) => {
                                        const isMine = message.senderId === user?.id;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isMine ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMine
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p>{message.message}</p>
                                                        {isMine && (
                                                            <div className="flex-shrink-0">
                                                                {message.isRead ? (
                                                                    <div className="text-green-200" title="Read">
                                                                        {/* Double Check Icon */}
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M18 6L7 17l-5-5"></path>
                                                                            <path d="m22 10-7.5 7.5L13 16"></path>
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-300" title="Sent">
                                                                        {/* Single Check Icon */}
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M20 6 9 17l-5-5"></path>
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p
                                                        className={`text-xs mt-1 ${isMine
                                                            ? 'text-green-100'
                                                            : 'text-gray-600'
                                                            }`}
                                                    >
                                                        {new Date(message.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {typingUsers[selectedConversation] && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs italic">
                                                Typing...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-4 border-t border-gray-200 bg-white"
                                >
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={handleInputChange}
                                            placeholder={
                                                t('chat.typeMessage') || 'Type a message...'
                                            }
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageText.trim()}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Send size={20} />
                                            {t('chat.send') || 'Send'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-600">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto mb-4" size={64} />
                                    <p className="text-lg">
                                        {t('chat.selectConversation') ||
                                            'Select a conversation to start chatting'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
