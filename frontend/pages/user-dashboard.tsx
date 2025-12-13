import React, { useEffect, useState } from 'react';
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
    XCircle,
    Bell,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIAgentView from '@/components/AIAgentView';
import BookingForm from '@/components/BookingForm';
import UserTrackingView from '@/components/UserTrackingView';
import ReturnCancelView from '@/components/ReturnCancelView';
import ConnectView from '@/components/ConnectView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function UserDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tracking');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserEmail(session.user.email ?? null);
            setUserId(session.user.id);
            setLoading(false);
        };
        checkUser();
    }, [router]);

    const renderContent = () => {
        switch (activeTab) {
            case 'Book Shipment':
                return <BookingForm />;
            case 'Tracking':
                return <UserTrackingView userId={userId} />;
            case 'Return/Cancel':
                return <ReturnCancelView userId={userId} />;
            case 'AI Help':
                return <AIAgentView />;
            case 'Connect':
                return <ConnectView />;
            case 'Profile':
                return <ProfileView />;
            default:
                return <UserTrackingView userId={userId} />;
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl z-50">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <span className="font-bold text-lg tracking-tight">LogiMind <span className="text-xs font-normal text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full ml-1">User</span></span>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1">
                    {[
                        { id: 'Book Shipment', icon: Package, label: t('nav.bookShipment') },
                        { id: 'Tracking', icon: MapPin, label: t('nav.tracking') },
                        { id: 'Return/Cancel', icon: RotateCcw, label: t('nav.returnCancel') },
                        { id: 'AI Help', icon: Bot, label: t('nav.aiAgent') },
                        { id: 'Connect', icon: MessageSquare, label: t('nav.connect') },
                        { id: 'Profile', icon: User, label: t('nav.profile') },
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

                <div className="p-4 border-t border-white/10 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-2">{t('common.needHelp')}</p>
                        <button
                            onClick={() => setActiveTab('AI Help')}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                            {t('common.askAI')} <ArrowRight size={14} />
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{t('common.signOut')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-black">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md z-40">
                    <h1 className="text-xl font-semibold text-white">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="text-sm text-gray-400">
                            {t('common.loggedInAs')} <span className="text-white font-medium">{userEmail}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
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

function ProfileView() {
    const [user, setUser] = React.useState<any>(null);

    useEffect(() => {
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
                <p className="text-gray-400">User Account</p>
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
                            <div className="text-sm font-medium text-gray-200">User</div>
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
