'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, Package, MapPin, Calendar, Truck, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ApprovalsView() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'bookings' | 'requests'>('bookings');

    const fetchPendingItems = async () => {
        setLoading(true);
        try {
            // Fetch Bookings
            const bookingsRes = await fetch('http://localhost:8080/api/bookings/pending');
            const bookingsData = await bookingsRes.json();
            if (Array.isArray(bookingsData)) setBookings(bookingsData);

            // Fetch Requests
            const requestsRes = await fetch('http://localhost:8080/api/requests/pending');
            const requestsData = await requestsRes.json();
            if (Array.isArray(requestsData)) setRequests(requestsData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !confirm('Reject this booking?')) return;
        setProcessingId(bookingId);
        try {
            const url = action === 'approve' ? 'http://localhost:8080/api/bookings/approve' : 'http://localhost:8080/api/bookings/reject';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });
            const result = await response.json();
            if (result.success) {
                setBookings(prev => prev.filter(b => b.id !== bookingId));
                alert(`Booking ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
            } else {
                alert('Action failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !confirm('Reject this request?')) return;
        setProcessingId(requestId);
        try {
            const url = action === 'approve' ? 'http://localhost:8080/api/requests/approve' : 'http://localhost:8080/api/requests/reject';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            const result = await response.json();
            if (result.success) {
                setRequests(prev => prev.filter(r => r.id !== requestId));
                alert(`Request ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
            } else {
                alert('Action failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-500 mt-10">Loading pending items...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Approvals & Requests</h2>
                <p className="text-gray-400">
                    Manage booking approvals and return/cancellation requests.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Bookings ({bookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Return/Cancel Requests ({requests.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'bookings' ? (
                bookings.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No pending bookings.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="bg-black/40 border-white/10 hover:bg-white/5 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Package className="text-blue-500" size={20} />
                                                {booking.item_type} Shipment
                                            </h3>
                                            <p className="text-sm text-gray-400">{booking.description}</p>
                                            <div className="text-sm text-gray-300 grid grid-cols-2 gap-2 mt-2">
                                                <span>From: {booking.pickup_address}</span>
                                                <span>To: {booking.delivery_address}</span>
                                                <span>Carrier: {booking.carrier}</span>
                                                <span>Price: ₹{booking.estimated_price}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 justify-center min-w-[120px]">
                                            <button
                                                onClick={() => handleBookingAction(booking.id, 'approve')}
                                                disabled={!!processingId}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleBookingAction(booking.id, 'reject')}
                                                disabled={!!processingId}
                                                className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 px-4 py-2 rounded text-sm font-medium"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                requests.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No pending requests.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {requests.map((req) => (
                            <Card key={req.id} className="bg-black/40 border-white/10 hover:bg-white/5 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                {req.request_type === 'return' ? <RotateCcw className="text-blue-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                                                {req.request_type === 'return' ? 'Return Request' : 'Cancellation Request'}
                                            </h3>
                                            <div className="bg-white/5 p-3 rounded border border-white/10">
                                                <p className="text-sm text-gray-300"><span className="text-gray-500">Shipment ID:</span> {req.shipment_id}</p>
                                                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Reason:</span> {req.reason}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">Requested on: {new Date(req.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 justify-center min-w-[120px]">
                                            <button
                                                onClick={() => handleRequestAction(req.id, 'approve')}
                                                disabled={!!processingId}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(req.id, 'reject')}
                                                disabled={!!processingId}
                                                className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 px-4 py-2 rounded text-sm font-medium"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
