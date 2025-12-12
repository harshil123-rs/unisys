'use client';

import React from 'react';
import { Filter, AlertTriangle, Mic, Layers, Search, Loader2 } from 'lucide-react';
import { searchLocation } from '@/lib/googleMaps';
import { cn } from '@/lib/utils';

export default function MapSidebar({ filters, setFilters, layers, setLayers, onVoiceSearch, onLocationSelect }: any) {
    const [isListening, setIsListening] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searching, setSearching] = React.useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        const result = await searchLocation(searchQuery);
        setSearching(false);

        if (result) {
            onLocationSelect(result);
        } else {
            alert("Location not found");
        }
    };

    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice search is not supported in this browser.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Voice result:", transcript);
            // Check if it's a shipment query or location search
            if (transcript.toLowerCase().includes('shipment')) {
                onVoiceSearch(transcript);
            } else {
                // Treat as location search
                setSearchQuery(transcript);
                handleSearch({ preventDefault: () => { } } as any);
            }
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="absolute top-4 left-4 w-80 flex flex-col gap-4 z-[1000]">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-2 shadow-xl flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city or address..."
                    className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder-gray-500"
                />
                <button type="submit" disabled={searching} className="p-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 disabled:opacity-50">
                    {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
            </form>

            {/* Track by ID */}
            <form onSubmit={(e) => {
                e.preventDefault();
                // @ts-ignore
                const id = e.target.elements.shipmentId.value;
                if (id) onVoiceSearch(id); // Reusing onVoiceSearch as a generic search handler for now, or we can add a new prop
            }} className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-2 shadow-xl flex gap-2">
                <input
                    name="shipmentId"
                    type="text"
                    placeholder="Enter Shipment ID (e.g. TN88912)"
                    className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder-gray-500"
                />
                <button type="submit" className="px-3 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 text-xs font-bold uppercase tracking-wider">
                    Track
                </button>
            </form>

            {/* Voice Search */}
            <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl">
                <button
                    onClick={handleMicClick}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                >
                    <Mic size={20} />
                    {isListening ? "Listening..." : "Voice Search Shipment"}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                    Try saying "Where is shipment TN88912?"
                </p>
            </div>

            {/* Filters & Layers */}
            <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2 mb-3">
                        <Filter size={16} /> Filters
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'In Transit', 'Delayed', 'Delivered'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilters({ ...filters, status })}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                    filters.status === status
                                        ? "bg-white text-black border-white"
                                        : "bg-transparent text-gray-400 border-white/20 hover:border-white/50"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2 mb-3">
                        <Layers size={16} /> Layers
                    </h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={layers.heatmap}
                                onChange={(e) => setLayers({ ...layers, heatmap: e.target.checked })}
                                className="rounded border-gray-600 bg-gray-800 text-blue-600"
                            />
                            AI Delay Heatmap
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={layers.traffic}
                                onChange={(e) => setLayers({ ...layers, traffic: e.target.checked })}
                                className="rounded border-gray-600 bg-gray-800 text-blue-600"
                            />
                            Live Traffic Overlay
                        </label>
                    </div>
                </div>
            </div>

            {/* Region Alerts */}
            <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-orange-500" /> Region Alerts
                </h3>
                <div className="space-y-3">
                    <div className="text-xs">
                        <p className="font-bold text-red-400">North India</p>
                        <p className="text-gray-400">High congestion at Delhi Hub (15–18 Dec)</p>
                    </div>
                    <div className="text-xs">
                        <p className="font-bold text-orange-400">Western Zone</p>
                        <p className="text-gray-400">2 carriers reporting backlog</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
