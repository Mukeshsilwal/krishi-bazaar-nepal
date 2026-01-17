import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, Conversation } from '../services/chatService';
import { Send, Image as ImageIcon, Paperclip } from 'lucide-react';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

interface MessageAreaProps {
    conversation: Conversation;
    messages: ChatMessage[];
    onSendMessage: (text: string, type?: 'TEXT' | 'IMAGE' | 'FILE', fileDetails?: any) => void;
    onTyping: () => void;
    isTyping: boolean;
    isOnline: boolean;
    onBack?: () => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

export const MessageArea: React.FC<MessageAreaProps> = ({
    conversation,
    messages,
    onSendMessage,
    onTyping,
    isTyping,
    isOnline,
    onBack,
    hasMore,
    onLoadMore,
    isLoadingMore
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const previousMessagesLengthRef = useRef(messages.length);
    const userScrolledUpRef = useRef(false);
    const isInitialLoadRef = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Check if user is at the bottom of the chat
    const isAtBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return true;

        const threshold = 150; // Increased threshold for better detection
        const position = container.scrollHeight - container.scrollTop - container.clientHeight;
        return position < threshold;
    };

    // Handle scroll to detect if user scrolled up
    const handleScroll = () => {
        if (!isInitialLoadRef.current) {
            userScrolledUpRef.current = !isAtBottom();
        }
    };

    // Scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });
        });
    };

    // Smart auto-scroll logic - only for new messages
    useEffect(() => {
        const messagesIncreased = messages.length > previousMessagesLengthRef.current;
        const isNewMessage = messagesIncreased && !isLoadingMore;

        if (isNewMessage && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const isOwnMessage = lastMessage?.senderId === user?.id;

            // Auto-scroll only if:
            // 1. User sent the message (always scroll for own messages)
            if (isOwnMessage) {
                userScrolledUpRef.current = false; // Reset scroll state
                setTimeout(() => scrollToBottom('smooth'), 50);
            }
            // 2. User is at the bottom (scroll for received messages)
            else if (!userScrolledUpRef.current) {
                setTimeout(() => scrollToBottom('smooth'), 50);
            }
        }

        previousMessagesLengthRef.current = messages.length;
    }, [messages.length, isLoadingMore, user?.id]); // Only depend on length, not entire messages array

    // Scroll to bottom when conversation changes (initial load)
    useEffect(() => {
        isInitialLoadRef.current = true;
        userScrolledUpRef.current = false;

        setTimeout(() => {
            scrollToBottom('auto');
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 300);
        }, 100);
    }, [conversation.id]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        onSendMessage(text);
        setText('');
        // Scroll will happen automatically via useEffect when message is added
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (e.target.value) onTyping();
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return;
        }

        // Validate file type for images
        if (type === 'image' && !file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Clear file selection
    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    // Send file message
    const handleSendFile = async () => {
        if (!selectedFile || !conversation) return;

        setIsUploading(true);
        try {
            // Upload file to server
            const { chatService } = await import('../services/chatService');
            const uploadResult = await chatService.uploadFile(selectedFile, conversation.id);

            // Send message with file info
            const fileMessage = `📎 ${uploadResult.fileName}`;
            onSendMessage(
                fileMessage,
                selectedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE',
                uploadResult
            );

            clearFile();
        } catch (error) {
            console.error('Failed to send file:', error);
            alert('Failed to send file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm z-10">
                {onBack && (
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                )}
                <div className="relative">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                        {conversation.userName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{conversation.userName || t('chat.unknownUser') || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">
                        {isTyping ?
                            <span className="text-green-600 font-medium italic">{t('chat.typing') || 'Typing...'}</span> :
                            (isOnline ? (t('chat.online') || 'Online') : (t('chat.offline') || 'Offline'))
                        }
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
                {hasMore && (
                    <div className="flex justify-center py-2">
                        <button
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                            className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                        >
                            {isLoadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    const isImage = msg.type === 'IMAGE' && msg.fileUrl;
                    const isFile = msg.type === 'FILE' && msg.fileUrl;

                    if (msg.type === 'IMAGE' || msg.type === 'FILE') {
                        console.log('Rendering Message:', {
                            id: msg.id,
                            type: msg.type,
                            fileUrl: msg.fileUrl,
                            fileName: msg.fileName,
                            isImage,
                            isFile
                        });
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl shadow-sm ${isMine ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                }`}>
                                {/* Image Message */}
                                {isImage ? (
                                    <div className="p-2">
                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={msg.fileUrl}
                                                alt={msg.fileName || 'Image'}
                                                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
                                            />
                                        </a>
                                        {msg.message && msg.message !== `📎 ${msg.fileName}` && (
                                            <p className="mt-2 text-sm">{msg.message}</p>
                                        )}
                                    </div>
                                ) : isFile ? (
                                    /* File Message */
                                    <div className="p-3">
                                        <a
                                            href={msg.fileUrl}
                                            download={msg.fileName}
                                            className={`flex items-center gap-3 ${isMine ? 'text-white hover:text-green-100' : 'text-gray-900 hover:text-green-600'} transition`}
                                        >
                                            <div className={`p-2 rounded-lg ${isMine ? 'bg-green-700' : 'bg-gray-100'}`}>
                                                <Paperclip size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{msg.fileName || 'File'}</p>
                                                {msg.fileSize && (
                                                    <p className={`text-xs ${isMine ? 'text-green-100' : 'text-gray-500'}`}>
                                                        {(msg.fileSize / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`text-xs ${isMine ? 'text-green-100' : 'text-gray-500'}`}>
                                                Download
                                            </div>
                                        </a>
                                    </div>
                                ) : (
                                    /* Text Message */
                                    <div className="px-4 py-2">
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.message}</p>
                                    </div>
                                )}

                                {/* Timestamp and Status */}
                                <div className={`px-4 pb-2 text-[10px] text-right ${isMine ? 'text-green-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMine && (
                                        <span className="ml-1 inline-flex items-end">
                                            {msg.status === 'SEEN' || msg.isRead ? (
                                                <span className="text-blue-200">✓✓</span>
                                            ) : msg.status === 'DELIVERED' ? (
                                                <span className="text-gray-300">✓✓</span>
                                            ) : (
                                                <span className="text-gray-300">✓</span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-full rounded-bl-none text-xs italic animate-pulse">
                            {t('chat.typing') || 'Typing...'}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-gray-200 bg-white">
                {/* File Preview */}
                {selectedFile && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start gap-3">
                            {filePreview ? (
                                <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                            ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Paperclip size={32} className="text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleSendFile}
                                        disabled={isUploading}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isUploading ? 'Sending...' : 'Send'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Bar */}
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        {/* Hidden file inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="*/*"
                            onChange={(e) => handleFileSelect(e, 'file')}
                            className="hidden"
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'image')}
                            className="hidden"
                        />

                        {/* File button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                            title="Attach file"
                        >
                            <Paperclip size={20} />
                        </button>

                        {/* Image button */}
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                            title="Attach image"
                        >
                            <ImageIcon size={20} />
                        </button>

                        {/* Text input */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={text}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chat.typeMessage') || 'Type a message...'}
                                className="w-full px-4 py-2 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                            />
                        </div>

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            <Send size={20} className="ml-0.5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
