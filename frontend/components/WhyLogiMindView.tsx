import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Zap, ShieldCheck, Clock, MessageSquare, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WhyLogiMindView() {
    const features = [
        {
            name: "Real-time AI Tracking",
            icon: <Zap size={20} />,
            competitor: false,
            logimind: true,
            description: "Live updates with predictive ETA, not just static checkpoints."
        },
        {
            name: "Predictive Delay Analysis",
            icon: <BrainCircuit size={20} />,
            competitor: false,
            logimind: true,
            description: "AI forecasts delays before they happen using weather & traffic data."
        },
        {
            name: "Automated Doc Verification",
            icon: <ShieldCheck size={20} />,
            competitor: false,
            logimind: true,
            description: "Instant AI checks for missing or incorrect shipping documents."
        },
        {
            name: "Instant WhatsApp Alerts",
            icon: <MessageSquare size={20} />,
            competitor: false,
            logimind: true,
            description: "Get critical updates where you are, without logging in."
        },
        {
            name: "24/7 AI Support Agent",
            icon: <Clock size={20} />,
            competitor: false,
            logimind: true,
            description: "Instant answers to 'Where is my shipment?' in any language."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-white">Why Choose <span className="text-blue-500">LogiMind</span>?</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    See how we outperform traditional logistics management with AI-driven intelligence and automation.
                </p>
            </div>

            <Card className="bg-black/40 border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-12 border-b border-white/10 bg-white/5">
                    <div className="col-span-6 p-6 text-lg font-semibold text-gray-300">Feature</div>
                    <div className="col-span-3 p-6 text-lg font-semibold text-gray-400 text-center border-l border-white/10">Traditional Logistics</div>
                    <div className="col-span-3 p-6 text-lg font-bold text-blue-400 text-center border-l border-white/10 bg-blue-500/5">LogiMind</div>
                </div>

                <div className="divide-y divide-white/10">
                    {features.map((feature, index) => (
                        <div key={index} className="grid grid-cols-12 hover:bg-white/5 transition-colors group">
                            {/* Feature Name & Desc */}
                            <div className="col-span-6 p-6 flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-lg">{feature.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                                </div>
                            </div>

                            {/* Competitor Status */}
                            <div className="col-span-3 p-6 flex items-center justify-center border-l border-white/10">
                                {feature.competitor ? (
                                    <CheckCircle2 className="text-green-500" size={28} />
                                ) : (
                                    <XCircle className="text-red-500/50" size={28} />
                                )}
                            </div>

                            {/* LogiMind Status */}
                            <div className="col-span-3 p-6 flex items-center justify-center border-l border-white/10 bg-blue-500/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {feature.logimind ? (
                                    <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                                        <CheckCircle2 size={24} />
                                    </div>
                                ) : (
                                    <XCircle className="text-red-500" size={28} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-gradient-to-br from-blue-900/20 to-black border-blue-500/20">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">50% Faster</h3>
                        <p className="text-sm text-gray-400">Response times compared to manual support.</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <BrainCircuit size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">90% Accuracy</h3>
                        <p className="text-sm text-gray-400">In delay predictions and risk analysis.</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/20">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Zero Errors</h3>
                        <p className="text-sm text-gray-400">In automated document verification.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
