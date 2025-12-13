'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, XCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReturnCancelView({ userId }: { userId?: string | null }) {
    const [shipmentId, setShipmentId] = useState('');
    const [requestType, setRequestType] = useState<'return' | 'cancel'>('return');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (userId) {
            fetchHistory(userId);
        }
    }, [userId]);

    const fetchHistory = async (uid: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/user/${uid}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/requests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    shipmentId,
                    requestType,
                    reason
                })
            });
            const result = await response.json();

            if (result.success) {
                alert('Request submitted successfully!');
                setShipmentId('');
                setReason('');
                fetchHistory(userId);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Return & Cancel Orders</h2>
                <p className="text-gray-400">
                    Submit requests to return or cancel your shipments. All requests are subject to approval.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Request Form */}
                <Card className="bg-black/40 border-white/10 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                            <AlertTriangle size={20} className="text-yellow-500" /> Submit Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Shipment ID</label>
                                <input
                                    type="text"
                                    value={shipmentId}
                                    onChange={(e) => setShipmentId(e.target.value)}
                                    placeholder="e.g., TN123456"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Request Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRequestType('return')}
                                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${requestType === 'return' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <RotateCcw size={20} />
                                        <span className="text-sm font-medium">Return Order</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRequestType('cancel')}
                                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${requestType === 'cancel' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <XCircle size={20} />
                                        <span className="text-sm font-medium">Cancel Order</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please describe why you want to return or cancel this shipment..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Request History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Request History</h3>
                    {history.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 bg-white/5 rounded-lg border border-white/10">
                            No past requests found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((req) => (
                                <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${req.request_type === 'return' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {req.request_type}
                                            </span>
                                            <span className="text-sm font-medium text-white">{req.shipment_id}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-1">{req.reason}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        {req.status === 'pending' && <span className="flex items-center gap-1 text-yellow-500 text-xs"><Clock size={14} /> Pending</span>}
                                        {req.status === 'approved' && <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle2 size={14} /> Approved</span>}
                                        {req.status === 'rejected' && <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={14} /> Rejected</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
