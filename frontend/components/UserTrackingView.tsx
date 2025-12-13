'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Clock, Package, Bot, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../lib/supabase';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./map/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
            Loading Map...
        </div>
    ),
});

export default function UserTrackingView({ userId }: { userId?: string | null }) {
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [shipmentData, setShipmentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Mock data for the detailed view (to match Image 2 style)
    // In a real app, this would come from the database
    const mockDetails = {
        origin: 'Pune, MH',
        destination: 'Ahmedabad, GJ',
        eta: '14 Dec, 02:34 AM',
        confidence: '78%',
        status: 'Delayed',
        risk: {
            weather: 24,
            congestion: 31
        },
        timeline: [
            { status: 'In Transit', date: 'Dec 14', active: true },
            { status: 'Out for Delivery', date: 'Dec 15', active: false },
            { status: 'Delivered', date: 'Dec 15', active: false }
        ]
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);

        // Fetch shipment from DB
        const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', searchQuery)
            .single();

        if (data) {
            // Transform data for MapComponent
            const transformedData = {
                ...data,
                position: [data.lat, data.lng],
                statusColor: data.status === 'Delayed' ? 'red' : data.status === 'In Transit' ? 'green' : 'gold',
                // Add route if available or generate curve
                route: [] // We can add route generation logic here if needed, or leave empty for now
            };

            // Add route generation logic similar to previous implementation
            if (data.origin_lat && data.dest_lat) {
                // Helper to generate a curved path (Quadratic Bezier) for simulation
                const generateCurvedRoute = (start: [number, number], end: [number, number]) => {
                    if (!start[0] || !end[0]) return [[0, 0], [0, 0]];

                    const points: [number, number][] = [];
                    const steps = 50;

                    const midLat = (start[0] + end[0]) / 2;
                    const midLng = (start[1] + end[1]) / 2;

                    const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
                    const offset = dist * 0.2;

                    const controlPoint = [midLat + offset, midLng + offset];

                    for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        const lat = Math.pow(1 - t, 2) * start[0] + 2 * (1 - t) * t * controlPoint[0] + Math.pow(t, 2) * end[0];
                        const lng = Math.pow(1 - t, 2) * start[1] + 2 * (1 - t) * t * controlPoint[1] + Math.pow(t, 2) * end[1];
                        points.push([lat, lng]);
                    }
                    return points;
                };

                transformedData.route = generateCurvedRoute([data.origin_lat, data.origin_lng], [data.dest_lat, data.dest_lng]);
            }

            setShipmentData(transformedData);
            setSelectedShipment(transformedData); // For the map
        } else {
            alert('Shipment not found');
            setShipmentData(null);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full space-y-6 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Track Shipment</h1>
                    <p className="text-gray-400">Real-time AI-powered tracking dashboard.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="TN88995"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 w-64"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Track
                    </button>
                </div>
            </div>

            {shipmentData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipment Status Card */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <div className="text-sm text-gray-400">Shipment ID</div>
                                    <div className="text-3xl font-bold text-white">{shipmentData.id}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${shipmentData.status === 'Delayed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    ● {shipmentData.status}
                                </span>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Origin</div>
                                    <div className="text-white font-medium">{shipmentData.origin || mockDetails.origin}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Destination</div>
                                    <div className="text-white font-medium">{shipmentData.destination || mockDetails.destination}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Clock size={12} /> Predictive Delivery</div>
                                    <div className="text-white font-medium">{shipmentData.eta || mockDetails.eta}</div>
                                    <div className="text-xs text-green-500">Confidence: {mockDetails.confidence}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Section */}
                        <Card className="bg-white/5 border-white/10 h-[400px] overflow-hidden relative">
                            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-gray-300">
                                Live Route View
                            </div>
                            <MapComponent
                                shipments={shipmentData ? [shipmentData] : []}
                                selectedShipment={shipmentData}
                                onSelectShipment={() => { }}
                                layers={{ heatmap: false, traffic: false }}
                                focusedLocation={shipmentData ? { lat: shipmentData.lat, lng: shipmentData.lng } : null}
                            />
                        </Card>

                        {/* Timeline */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                    <Package size={20} className="text-blue-500" /> Shipment Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockDetails.timeline.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className={`w-4 h-4 rounded-full border-2 ${item.active ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}></div>
                                            <div className="flex-1">
                                                <div className="text-white font-medium">{item.status}</div>
                                            </div>
                                            <div className="text-sm text-gray-500">{item.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* AI Insights */}
                        <Card className="bg-blue-900/20 border-blue-500/30">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-blue-400 flex items-center gap-2">
                                    <Bot size={20} /> AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                    <div className="text-green-400 font-medium text-sm">On Schedule</div>
                                    <div className="text-gray-400 text-xs mt-1">Shipment moving efficiently.</div>
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                    Ask AI about this shipment →
                                </button>
                            </CardContent>
                        </Card>

                        {/* Risk Analysis */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-yellow-500" /> Risk Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Weather Impact</span>
                                        <span className="text-green-400">{mockDetails.risk.weather}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[24%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Route Congestion</span>
                                        <span className="text-yellow-400">{mockDetails.risk.congestion}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[31%]"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                    <FileText size={20} className="text-purple-500" /> Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm text-gray-300 flex items-center justify-center gap-2 transition-colors">
                                    <FileText size={14} /> Invoice
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm text-gray-300 flex items-center justify-center gap-2 transition-colors">
                                    <FileText size={14} /> Label
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Enter a shipment ID to track</p>
                </div>
            )}
        </div>
    );
}
