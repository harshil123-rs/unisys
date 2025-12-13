'use client';

import React from 'react';
import BulkUploadView from '@/components/BulkUploadView';
import {
    LayoutDashboard,
    TrendingUp,
    Map,
    FileText,
    Bell,
    User,
    Settings,
    LogOut,
    Box,
    Activity,
    DollarSign,
    Menu,
    Bot,
    Package,
    CheckCircle2,
    UploadCloud,
    RotateCcw
} from 'lucide-react';

// ... (existing code)

// ... (removed duplicate code)
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const data = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 132 },
    { name: 'Mar', value: 101 },
    { name: 'Apr', value: 134 },
    { name: 'May', value: 90 },
    { name: 'Jun', value: 145 },
    { name: 'Jul', value: 160 },
];

import ForecastsView from '@/components/ForecastsView';

// ... (existing imports and code)

import LogisticsMapView from '@/components/LogisticsMapView';

// ... (existing imports)

import AIReportView from '@/components/AIReportView';
import AIAgentView from '@/components/AIAgentView';
import BookingForm from '@/components/BookingForm';
import ApprovalsView from '@/components/ApprovalsView';
import ReturnCancelView from '@/components/ReturnCancelView';

// ... (existing imports)

import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Dashboard() {
    const [activeTab, setActiveTab] = React.useState('Dashboard');
    const [portalMode, setPortalMode] = React.useState<'user' | 'client'>('user');
    const [loading, setLoading] = React.useState(true);
    const { t } = useLanguage();
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        // Real-time subscription
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false);

        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    React.useEffect(() => {
        const checkUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email === 'hs304264@gmail.com') {
                setPortalMode('client');
                // Optional: Set default tab for client
            } else {
                setPortalMode('user');
                // Optional: Set default tab for user
            }
            setLoading(false);
        };
        checkUserRole();
    }, []);

    const renderContent = () => {
        // ... (keep existing switch)
        switch (activeTab) {
            case 'Dashboard':
                return <DashboardView />;
            case 'Forecasts':
                return <ForecastsView />;
            case 'Logistics Map':
                return <LogisticsMapView />;
            case 'AI Report':
                return <AIReportView />;
            case 'AI Agent':
                return <AIAgentView />;
            case 'Profile':
                return <ProfileView />;
            case 'Settings':
                return <SettingsView />;
            case 'Book Shipment':
                return <BookingForm />;
            case 'Approvals':
                return <ApprovalsView />;
            case 'Bulk Upload':
                return <BulkUploadView />;
            case 'Return/Cancel':
                return <ReturnCancelView />;
            default:
                return <DashboardView />;
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <span className="text-xl font-bold">LogiMind</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label={t('nav.dashboard')}
                        active={activeTab === 'Dashboard'}
                        onClick={() => setActiveTab('Dashboard')}
                    />

                    {/* User Portal Tabs */}
                    {portalMode === 'user' && (
                        <>
                            <NavItem
                                icon={<Package size={20} />}
                                label={t('nav.bookShipment')}
                                active={activeTab === 'Book Shipment'}
                                onClick={() => setActiveTab('Book Shipment')}
                            />
                            <NavItem
                                icon={<Bot size={20} />}
                                label={t('nav.aiAgent')}
                                active={activeTab === 'AI Agent'}
                                onClick={() => setActiveTab('AI Agent')}
                            />
                            <NavItem
                                icon={<RotateCcw size={20} />}
                                label={t('nav.returnCancel')}
                                active={activeTab === 'Return/Cancel'}
                                onClick={() => setActiveTab('Return/Cancel')}
                            />
                        </>
                    )}

                    {/* Client Portal Tabs */}
                    {portalMode === 'client' && (
                        <>
                            <NavItem
                                icon={<Bot size={20} />}
                                label={t('nav.aiAgent')}
                                active={activeTab === 'AI Agent'}
                                onClick={() => setActiveTab('AI Agent')}
                            />
                            <NavItem
                                icon={<Map size={20} />}
                                label={t('nav.logisticsMap')}
                                active={activeTab === 'Logistics Map'}
                                onClick={() => setActiveTab('Logistics Map')}
                            />
                            <NavItem
                                icon={<CheckCircle2 size={20} />}
                                label={t('nav.approvals')}
                                active={activeTab === 'Approvals'}
                                onClick={() => setActiveTab('Approvals')}
                            />
                            <NavItem
                                icon={<TrendingUp size={20} />}
                                label={t('nav.forecasts')}
                                active={activeTab === 'Forecasts'}
                                onClick={() => setActiveTab('Forecasts')}
                            />
                            <NavItem
                                icon={<FileText size={20} />}
                                label={t('nav.aiReport')}
                                active={activeTab === 'AI Report'}
                                onClick={() => setActiveTab('AI Report')}
                            />
                            <NavItem
                                icon={<UploadCloud size={20} />}
                                label={t('nav.bulkUpload')}
                                active={activeTab === 'Bulk Upload'}
                                onClick={() => setActiveTab('Bulk Upload')}
                            />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold">ACCOUNT</div>
                    <NavItem
                        icon={<User size={20} />}
                        label={t('nav.profile')}
                        active={activeTab === 'Profile'}
                        onClick={() => setActiveTab('Profile')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label={t('nav.settings')}
                        active={activeTab === 'Settings'}
                        onClick={() => setActiveTab('Settings')}
                    />
                    <NavItem
                        icon={<LogOut size={20} />}
                        label={t('nav.logout')}
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Topbar */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 hover:bg-white/5 rounded-lg">
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-medium text-gray-200">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) markAsRead();
                                }}
                                className="p-2 hover:bg-white/5 rounded-full relative transition-colors"
                            >
                                <Bell size={20} className={showNotifications ? "text-blue-500" : "text-gray-400"} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-white/10 flex justify-between items-center">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        {unreadCount > 0 && <span className="text-xs text-blue-400">{unreadCount} new</span>}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-200">{n.title}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 space-y-6" onClick={() => setShowNotifications(false)}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

import { supabase } from '@/lib/supabase';

// ...

function DashboardView() {
    const [metrics, setMetrics] = React.useState({
        activeOrders: 0,
        delayedShipments: 0,
        avgDelayRisk: 0
    });
    const [chartData, setChartData] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: shipments } = await supabase
                .from('shipments')
                .select('*')
                .eq('user_id', session.user.id);
            if (!shipments) return;

            // 1. Calculate Metrics
            const active = shipments.filter(s => s.status === 'In Transit' || s.status === 'Out for Delivery').length;
            const delayed = shipments.filter(s => s.status === 'Delayed').length;
            const avgRisk = shipments.reduce((acc, curr) => acc + (curr.delay_risk || 0), 0) / (shipments.length || 1);

            setMetrics({
                activeOrders: active,
                delayedShipments: delayed,
                avgDelayRisk: Math.round(avgRisk)
            });

            // 2. Prepare Chart Data (Group by Carrier for this demo)
            const carrierCounts: Record<string, number> = {};
            shipments.forEach(s => {
                const carrier = s.carrier || 'Unknown';
                carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1;
            });

            const chart = Object.keys(carrierCounts).map(key => ({
                name: key,
                value: carrierCounts[key]
            }));
            setChartData(chart);
        };
        fetchData();
    }, []);

    return (
        <>
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Logistics Performance</h2>
                <p className="text-muted-foreground text-gray-400">
                    Real-time overview of your logistics performance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Orders"
                    value={metrics.activeOrders.toString()}
                    change="Live"
                    trend="up"
                    icon={<Box className="text-blue-500" />}
                />
                <StatCard
                    title="Delayed Shipments"
                    value={metrics.delayedShipments.toString()}
                    change={`${metrics.delayedShipments > 0 ? 'Attention Needed' : 'On Track'}`}
                    trend={metrics.delayedShipments > 0 ? "down" : "up"}
                    icon={<Activity className="text-red-500" />}
                    trendColor={metrics.delayedShipments > 0 ? "text-red-500" : "text-green-500"}
                />
                <StatCard
                    title="Avg Delay Risk"
                    value={`${metrics.avgDelayRisk}%`}
                    change="AI Risk Score"
                    trend={metrics.avgDelayRisk > 50 ? "down" : "up"}
                    icon={<TrendingUp className={metrics.avgDelayRisk > 50 ? "text-red-500" : "text-green-500"} />}
                    trendColor={metrics.avgDelayRisk > 50 ? "text-red-500" : "text-green-500"}
                />
            </div>

            {/* Graph Section */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white">Shipments by Carrier</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#666"
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#000' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>



            {/* Recent Alerts */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="text-blue-500" size={20} />
                        <CardTitle className="text-lg font-medium text-white">Recent Alerts</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm text-gray-300">New order #123{i} received</span>
                                </div>
                                <span className="text-xs text-gray-500">{i}h ago</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

function PlaceholderView({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p>This feature is under development.</p>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
                active
                    ? "bg-blue-600/10 text-blue-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function StatCard({ title, value, change, trend, icon, trendColor }: any) {
    const isUp = trend === 'up';
    const colorClass = trendColor || (isUp ? "text-green-500" : "text-red-500");

    return (
        <Card className="bg-black/40 border-white/10 hover:bg-white/5 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className={cn("text-xs font-medium mt-1", colorClass)}>
                    {change}
                </p>
            </CardContent>
        </Card>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

function ProfileView() {
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 text-white">
                    {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user?.email || 'Loading...'}</h2>
                <p className="text-gray-400">Administrator</p>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <User size={20} className="text-blue-500" /> Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-black/20">
                            <div className="text-xs text-gray-500 mb-1">Email</div>
                            <div className="text-sm font-medium text-gray-200">{user?.email}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-black/20">
                            <div className="text-xs text-gray-500 mb-1">User ID</div>
                            <div className="text-sm font-medium text-gray-200 font-mono truncate">{user?.id}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-black/20">
                            <div className="text-xs text-gray-500 mb-1">Role</div>
                            <div className="text-sm font-medium text-gray-200">Admin</div>
                        </div>
                        <div className="p-3 rounded-lg bg-black/20">
                            <div className="text-xs text-gray-500 mb-1">Status</div>
                            <div className="text-sm font-medium text-green-400">Active</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <button
                onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                }}
                className="w-full p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
            >
                <LogOut size={20} /> Sign Out
            </button>
        </div>
    );
}

function SettingsView() {
    const [notifications, setNotifications] = React.useState({
        email: true,
        push: true
    });
    const [loading, setLoading] = React.useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-gray-400">Manage your account preferences.</p>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <Bell size={20} className="text-blue-500" /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="font-medium text-white">Email Notifications</div>
                            <div className="text-sm text-gray-400">Receive daily summaries.</div>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                            className={cn(
                                "w-11 h-6 rounded-full transition-colors relative",
                                notifications.email ? "bg-blue-600" : "bg-gray-600"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                notifications.email ? "left-6" : "left-1"
                            )} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="font-medium text-white">Push Notifications</div>
                            <div className="text-sm text-gray-400">Get real-time updates.</div>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                            className={cn(
                                "w-11 h-6 rounded-full transition-colors relative",
                                notifications.push ? "bg-blue-600" : "bg-gray-600"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                                notifications.push ? "left-6" : "left-1"
                            )} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
