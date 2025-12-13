'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Calendar, MapPin, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        pickup_address: '',
        delivery_address: '',
        pickup_date: '',
        weight: '',
        item_type: 'General',
        description: '',
        carrier: 'Delhivery',
    });
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [complianceWarning, setComplianceWarning] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Price Estimation Logic
    useEffect(() => {
        const basePrice = 500;
        const weightPrice = (parseFloat(formData.weight) || 0) * 10;
        const carrierPremium = formData.carrier === 'BlueDart' ? 200 : formData.carrier === 'FedEx' ? 300 : 0;
        setEstimatedPrice(basePrice + weightPrice + carrierPremium);
    }, [formData.weight, formData.carrier]);

    // AI Compliance Logic (Client-side simulation)
    useEffect(() => {
        if (formData.item_type === 'Battery' || formData.description.toLowerCase().includes('battery')) {
            setComplianceWarning('Lithium Batteries detected. Please ensure you have the MSDS document ready.');
        } else if (formData.item_type === 'Chemicals') {
            setComplianceWarning('Chemical shipment. DG Declaration is mandatory.');
        } else {
            setComplianceWarning(null);
        }
    }, [formData.item_type, formData.description]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Please log in to book a shipment.');
                return;
            }

            const response = await fetch('http://localhost:8080/api/bookings/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    user_id: session.user.id,
                    estimated_price: estimatedPrice
                })
            });

            const result = await response.json();
            if (result.success) {
                setSuccessMessage('Booking submitted successfully! It is now pending approval.');
                setFormData({
                    pickup_address: '',
                    delivery_address: '',
                    pickup_date: '',
                    weight: '',
                    item_type: 'General',
                    description: '',
                    carrier: 'Delhivery',
                });
            } else {
                alert('Booking failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                    Book a Shipment
                </h2>
                <p className="text-gray-400">
                    Fill in the details below to schedule a pickup. AI will check for compliance instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="text-blue-500" /> Shipment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Pickup Address</label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter pickup location"
                                            value={formData.pickup_address}
                                            onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Delivery Address</label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Enter delivery location"
                                            value={formData.delivery_address}
                                            onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Pickup Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={formData.pickup_date}
                                                onChange={e => setFormData({ ...formData, pickup_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Weight (kg)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.0"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Item Type</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.item_type}
                                            onChange={e => setFormData({ ...formData, item_type: e.target.value })}
                                        >
                                            <option value="General">General</option>
                                            <option value="Fragile">Fragile</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Battery">Battery (Lithium)</option>
                                            <option value="Chemicals">Chemicals</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Description</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                        placeholder="Describe the contents..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Delivery Partner</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['Delhivery', 'BlueDart', 'FedEx', 'DTDC'].map(p => (
                                            <div
                                                key={p}
                                                onClick={() => setFormData({ ...formData, carrier: p })}
                                                className={`cursor-pointer p-3 rounded-lg border text-center transition-all ${formData.carrier === p
                                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {complianceWarning && (
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200">
                                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm">
                                            <p className="font-semibold">Compliance Warning</p>
                                            <p className="opacity-90">{complianceWarning}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-4 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                                </button>

                                {successMessage && (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                        <CheckCircle2 size={18} />
                                        {successMessage}
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Section */}
                <div className="space-y-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-sm sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="text-green-500" /> Estimated Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Base Fare</span>
                                <span>₹500</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Weight Surcharge</span>
                                <span>₹{(parseFloat(formData.weight) || 0) * 10}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Partner Premium</span>
                                <span>₹{formData.carrier === 'BlueDart' ? 200 : formData.carrier === 'FedEx' ? 300 : 0}</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-center text-xl font-bold text-white">
                                <span>Total</span>
                                <span>₹{estimatedPrice}</span>
                            </div>

                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                                <h4 className="text-blue-400 font-semibold mb-1 text-sm">AI Insight</h4>
                                <p className="text-xs text-gray-400">
                                    Based on current traffic and weather, {formData.carrier} is operating with 98% on-time performance in this route.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
