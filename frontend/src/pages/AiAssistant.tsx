import React, { useState } from 'react';
import aiService from '../services/aiService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Bot, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AiAssistant = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([
        { type: 'bot', text: 'Namaste! I am your AI farming assistant. Ask me anything about crops, diseases, or market prices.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.getRecommendation(userMsg, user?.id);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response.recommendation,
                confidence: response.confidenceScore
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I am having trouble connecting to the server right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 p-8">
                <div className="max-w-2xl mx-auto border rounded-lg shadow-lg bg-white h-[600px] flex flex-col">
                    <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center gap-2">
                        <Bot className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Krishi AI Assistant</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-green-100 text-green-900 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <p>{msg.text}</p>
                                    {msg.confidence && (
                                        <p className="text-xs text-gray-500 mt-1 font-mono">Confidence: {(msg.confidence * 100).toFixed(1)}%</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                    <span className="text-sm text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition">
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 focus:outline-none focus:border-green-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AiAssistant;
