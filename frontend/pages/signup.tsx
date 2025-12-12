import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black pointer-events-none" />
                <div className="w-full max-w-md z-10 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center space-y-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Check your email</h2>
                    <p className="text-gray-400">
                        We've sent a confirmation link to <span className="text-white font-medium">{email}</span>. Please verify your email to continue.
                    </p>
                    <Link href="/login" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                        Back to Login <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

            <div className="w-full max-w-md z-10 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">L</div>
                    <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-gray-400">Get started with LogiMind Pro today</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="Create a password"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
