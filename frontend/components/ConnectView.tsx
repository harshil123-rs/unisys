import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectView() {
    const [settings, setSettings] = useState({
        email_notifications: true,
        whatsapp_notifications: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching settings:', error);
            }

            if (data) {
                setSettings({
                    email_notifications: data.email_notifications,
                    whatsapp_notifications: data.whatsapp_notifications
                });
            } else {
                // If no settings exist, create default
                await supabase.from('user_settings').insert([{ user_id: session.user.id }]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: 'email_notifications' | 'whatsapp_notifications') => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));

        // Optimistic update locally, then save
        try {
            setSaving(true);
            setMessage(null);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: session.user.id,
                    [key]: newValue,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Settings updated successfully' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setSettings(prev => ({ ...prev, [key]: !newValue })); // Revert on error
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Connect & Notifications</h2>
                <p className="text-gray-400">Manage how you receive updates about your shipments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Settings */}
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-medium text-white">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                                <Mail size={24} />
                            </div>
                            Email Updates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Receive detailed shipment summaries, invoices, and major status changes directly to your inbox.
                        </p>
                        <div className="flex items-center justify-between pt-2">
                            <span className={cn("text-sm font-medium", settings.email_notifications ? "text-green-400" : "text-gray-500")}>
                                {settings.email_notifications ? "Enabled" : "Disabled"}
                            </span>
                            <button
                                onClick={() => handleToggle('email_notifications')}
                                disabled={saving}
                                className={cn(
                                    "w-14 h-7 rounded-full transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    settings.email_notifications ? "bg-blue-600" : "bg-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                                    settings.email_notifications ? "left-8" : "left-1"
                                )} />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* WhatsApp Settings */}
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-medium text-white">
                            <div className="p-2 bg-green-500/20 rounded-lg text-green-400 group-hover:text-green-300 transition-colors">
                                <MessageSquare size={24} />
                            </div>
                            WhatsApp Updates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Get real-time alerts for delivery attempts, delays, and urgent notifications on WhatsApp.
                        </p>
                        <div className="flex items-center justify-between pt-2">
                            <span className={cn("text-sm font-medium", settings.whatsapp_notifications ? "text-green-400" : "text-gray-500")}>
                                {settings.whatsapp_notifications ? "Enabled" : "Disabled"}
                            </span>
                            <button
                                onClick={() => handleToggle('whatsapp_notifications')}
                                disabled={saving}
                                className={cn(
                                    "w-14 h-7 rounded-full transition-all relative focus:outline-none focus:ring-2 focus:ring-green-500/50",
                                    settings.whatsapp_notifications ? "bg-green-600" : "bg-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                                    settings.whatsapp_notifications ? "left-8" : "left-1"
                                )} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Message */}
            {message && (
                <div className={cn(
                    "fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300",
                    message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}
        </div>
    );
}
