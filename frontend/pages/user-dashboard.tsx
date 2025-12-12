import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import {
    Loader2,
    LogOut,
    LayoutDashboard,
    Package,
    FileCheck,
    Bot,
    MessageSquare,
    User,
    Search,
    MapPin,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    UploadCloud,
    FileText,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIAgentView from '@/components/AIAgentView';

export default function UserDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tracking');
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Tracking State
    const [trackingId, setTrackingId] = useState('');
    const [shipment, setShipment] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    // Document State
    const [docLoading, setDocLoading] = useState(false);
    const [docResult, setDocResult] = useState<any>(null);
    const [docError, setDocError] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUserEmail(session.user.email || 'User');
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const handleTrack = async () => {
        if (!trackingId.trim()) return;
        setTrackingLoading(true);
        setTrackingError('');
        setShipment(null);

        try {
            const { data, error } = await supabase
                .from('shipments')
                .select('*')
                .eq('id', trackingId)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Shipment not found');

            setShipment(data);
        } catch (err: any) {
            setTrackingError(err.message || 'Could not find shipment');
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setDocLoading(true);
        setDocResult(null);
        setDocError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8080/api/analyze-doc', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setDocResult(data);
        } catch (err: any) {
            setDocError(err.message || 'Analysis failed');
        } finally {
            setDocLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Tracking':
                return (
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Search Section */}
                        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold tracking-tight">Track Shipment</h2>
                                <p className="text-gray-400">Real-time AI-powered tracking dashboard.</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder="Enter Tracking ID (e.g., TN88995)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                    />
                                </div>
                                <button
                                    onClick={handleTrack}
                                    disabled={trackingLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {trackingLoading ? <Loader2 size={18} className="animate-spin" /> : 'Track'}
                                </button>
                            </div>
                        </div>

                        {trackingError && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <AlertTriangle size={20} />
                                {trackingError}
                            </div>
                        )}

                        {shipment && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* LEFT COLUMN - MAIN INFO */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 1. Header Card */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Shipment ID</div>
                                                <div className="text-3xl font-bold text-white tracking-tight">{shipment.id}</div>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2",
                                                shipment.status === 'Delivered' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    shipment.status === 'Delayed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                <div className={cn("w-2 h-2 rounded-full animate-pulse",
                                                    shipment.status === 'Delivered' ? "bg-green-500" :
                                                        shipment.status === 'Delayed' ? "bg-red-500" : "bg-blue-500"
                                                )} />
                                                {shipment.status}
                                            </div>
                                        </div>

                                        {/* 5. Predictive Delivery Window */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div>
                                                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Origin</div>
                                                <div className="font-medium">{shipment.origin || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Destination</div>
                                                <div className="font-medium">{shipment.destination || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Calendar size={12} /> Predictive Delivery</div>
                                                <div className="font-medium">{shipment.eta || 'Calculating...'}</div>
                                                <div className="text-xs text-green-400 mt-0.5">Confidence: 78%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Map View (Placeholder) */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden h-64 relative group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none" />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <div className="text-sm font-medium text-white">Live Route View</div>
                                            <div className="text-xs text-gray-400">Updated 2 mins ago</div>
                                        </div>
                                        {/* Mock Map Background */}
                                        <div className="w-full h-full bg-[#1a1d24] flex items-center justify-center text-gray-600">
                                            <MapPin size={48} className="opacity-20" />
                                            <span className="ml-2 opacity-20 font-mono">MAP VIEW INTEGRATION</span>
                                        </div>
                                    </div>

                                    {/* 1. Live Timeline */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <Package size={20} className="text-blue-500" /> Shipment Timeline
                                        </h3>
                                        <div className="space-y-8 relative pl-2">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/10" />

                                            {shipment.timeline?.map((event: any, i: number) => (
                                                <div key={i} className="relative flex gap-4">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center shrink-0 bg-[#0a0a0a]",
                                                        event.completed ? "border-blue-500 text-blue-500" : "border-gray-600 text-gray-600"
                                                    )}>
                                                        {event.completed && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                                    </div>
                                                    <div className="flex-1 -mt-1">
                                                        <div className="flex justify-between items-start">
                                                            <div className="font-medium text-white">{event.status}</div>
                                                            <div className="text-xs text-gray-400">{event.time}</div>
                                                        </div>
                                                        <div className="text-sm text-gray-500">{event.location}</div>
                                                    </div>
                                                </div>
                                            )) || <div className="text-gray-500 italic">No timeline data available.</div>}
                                        </div>
                                    </div>

                                    {/* 4. Shipment Details Panel */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-4">Shipment Details</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <div className="text-xs text-gray-400 mb-1">Carrier</div>
                                                <div className="font-medium">{shipment.shipment_details?.delivery_partner || shipment.carrier}</div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <div className="text-xs text-gray-400 mb-1">Type</div>
                                                <div className="font-medium">{shipment.shipment_details?.type || 'Standard'}</div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <div className="text-xs text-gray-400 mb-1">Weight</div>
                                                <div className="font-medium">{shipment.shipment_details?.weight || 'N/A'}</div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg">
                                                <div className="text-xs text-gray-400 mb-1">Value</div>
                                                <div className="font-medium">{shipment.shipment_details?.value || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN - INSIGHTS & ACTIONS */}
                                <div className="space-y-6">
                                    {/* 3. AI Suggestions */}
                                    <div className="bg-gradient-to-b from-blue-900/20 to-white/5 border border-blue-500/20 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                                            <Bot size={20} /> AI Insights
                                        </h3>
                                        <div className="space-y-3">
                                            {shipment.ai_suggestions?.map((suggestion: any, i: number) => (
                                                <div key={i} className={cn(
                                                    "p-3 rounded-xl border text-sm",
                                                    suggestion.type === 'warning' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-200" :
                                                        suggestion.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-200" :
                                                            "bg-blue-500/10 border-blue-500/20 text-blue-200"
                                                )}>
                                                    <div className="font-bold mb-0.5">{suggestion.title}</div>
                                                    <div className="opacity-80">{suggestion.message}</div>
                                                </div>
                                            )) || <div className="text-gray-500 text-sm">No AI insights generated yet.</div>}
                                        </div>
                                        {/* 8. Ask AI Button */}
                                        <button
                                            onClick={() => setActiveTab('AI Help')}
                                            className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            Ask AI about this shipment <ArrowRight size={14} />
                                        </button>
                                    </div>

                                    {/* 6. Risk Analysis */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <AlertTriangle size={20} className="text-yellow-500" /> Risk Analysis
                                        </h3>
                                        <div className="space-y-4">
                                            {shipment.risk_factors ? Object.entries(shipment.risk_factors).map(([key, value]: [string, any]) => (
                                                <div key={key}>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                                                        <span className={cn("font-medium", value > 30 ? "text-red-400" : "text-green-400")}>{value}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", value > 30 ? "bg-red-500" : "bg-green-500")}
                                                            style={{ width: `${value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )) : <div className="text-gray-500 text-sm">No risk data available.</div>}
                                        </div>
                                    </div>

                                    {/* 7. Document Status */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <FileCheck size={20} className="text-purple-500" /> Documents
                                        </h3>
                                        <div className="space-y-2">
                                            {shipment.required_documents?.map((doc: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        {doc.status === 'verified' ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                                        {doc.name}
                                                    </div>
                                                    <div className="text-xs uppercase font-bold tracking-wider opacity-50">{doc.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 9. Download Actions */}
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <button className="py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 flex items-center justify-center gap-1">
                                                <FileText size={12} /> Invoice
                                            </button>
                                            <button className="py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 flex items-center justify-center gap-1">
                                                <FileText size={12} /> Label
                                            </button>
                                        </div>
                                    </div>

                                    {/* 10. Notifications History */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <MessageSquare size={20} className="text-green-500" /> Updates
                                        </h3>
                                        <div className="space-y-4">
                                            {shipment.notifications?.map((notif: any, i: number) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                                    <div>
                                                        <div className="text-sm text-gray-300">{notif.message}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{notif.time}</div>
                                                    </div>
                                                </div>
                                            )) || <div className="text-gray-500 text-sm">No recent notifications.</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'Documents':
                return (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Document Checker</h2>
                            <p className="text-gray-400">Upload shipping documents for AI compliance analysis.</p>
                        </div>

                        {!docResult && !docLoading && (
                            <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-12 text-center hover:bg-white/10 transition-colors relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.txt,.md"
                                    onChange={handleDocUpload}
                                />
                                <div className="space-y-4 pointer-events-none">
                                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto text-blue-500 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={32} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-white">Drop your invoice or packing list here</p>
                                        <p className="text-sm text-gray-400">Supports PDF, TXT (Max 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {docLoading && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Analyzing Document...</h3>
                                <p className="text-gray-400">AI is checking for compliance issues.</p>
                            </div>
                        )}

                        {docResult && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className={cn(
                                    "p-6 rounded-2xl border",
                                    docResult.status === 'Pass' ? "bg-green-500/10 border-green-500/20" :
                                        docResult.status === 'Fail' ? "bg-red-500/10 border-red-500/20" :
                                            "bg-yellow-500/10 border-yellow-500/20"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                            docResult.status === 'Pass' ? "bg-green-500/20 text-green-500" :
                                                docResult.status === 'Fail' ? "bg-red-500/20 text-red-500" :
                                                    "bg-yellow-500/20 text-yellow-500"
                                        )}>
                                            {docResult.status === 'Pass' ? <CheckCircle2 size={24} /> :
                                                docResult.status === 'Fail' ? <XCircle size={24} /> :
                                                    <AlertTriangle size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{docResult.type} Analysis: {docResult.status}</h3>
                                            <p className="opacity-80">{docResult.summary}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-red-400">
                                            <AlertTriangle size={18} /> Missing Items
                                        </h4>
                                        <ul className="space-y-2">
                                            {docResult.missing?.length > 0 ? docResult.missing.map((item: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {item}
                                                </li>
                                            )) : <li className="text-gray-500 italic">No missing items detected.</li>}
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
                                            <CheckCircle2 size={18} /> Action Steps
                                        </h4>
                                        <ul className="space-y-2">
                                            {docResult.steps?.length > 0 ? docResult.steps.map((step: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {step}
                                                </li>
                                            )) : <li className="text-gray-500 italic">No actions needed.</li>}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setDocResult(null)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Analyze Another Document
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'AI Help':
                return <AIAgentView />;
            case 'Connect':
                return (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                            <p className="text-gray-400">Manage how you receive shipment updates.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-white">Email Alerts</div>
                                    <div className="text-sm text-gray-400">Receive daily summaries and critical alerts.</div>
                                </div>
                                <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
                                <input type="email" value={userEmail || ''} disabled className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-white">WhatsApp Updates</div>
                                    <div className="text-sm text-gray-400">Get instant tracking updates on WhatsApp.</div>
                                </div>
                                <div className="h-6 w-11 bg-gray-600 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                                ℹ️ To enable WhatsApp, we need to integrate Twilio API. <br />
                                1. Get Twilio Account SID & Auth Token.<br />
                                2. Add to backend .env.<br />
                                3. Enable WhatsApp Sandbox.
                            </div>
                        </div>
                    </div>
                );
            case 'Profile':
                return (
                    <div className="max-w-xl mx-auto space-y-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                                {userEmail?.[0].toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold">{userEmail}</h2>
                            <p className="text-gray-400">User Account</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <button className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/10 flex items-center justify-between">
                                <span>Edit Profile</span>
                                <User size={16} className="text-gray-500" />
                            </button>
                            <button className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/10 flex items-center justify-between">
                                <span>Change Password</span>
                                <CheckCircle2 size={16} className="text-gray-500" />
                            </button>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/login';
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-between"
                            >
                                <span>Sign Out</span>
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl z-50">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">L</div>
                    <span className="font-bold text-lg tracking-tight">LogiMind <span className="text-xs font-normal text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full ml-1">User</span></span>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1">
                    {[
                        { id: 'Tracking', icon: Package, label: 'Tracking' },
                        { id: 'Documents', icon: FileCheck, label: 'Documents' },
                        { id: 'AI Help', icon: Bot, label: 'Ask AI' },
                        { id: 'Connect', icon: MessageSquare, label: 'Connect' },
                        { id: 'Profile', icon: User, label: 'Profile' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all",
                                activeTab === item.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-2">Need help?</p>
                        <button
                            onClick={() => setActiveTab('AI Help')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                            Ask AI Agent <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-black">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-40">
                    <h1 className="text-xl font-semibold text-white">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Logged in as <span className="text-white font-medium">{userEmail}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
