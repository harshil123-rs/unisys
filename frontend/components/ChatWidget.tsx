'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Paperclip, Bot, User, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hello! I am LogiMind. Ask me anything about your logistics, SOPs, or upload a document to analyze.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'ai', content: `✅ Successfully uploaded and analyzed **${file.name}**. You can now ask questions about it!` }]);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: '❌ Failed to upload document.' }]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50",
                    isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                )}
            >
                <MessageSquare size={24} />
            </button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-6 right-6 w-[400px] h-[600px] bg-black/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-all z-50 backdrop-blur-xl",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-10 pointer-events-none"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Bot size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">LogiMind AI</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'ai' ? "bg-blue-600/20 text-blue-400" : "bg-white/10 text-gray-300"
                            )}>
                                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm",
                                msg.role === 'ai'
                                    ? "bg-white/5 text-gray-200 rounded-tl-none"
                                    : "bg-blue-600 text-white rounded-tr-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/50 rounded-b-2xl">
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.txt,.md"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Upload Document"
                        >
                            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about shipments, SOPs..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
