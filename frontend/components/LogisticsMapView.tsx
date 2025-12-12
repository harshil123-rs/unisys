'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ShipmentDetails from './map/ShipmentDetails';
import MapSidebar from './map/MapSidebar';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./map/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
            Loading Map...
        </div>
    ),
});

import { supabase } from '@/lib/supabase';

// ...

export default function LogisticsMapView() {
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [focusedLocation, setFocusedLocation] = useState<any>(null);
    const [filters, setFilters] = useState({ status: 'All' });
    const [layers, setLayers] = useState({ heatmap: true, traffic: false });
    const [shipmentsWithRoutes, setShipmentsWithRoutes] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch from Supabase
            const { data: shipments, error } = await supabase.from('shipments').select('*');

            if (error) {
                console.error("Error fetching shipments:", error);
                return;
            }

            if (!shipments) return;

            // 2. Transform and Calculate Routes
            const updatedShipments = await Promise.all(shipments.map(async (s) => {
                const shipment = {
                    id: s.id,
                    carrier: s.carrier,
                    status: s.status,
                    statusColor: s.status === 'Delayed' ? 'red' : s.status === 'In Transit' ? 'green' : 'gold',
                    location: s.location,
                    position: [s.lat, s.lng],
                    eta: s.eta,
                    delayRisk: s.delay_risk,
                    weather: s.weather,
                    route: [[s.origin_lat, s.origin_lng], [s.dest_lat, s.dest_lng]] // Default straight line
                };

                // Fetch real route if coordinates exist
                if (s.origin_lat && s.dest_lat) {
                    const { getRoute } = await import('@/lib/googleMaps');
                    const polyline = await getRoute([s.origin_lat, s.origin_lng], [s.dest_lat, s.dest_lng]);
                    if (polyline) {
                        shipment.route = polyline;
                    }
                }
                return shipment;
            }));

            setShipmentsWithRoutes(updatedShipments);
        };

        fetchData();
    }, []);

    const filteredShipments = useMemo(() => {
        return shipmentsWithRoutes.filter(s => {
            if (filters.status === 'All') return true;
            if (filters.status === 'Delayed' && s.status === 'Delayed') return true;
            if (filters.status === 'In Transit' && s.status === 'In Transit') return true;
            return false;
        });
    }, [filters, shipmentsWithRoutes]);

    const handleVoiceSearch = (query: string) => {
        // Extract ID if present (simple regex or check)
        // For now, just check if any ID matches
        const shipment = shipmentsWithRoutes.find(s => query.includes(s.id) || s.id.includes(query));

        if (shipment) {
            setSelectedShipment(shipment);
            // Also focus the map on this shipment
            setFocusedLocation({
                lat: shipment.position[0],
                lng: shipment.position[1],
                name: `Shipment ${shipment.id}`
            });
        } else {
            alert(`Shipment not found for query: ${query}`);
        }
    };

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black">
            <MapSidebar
                filters={filters}
                setFilters={setFilters}
                layers={layers}
                setLayers={setLayers}
                onVoiceSearch={handleVoiceSearch}
                onLocationSelect={setFocusedLocation}
            />

            <MapComponent
                shipments={filteredShipments}
                selectedShipment={selectedShipment}
                onSelectShipment={setSelectedShipment}
                layers={layers}
                focusedLocation={focusedLocation}
            />

            <ShipmentDetails
                shipment={selectedShipment}
                onClose={() => setSelectedShipment(null)}
            />
        </div>
    );
}
