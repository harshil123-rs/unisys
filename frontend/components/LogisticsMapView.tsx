'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Clock, Package, Bot, AlertTriangle, FileText, Mic, Layers, Filter, Bell, ArrowLeft } from 'lucide-react';
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

export default function LogisticsMapView() {
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showTraffic, setShowTraffic] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'details'>('map');

    // Mock data for the detailed view
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

    // Fetch all shipments on mount
    useEffect(() => {
        const fetchShipments = async () => {
            const { data, error } = await supabase
                .from('shipments')
                .select('*');

            if (data) {
                // Transform data for MapComponent
                const transformedData = data.map(s => ({
                    ...s,
                    position: [s.lat, s.lng],
                    statusColor: s.status === 'Delayed' ? 'red' : s.status === 'In Transit' ? 'green' : 'gold',
                    route: [] // Route generation can be added here if needed
                }));
                setShipments(transformedData);
            }
            setLoading(false);
        };
        fetchShipments();
    }, []);

    const filteredShipments = useMemo(() => {
        if (activeFilter === 'All') return shipments;
        return shipments.filter(s => s.status === activeFilter);
    }, [shipments, activeFilter]);

    const handleSearch = () => {
        if (!searchQuery) return;
        const found = shipments.find(s => s.id.toLowerCase().includes(searchQuery.toLowerCase()));
        if (found) {
            // Generate route for the found shipment if needed (mock logic)
            const shipmentWithRoute = {
                ...found,
                route: found.origin_lat && found.dest_lat ? generateCurvedRoute([found.origin_lat, found.origin_lng], [found.dest_lat, found.dest_lng]) : []
            };
            setSelectedShipment(shipmentWithRoute);
            setViewMode('details');
        } else {
            alert('Shipment not found');
        }
    };

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

    if (viewMode === 'details' && selectedShipment) {
        return (
            <div className="flex flex-col h-full space-y-6 p-6 overflow-y-auto bg-black">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setViewMode('map');
                                setSelectedShipment(null);
                                setSearchQuery('');
                            }}
                            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Track Shipment</h1>
                            <p className="text-gray-400">Real-time AI-powered tracking dashboard.</p>
                        </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipment Status Card */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <div className="text-sm text-gray-400">Shipment ID</div>
                                    <div className="text-3xl font-bold text-white">{selectedShipment.id}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedShipment.status === 'Delayed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    ● {selectedShipment.status}
                                </span>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Origin</div>
                                    <div className="text-white font-medium">{selectedShipment.origin || mockDetails.origin}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Destination</div>
                                    <div className="text-white font-medium">{selectedShipment.destination || mockDetails.destination}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Clock size={12} /> Predictive Delivery</div>
                                    <div className="text-white font-medium">{selectedShipment.eta || mockDetails.eta}</div>
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
                                shipments={selectedShipment ? [selectedShipment] : []}
                                selectedShipment={selectedShipment}
                                onSelectShipment={() => { }}
                                layers={{ heatmap: false, traffic: false }}
                                focusedLocation={selectedShipment ? { lat: selectedShipment.lat, lng: selectedShipment.lng } : null}
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
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    shipments={filteredShipments}
                    selectedShipment={selectedShipment}
                    onSelectShipment={setSelectedShipment}
                    layers={{ heatmap: showHeatmap, traffic: showTraffic }}
                    focusedLocation={selectedShipment ? { lat: selectedShipment.lat, lng: selectedShipment.lng } : null}
                />
            </div>

            {/* Top Left: Search & Controls */}
            <div className="absolute top-6 left-6 z-10 w-80 space-y-4">
                {/* City Search (Visual Only for now) */}
                <div className="relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-l-lg"></div>
                    <input
                        type="text"
                        placeholder="Search city or address..."
                        className="w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-md text-white">
                        <Search size={16} />
                    </button>
                </div>

                {/* Shipment ID Search */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter Shipment ID (e.g. TN88912)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-lg font-bold text-sm tracking-wide"
                    >
                        TRACK
                    </button>
                </div>

                {/* Voice Search */}
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
                    <Mic size={20} />
                    <span className="font-medium">Voice Search Shipment</span>
                </button>
                <p className="text-xs text-gray-500 text-center">Try saying "Where is shipment TN88912?"</p>

                {/* Filters & Layers Panel */}
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-4">
                    {/* Filters */}
                    <div>
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                            <Filter size={16} /> Filters
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'In Transit', 'Delayed', 'Delivered'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === filter
                                            ? 'bg-white text-black'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/10"></div>

                    {/* Layers */}
                    <div>
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                            <Layers size={16} /> Layers
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showHeatmap ? 'bg-blue-500 border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                    {showHeatmap && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
                                <span className="text-sm text-gray-300 group-hover:text-white">AI Delay Heatmap</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showTraffic ? 'bg-blue-500 border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                    {showTraffic && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={showTraffic} onChange={(e) => setShowTraffic(e.target.checked)} />
                                <span className="text-sm text-gray-300 group-hover:text-white">Live Traffic Overlay</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Region Alerts */}
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                        <AlertTriangle size={16} /> Region Alerts
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="text-red-400 text-xs font-bold">North India</div>
                            <div className="text-gray-400 text-[10px]">High congestion at Delhi Hub (15-18 Dec)</div>
                        </div>
                        <div>
                            <div className="text-orange-400 text-xs font-bold">Western Zone</div>
                            <div className="text-gray-400 text-[10px]">2 carriers reporting backlog</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
