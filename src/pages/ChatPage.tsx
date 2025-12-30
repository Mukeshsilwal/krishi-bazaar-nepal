import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useMessages } from '../hooks/useMessages';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatPage() {
    const { userId } = useParams();
    const { conversations, messages, sendMessage, loading } = useMessages(userId);
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
    }, [messages]);

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

    const selectedUser = conversations.find((c) => c.userId === selectedConversation);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex overflow-hidden">
                    {/* Conversations Sidebar */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('chat.conversations') || 'Conversations'}
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading && conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-600">Loading...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-600">
                                    <MessageCircle className="mx-auto mb-2" size={48} />
                                    <p>{t('chat.noConversations') || 'No conversations yet'}</p>
                                </div>
                            ) : (
                                conversations.map((conversation) => (
                                    <button
                                        key={conversation.userId}
                                        onClick={() => setSelectedConversation(conversation.userId)}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${selectedConversation === conversation.userId
                                                ? 'bg-green-50'
                                                : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                                {conversation.userName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {conversation.userName || 'Unknown User'}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conversation.lastMessage || 'No messages'}
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
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                            {selectedUser?.userName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {selectedUser?.userName || 'Unknown User'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedUser?.role || 'User'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message) => {
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
                                                    <p>{message.message}</p>
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
                                            onChange={(e) => setMessageText(e.target.value)}
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

            <Footer />
        </div>
    );
}
