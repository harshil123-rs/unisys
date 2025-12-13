'use client';

import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    AlertTriangle,
    TrendingUp,
    Users,
    FileText,
    MapPin,
    Clock,
    HelpCircle,
    CheckCircle2,
    AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// --- Mock Data ---

import { supabase } from '../lib/supabase';

// ...

export default function ForecastsView() {
    const [shipmentData, setShipmentData] = React.useState<any[]>([]);
    const [delayData, setDelayData] = React.useState<any[]>([]);
    const [riskData, setRiskData] = React.useState<any[]>([]);
    const [staffingData, setStaffingData] = React.useState<any[]>([]);
    const [queryData, setQueryData] = React.useState<any[]>([]);
    const [peakDay, setPeakDay] = React.useState<{ day: string, count: number }>({ day: '-', count: 0 });

    React.useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: shipments } = await supabase
                .from('shipments')
                .select('*')
                .eq('user_id', session.user.id);

            if (!shipments || shipments.length === 0) return;

            // --- 1. Volume Forecast (by Day of Week) ---
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const volumeMap: Record<string, number> = {};
            days.forEach(d => volumeMap[d] = 0);

            shipments.forEach((s: any) => {
                if (s.eta) {
                    try {
                        // Parse "16 Dec, 01:34 AM" -> Date
                        // Append current year to handle the format
                        const dateStr = `${s.eta.split(',')[0]} ${new Date().getFullYear()}`;
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            const dayName = days[date.getDay()];
                            volumeMap[dayName]++;
                        }
                    } catch (e) {
                        console.error("Date parse error", e);
                    }
                }
            });

            const volumeChartData = days.map(day => ({ name: day, value: volumeMap[day] }));
            setShipmentData(volumeChartData);

            // Find Peak Day
            const maxVal = Math.max(...volumeChartData.map(d => d.value));
            const maxDay = volumeChartData.find(d => d.value === maxVal)?.name || '-';
            setPeakDay({ day: maxDay, count: maxVal });


            // --- 2. Delay Prediction (Top 3 Riskiest) ---
            const delays = shipments
                .filter((s: any) => s.delay_risk > 0)
                .sort((a: any, b: any) => b.delay_risk - a.delay_risk)
                .slice(0, 3)
                .map((s: any) => ({
                    id: s.id,
                    prob: s.delay_risk,
                    reason: s.weather || 'Operational Delay',
                    region: getRegion(s.destination)
                }));
            setDelayData(delays);


            // --- 3. Risk Heatmap (By Region) ---
            const regionRisks: Record<string, { total: number, count: number }> = {};
            shipments.forEach((s: any) => {
                const region = getRegion(s.destination);
                if (!regionRisks[region]) regionRisks[region] = { total: 0, count: 0 };
                regionRisks[region].total += (s.delay_risk || 0);
                regionRisks[region].count++;
            });

            const heatmapData = Object.keys(regionRisks).map(region => {
                const avgRisk = Math.round(regionRisks[region].total / regionRisks[region].count);
                let riskLevel = 'Safe';
                let color = 'bg-green-500';
                if (avgRisk > 60) { riskLevel = 'High'; color = 'bg-red-500'; }
                else if (avgRisk > 30) { riskLevel = 'Medium'; color = 'bg-orange-500'; }

                return { region: `${region} Region`, risk: riskLevel, color, avg: avgRisk };
            });
            // Ensure we have at least some regions even if empty
            if (heatmapData.length === 0) {
                setRiskData([
                    { region: 'North Region', risk: 'Safe', color: 'bg-green-500', avg: 0 },
                    { region: 'West Region', risk: 'Safe', color: 'bg-green-500', avg: 0 }
                ]);
            } else {
                setRiskData(heatmapData);
            }


            // --- 4. Staffing Forecast (Dynamic) ---
            const activeCount = shipments.filter((s: any) => s.status === 'In Transit').length;
            const baseStaff = Math.max(2, Math.ceil(activeCount / 3)); // 1 agent per 3 active shipments

            // Mocking time distribution but scaling by active load
            const staffChart = [
                { time: '8AM', tickets: Math.round(activeCount * 0.5), staff: Math.max(1, Math.round(baseStaff * 0.5)) },
                { time: '10AM', tickets: Math.round(activeCount * 1.2), staff: baseStaff },
                { time: '12PM', tickets: Math.round(activeCount * 0.8), staff: Math.max(1, Math.round(baseStaff * 0.8)) },
                { time: '2PM', tickets: Math.round(activeCount * 1.5), staff: Math.ceil(baseStaff * 1.2) },
                { time: '4PM', tickets: Math.round(activeCount * 1.1), staff: baseStaff },
                { time: '6PM', tickets: Math.round(activeCount * 0.6), staff: Math.max(1, Math.round(baseStaff * 0.6)) },
            ];
            setStaffingData(staffChart);


            // --- 5. Query Forecast ---
            const delayedCount = shipments.filter((s: any) => s.status === 'Delayed').length;
            const transitCount = shipments.filter((s: any) => s.status === 'In Transit').length;

            setQueryData([
                { name: 'Where is my shipment?', value: delayedCount * 3 + transitCount }, // High correlation with delays
                { name: 'Export docs needed?', value: Math.round(shipments.length * 0.2) },
                { name: 'Hazardous rules?', value: Math.round(shipments.length * 0.1) },
                { name: 'Customs clearance', value: Math.round(shipments.length * 0.15) },
            ]);

        };
        fetchData();
    }, []);

    // Helper to map cities to regions
    const getRegion = (city: string) => {
        if (!city) return 'National';
        const lower = city.toLowerCase();
        if (lower.includes('delhi') || lower.includes('noida') || lower.includes('chandigarh') || lower.includes('punjab')) return 'North';
        if (lower.includes('mumbai') || lower.includes('pune') || lower.includes('ahmedabad') || lower.includes('surat') || lower.includes('goa')) return 'West';
        if (lower.includes('bangalore') || lower.includes('chennai') || lower.includes('hyderabad') || lower.includes('kochi') || lower.includes('kerala')) return 'South';
        if (lower.includes('kolkata') || lower.includes('patna') || lower.includes('bhubaneswar')) return 'East';
        if (lower.includes('bhopal') || lower.includes('indore')) return 'Central';
        return 'National';
    };

    const docForecasts = [
        { title: 'Battery Shipment Rules', date: 'Next Week', type: 'Compliance', desc: 'New labeling required for Li-ion batteries.' },
        { title: 'Holiday Peak Protocol', date: 'In 2 Days', type: 'Risk', desc: 'Expect 20% volume surge. Staffing adjustment needed.' },
    ];


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Predictive Analytics</h2>
                <p className="text-muted-foreground text-gray-400">
                    AI-powered forecasts for shipments, delays, and operational risks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Shipment Volume Forecast */}
                <Card className="bg-black/40 border-white/10 col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} />
                                Shipment Volume Forecast
                            </CardTitle>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">7 Days</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={shipmentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#666" tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-medium">Expected Peak: {peakDay.day} ({peakDay.count} Shipments)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Delay Prediction */}
                <Card className="bg-black/40 border-white/10 col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="text-red-500" size={20} />
                            Delay Prediction (AI)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {delayData.map((item) => (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-200">Shipment {item.id}</span>
                                        <span className={cn(
                                            "font-bold",
                                            item.prob > 70 ? "text-red-500" : item.prob > 40 ? "text-orange-500" : "text-green-500"
                                        )}>{item.prob}% Probability</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", item.prob > 70 ? "bg-red-500" : item.prob > 40 ? "bg-orange-500" : "bg-green-500")}
                                            style={{ width: `${item.prob}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <AlertOctagon size={12} /> {item.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Forecast Based on Documents */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-purple-500" size={20} />
                            Document & Compliance Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {docForecasts.map((doc, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-200">{doc.title}</h4>
                                        <span className={cn(
                                            "text-xs px-2 py-1 rounded",
                                            doc.type === 'Risk' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                        )}>{doc.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{doc.desc}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} /> Effective: {doc.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Query Forecast */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="text-cyan-500" size={20} />
                            Query Forecast (Helpdesk)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={queryData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" stroke="#666" tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#999" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">Predicted query volume by topic for next 48h</p>
                    </CardContent>
                </Card>

                {/* 5. Staffing & Workload Forecast */}
                <Card className="bg-black/40 border-white/10 col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-green-500" size={20} />
                            Staffing & Workload Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={staffingData}>
                                    <defs>
                                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="time" stroke="#666" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#666" tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="tickets" stroke="#22c55e" fillOpacity={1} fill="url(#colorTickets)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-center gap-8">
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Peak Hours</p>
                                <p className="text-xl font-bold text-white">2 PM - 5 PM</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Recommended Staff</p>
                                <p className="text-xl font-bold text-green-500">4 Agents</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Risk Heatmap */}
                <Card className="bg-black/40 border-white/10 col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="text-orange-500" size={20} />
                            Regional Risk Heatmap
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {riskData.map((region) => (
                                <div key={region.region} className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-lg font-semibold text-gray-300 mb-2">{region.region}</span>
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg", region.color)}>
                                        <span className="text-black font-bold text-xs">{region.risk}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        Avg Risk: {region.avg || 0}%
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
