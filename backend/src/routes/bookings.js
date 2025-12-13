const { supabase } = require('../services/supabaseService');
const { sendEmail } = require('../services/emailService');

// POST /api/bookings/book
const createBooking = async (req, res) => {
    try {
        const { user_id, pickup_address, delivery_address, pickup_date, weight, item_type, description, carrier, estimated_price } = req.body;

        const { data, error } = await supabase
            .from('shipment_bookings')
            .insert([{
                user_id,
                pickup_address,
                delivery_address,
                pickup_date,
                weight,
                item_type,
                description,
                carrier,
                estimated_price,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, booking: data });
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/bookings/pending (For Staff/Client Portal)
const getPendingBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shipment_bookings')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/bookings/approve
const approveBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // 1. Fetch the booking
        const { data: booking, error: fetchError } = await supabase
            .from('shipment_bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) throw new Error('Booking not found');

        // 2. Generate Tracking ID (TN + 6 random digits)
        const trackingId = 'TN' + Math.floor(100000 + Math.random() * 900000);

        // 3. Insert into main shipments table
        const { error: insertError } = await supabase
            .from('shipments')
            .insert([{
                id: trackingId, // Using tracking ID as the main ID
                user_id: booking.user_id,
                carrier: booking.carrier,
                status: 'Pending Pickup',
                location: booking.pickup_address, // Initial location
                origin: booking.pickup_address,
                destination: booking.delivery_address,
                lat: 0, // Placeholder, would need geocoding in real app
                lng: 0,
                origin_lat: 0,
                origin_lng: 0,
                dest_lat: 0,
                dest_lng: 0,
                eta: 'Calculating...', // Placeholder
                delay_risk: 0,
                shipment_details: {
                    value: `₹${booking.estimated_price}`,
                    weight: `${booking.weight} kg`,
                    item_type: booking.item_type,
                    description: booking.description
                }
            }]);

        if (insertError) throw insertError;

        // 4. Update booking status
        const { error: updateError } = await supabase
            .from('shipment_bookings')
            .update({ status: 'approved', tracking_id: trackingId })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        // 5. Send Email Notification
        try {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);
            if (!userError && user && user.email) {
                const subject = 'Shipment Booking Approved - LogiMind';
                const text = `Your shipment booking (ID: ${bookingId}) has been approved.\n\nTracking ID: ${trackingId}\nCarrier: ${booking.carrier}\n\nYou can track your shipment in the User Portal.`;
                await sendEmail(user.email, subject, text);

                // Create Notification
                await createNotification(booking.user_id, 'Booking Approved', `Your booking for ${booking.item_type} has been approved. Tracking ID: ${trackingId}`, 'success');
            }
        } catch (emailErr) {
            console.error('Failed to send approval email/notification:', emailErr);
            // Don't fail the request if email fails
        }

        res.json({ success: true, trackingId });
    } catch (err) {
        console.error('Approve booking error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/bookings/reject
const rejectBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // Fetch booking first to get user_id
        const { data: booking, error: fetchError } = await supabase
            .from('shipment_bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) throw new Error('Booking not found');

        const { error } = await supabase
            .from('shipment_bookings')
            .update({ status: 'rejected' })
            .eq('id', bookingId);

        if (error) throw error;

        // Send Email Notification
        try {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);
            if (!userError && user && user.email) {
                const subject = 'Shipment Booking Rejected - LogiMind';
                const text = `Your shipment booking (ID: ${bookingId}) has been rejected.\n\nPlease contact support for more details or submit a new request.`;
                await sendEmail(user.email, subject, text);
            }
        } catch (emailErr) {
            console.error('Failed to send rejection email:', emailErr);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking, getPendingBookings, approveBooking, rejectBooking };
