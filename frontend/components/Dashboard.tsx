'use client';

import React from 'react';
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
    Bot
} from 'lucide-react';
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

// ... (existing imports)

export default function Dashboard() {
    const [activeTab, setActiveTab] = React.useState('Dashboard');

    const renderContent = () => {
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
                return <PlaceholderView title="Profile" />;
            case 'Settings':
                return <PlaceholderView title="Settings" />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="text-xl font-bold">LogiMind</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">Pro</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'Dashboard'}
                        onClick={() => setActiveTab('Dashboard')}
                    />
                    <NavItem
                        icon={<Bot size={20} />}
                        label="AI Agent"
                        active={activeTab === 'AI Agent'}
                        onClick={() => setActiveTab('AI Agent')}
                    />
                    <NavItem
                        icon={<TrendingUp size={20} />}
                        label="Forecasts"
                        active={activeTab === 'Forecasts'}
                        onClick={() => setActiveTab('Forecasts')}
                    />
                    <NavItem
                        icon={<Map size={20} />}
                        label="Logistics Map"
                        active={activeTab === 'Logistics Map'}
                        onClick={() => setActiveTab('Logistics Map')}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="AI Report"
                        active={activeTab === 'AI Report'}
                        onClick={() => setActiveTab('AI Report')}
                    />
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <div className="px-4 py-2 text-xs text-gray-500 font-semibold">ACCOUNT</div>
                    <NavItem
                        icon={<User size={20} />}
                        label="Profile"
                        active={activeTab === 'Profile'}
                        onClick={() => setActiveTab('Profile')}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        active={activeTab === 'Settings'}
                        onClick={() => setActiveTab('Settings')}
                    />
                    <NavItem
                        icon={<LogOut size={20} />}
                        label="Logout"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 hover:bg-white/5 rounded-lg">
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-medium text-gray-200">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/5 rounded-full relative">
                            <Bell size={20} className="text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 space-y-6">
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
