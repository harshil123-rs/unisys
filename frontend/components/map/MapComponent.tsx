'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Custom Icons
const createCustomIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    green: createCustomIcon('green'),
    gold: createCustomIcon('gold'),
    red: createCustomIcon('red'),
    blue: createCustomIcon('blue'),
};

function MapController({ selectedShipment, focusedLocation }: { selectedShipment: any, focusedLocation: any }) {
    const map = useMap();
    useEffect(() => {
        if (selectedShipment) {
            map.flyTo(selectedShipment.position, 10, { duration: 1.5 });
        } else if (focusedLocation) {
            map.flyTo([focusedLocation.lat, focusedLocation.lng], 12, { duration: 1.5 });
        }
    }, [selectedShipment, focusedLocation, map]);
    return null;
}

export default function MapComponent({ shipments, selectedShipment, onSelectShipment, layers, focusedLocation }: any) {
    return (
        <MapContainer
            center={[20.5937, 78.9629]} // Center of India
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#000' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme tiles
            />

            <MapController selectedShipment={selectedShipment} focusedLocation={focusedLocation} />

            {/* Shipments */}
            {shipments.map((shipment: any) => (
                <Marker
                    key={shipment.id}
                    position={shipment.position}
                    icon={icons[shipment.statusColor as keyof typeof icons] || icons.blue}
                    eventHandlers={{
                        click: () => onSelectShipment(shipment),
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="text-black">
                            <strong>{shipment.id}</strong><br />
                            {shipment.carrier}<br />
                            Status: {shipment.status}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Selected Shipment Route */}
            {selectedShipment && selectedShipment.route && (
                <Polyline
                    positions={selectedShipment.route}
                    color={selectedShipment.statusColor === 'red' ? '#ef4444' : '#3b82f6'}
                    weight={4}
                    dashArray={selectedShipment.statusColor === 'red' ? '10, 10' : undefined}
                />
            )}

            {/* AI Predicted Delay Zones (Heatmap Simulation) */}
            {layers.heatmap && (
                <>
                    <Circle
                        center={[28.6139, 77.2090]} // Delhi
                        radius={150000}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                    />
                    <Circle
                        center={[19.0760, 72.8777]} // Mumbai
                        radius={100000}
                        pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2 }}
                    />
                </>
            )}
        </MapContainer>
    );
}
