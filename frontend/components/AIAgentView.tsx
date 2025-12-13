'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Paperclip,
    Bot,
    User,
    FileText,
    Loader2,
    Trash2,
    Sparkles,
    BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useLanguage } from '@/context/LanguageContext';

export default function AIAgentView() {
    const { language } = useLanguage();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hello! I am LogiMind, your advanced logistics AI agent. I can analyze SOPs, track shipments, and answer complex queries. Upload a document or ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text?: string) => {
        const userMsg = text || input;
        if (!userMsg.trim()) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg, language }) // Pass language here
            });
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setMessages(prev => [...prev, { role: 'ai', content: data.answer || "I'm not sure how to respond to that." }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message || 'Something went wrong.'}` }]);
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
                setUploadedFiles(prev => [...prev, file.name]);
                setMessages(prev => [...prev, { role: 'ai', content: `✅ I have analyzed **${file.name}**. You can now ask questions about its content.` }]);
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'ai', content: `❌ Failed to upload document: ${error.message}` }]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex h-full gap-6 animate-in fade-in duration-500">
            {/* Left Sidebar: Knowledge Base */}
            <div className="w-80 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-blue-400">
                    <BrainCircuit size={24} />
                    <h2 className="font-bold text-lg">Knowledge Base</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Uploaded Documents</p>
                    {uploadedFiles.length === 0 && (
                        <div className="text-center p-4 border border-dashed border-white/10 rounded-lg text-gray-500 text-sm">
                            No documents uploaded yet.
                        </div>
                    )}
                    {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 group">
                            <FileText size={16} className="text-blue-400" />
                            <span className="text-sm text-gray-300 truncate flex-1">{file}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {/* Document Upload */}
                    <div>
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
                            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                            {uploading ? 'Analyzing...' : 'Upload Document'}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            PDF, TXT, MD (Max 10MB)
                        </p>
                    </div>

                    {/* CSV Smart Import */}
                    <div>
                        <input
                            type="file"
                            id="csvInput"
                            className="hidden"
                            accept=".csv"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                    const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
                                    if (session) formData.append('userId', session.user.id);

                                    setMessages(prev => [...prev, { role: 'ai', content: `🔄 **Smart Import:** Analyzing ${file.name} to map columns and import data...` }]);

                                    const res = await fetch('http://localhost:8080/api/bookings/smart-upload', {
                                        method: 'POST',
                                        body: formData
                                    });
                                    const data = await res.json();

                                    if (res.ok) {
                                        setMessages(prev => [...prev, { role: 'ai', content: `✅ **Success!** Imported ${data.count} shipments from ${file.name}. You can view them in the dashboard.` }]);
                                    } else {
                                        throw new Error(data.error);
                                    }
                                } catch (err: any) {
                                    setMessages(prev => [...prev, { role: 'ai', content: `❌ **Import Failed:** ${err.message}` }]);
                                } finally {
                                    setUploading(false);
                                    (document.getElementById('csvInput') as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('csvInput')?.click()}
                            disabled={uploading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                            Smart CSV Import
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">
                            AI Auto-Mapping
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl flex flex-col overflow-hidden relative">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">LogiMind Agent</h3>
                            <p className="text-xs text-blue-400">Powered by OpenAI GPT-4o</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-4 max-w-3xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                                msg.role === 'ai' ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white" : "bg-white/10 text-gray-300"
                            )}>
                                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-md",
                                msg.role === 'ai'
                                    ? "bg-white/5 text-gray-200 rounded-tl-none border border-white/5"
                                    : "bg-blue-600 text-white rounded-tr-none"
                            )}>
                                {(msg.content || '').split('\n').map((line, j) => (
                                    <p key={j} className="mb-1 last:mb-0">{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4 max-w-3xl mx-auto">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/10 bg-black/20">
                    <div className="max-w-3xl mx-auto relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about shipment delays, compliance rules, or upload a file..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-lg"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-3">
                        LogiMind can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>

            {/* Right Sidebar: Suggested Questions */}
            <div className="w-72 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col hidden xl:flex">
                <div className="flex items-center gap-2 mb-6 text-purple-400">
                    <Sparkles size={24} />
                    <h2 className="font-bold text-lg">Suggested</h2>
                </div>
                <div className="space-y-3 overflow-y-auto">
                    {[
                        "What documents are needed for a battery shipment?",
                        "How should I pack fragile items?",
                        "What are the new compliance updates for hazardous goods?",
                        "Explain SOP for cold-chain handling.",
                        "What are common errors in export shipping?",
                        "Where is shipment TN88912?",
                        "Give me delay prediction for Delhi routes."
                    ].map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all text-sm text-gray-300 hover:text-white"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
