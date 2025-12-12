'use client';

import React from 'react';
import { X, Truck, Calendar, MapPin, AlertTriangle, FileText, Wind, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ShipmentDetails({ shipment, onClose }: { shipment: any, onClose: () => void }) {
    if (!shipment) return null;

    return (
        <Card className="absolute top-4 right-4 w-96 bg-black/90 backdrop-blur-md border-white/10 shadow-2xl z-[1000] animate-in slide-in-from-right-10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Truck size={20} className="text-blue-500" />
                    {shipment.id}
                </CardTitle>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Carrier</p>
                        <p className="text-white font-medium">{shipment.carrier}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold",
                            shipment.statusColor === 'green' ? "bg-green-500/20 text-green-400" :
                                shipment.statusColor === 'gold' ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-red-500/20 text-red-400"
                        )}>
                            {shipment.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500">Current Location</p>
                        <p className="text-white font-medium flex items-center gap-1">
                            <MapPin size={14} /> {shipment.location}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">ETA</p>
                        <p className="text-white font-medium flex items-center gap-1">
                            <Calendar size={14} /> {shipment.eta}
                        </p>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                    <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                        <Navigation size={16} /> AI Route Insights
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                        <li>Delay Probability: <span className={cn("font-bold", shipment.delayRisk > 50 ? "text-red-400" : "text-green-400")}>{shipment.delayRisk}%</span></li>
                        <li>Route has seen {shipment.pastDelays} delays in last 7 days.</li>
                        <li>Expected delay: {shipment.expectedDelay}.</li>
                    </ul>
                </div>

                {/* Weather Overlay */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Wind size={20} className="text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500">Weather at Location</p>
                        <p className="text-sm text-white">{shipment.weather}</p>
                    </div>
                </div>

                {/* Document-Based Risk (SOP) */}
                {shipment.isHazardous && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-2">
                        <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                            <FileText size={16} /> SOP & Compliance
                        </h4>
                        <p className="text-xs text-gray-300">
                            <strong>Hazardous Material:</strong> Lithium Batteries.
                        </p>
                        <div className="text-xs text-gray-400 bg-black/40 p-2 rounded">
                            <p>• Must include MSDS & DG Declaration.</p>
                            <p>• Keep below 45°C.</p>
                            <p>• Label as Class 9 Dangerous Goods.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
