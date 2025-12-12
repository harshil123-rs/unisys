'use client';

import React from 'react';
import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-7xl h-[600px] bg-black/[0.96] relative overflow-hidden border-white/10 shadow-2xl">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                />

                <div className="flex h-full flex-col md:flex-row">
                    {/* Left content */}
                    <div className="flex-1 p-8 md:p-16 relative z-10 flex flex-col justify-center">
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                            LogiMind
                        </h1>
                        <p className="mt-4 text-neutral-300 max-w-lg text-lg md:text-xl">
                            Experience the future of logistics with AI-driven insights, real-time tracking, and predictive analytics.
                        </p>

                        <Link href="/login">
                            <button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 border border-white/10">
                                Get Started
                            </button>
                        </Link>

                    </div>

                    {/* Right content */}
                    <div className="flex-1 relative min-h-[300px] md:min-h-full">
                        <SplineScene
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}
