'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BulkUploadView() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch logs on mount
    React.useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
            .from('upload_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setLogs(data);
            processChartData(data);
        }
    };

    const processChartData = (logs: any[]) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const volumeMap: Record<string, number> = {};
        days.forEach(d => volumeMap[d] = 0);

        logs.forEach(log => {
            const date = new Date(log.created_at);
            const dayName = days[date.getDay()];
            volumeMap[dayName] += log.record_count;
        });

        const data = days.map(day => ({ name: day, value: volumeMap[day] }));
        setChartData(data);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('User not authenticated');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', session.user.id);

            const response = await fetch('http://localhost:8080/api/bookings/upload-csv', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(`Successfully uploaded ${result.count} shipments!`);
                setFile(null);
                fetchLogs(); // Refresh logs
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Bulk Shipment Upload</h2>
                <p className="text-gray-400">Upload CSV files to create multiple shipments. View your upload history below.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Upload Area */}
                <Card className="bg-white/5 border-white/10 col-span-1 lg:col-span-2">
                    <CardContent className="p-8">
                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />

                            {!file ? (
                                <>
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <UploadCloud size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">Drag & Drop your CSV here</h3>
                                    <p className="text-sm text-gray-400 mb-6">or click to browse files</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Select File
                                    </button>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Expected columns: pickup_address, delivery_address, weight, item_type, description, carrier, estimated_price
                                    </p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                        <FileText size={32} className="text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">{file.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setFile(null)}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <X size={16} /> Remove
                                        </button>
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <>Uploading...</>
                                            ) : (
                                                <>
                                                    <UploadCloud size={16} /> Upload Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {status === 'success' && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
                                <CheckCircle2 size={20} />
                                <span>{message}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                                <AlertCircle size={20} />
                                <span>{message}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: History & Stats */}
                <div className="space-y-6 col-span-1">
                    {/* Chart */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-400">Uploads this Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                {/* Use simple bars for now to avoid import issues if Recharts not fully set up in this file */}
                                <div className="flex items-end justify-between h-full gap-2 pt-4">
                                    {chartData.map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                            <div
                                                className="w-full bg-blue-500/20 hover:bg-blue-500/40 rounded-t transition-all relative group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                style={{ height: `${Math.max(10, (d.value / (Math.max(...chartData.map(x => x.value)) || 1)) * 100)}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {d.value} Records
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{d.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Logs */}
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-400">Recent Uploads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No uploads yet.</p>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                    <FileText size={14} className="text-green-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{log.filename}</p>
                                                    <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-300 whitespace-nowrap">
                                                {log.record_count} Recs
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
