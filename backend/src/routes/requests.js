const { supabase } = require('../services/supabaseService');
const { sendEmail } = require('../services/emailService');

// POST /api/requests/create
const createRequest = async (req, res) => {
    try {
        const { userId, shipmentId, requestType, reason } = req.body;

        // Verify shipment exists (relaxed ownership check as requested)
        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', shipmentId)
            .single();

        if (shipmentError || !shipment) {
            return res.status(404).json({ error: 'Shipment not found.' });
        }

        // Check if request already exists
        const { data: existingRequest } = await supabase
            .from('shipment_requests')
            .select('*')
            .eq('shipment_id', shipmentId)
            .eq('status', 'pending')
            .single();

        if (existingRequest) {
            return res.status(400).json({ error: 'A pending request already exists for this shipment.' });
        }

        // Create request
        const { data, error } = await supabase
            .from('shipment_requests')
            .insert([{
                user_id: userId,
                shipment_id: shipmentId,
                request_type: requestType,
                reason: reason,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, request: data });
    } catch (err) {
        console.error('Create request error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/requests/pending (For Client/Admin)
const getPendingRequests = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shipment_requests')
            .select('*, shipments(*)') // Join with shipments to get details
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/requests/user/:userId (For User History)
const getUserRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('shipment_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/requests/approve
const approveRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        // Fetch request
        const { data: request, error: fetchError } = await supabase
            .from('shipment_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) throw new Error('Request not found');

        // Update request status
        const { error: updateError } = await supabase
            .from('shipment_requests')
            .update({ status: 'approved' })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // Update Shipment Status based on request type
        // Update Shipment Status or Delete based on request type
        if (request.request_type === 'cancel') {
            await supabase
                .from('shipments')
                .delete()
                .eq('id', request.shipment_id);
        } else {
            const newStatus = 'Return Initiated';
            await supabase
                .from('shipments')
                .update({ status: newStatus })
                .eq('id', request.shipment_id);
        }

        // Send Email
        try {
            const { data: { user } } = await supabase.auth.admin.getUserById(request.user_id);
            if (user && user.email) {
                const subject = `Shipment ${request.request_type === 'return' ? 'Return' : 'Cancellation'} Approved`;
                const text = `Your request to ${request.request_type} shipment ${request.shipment_id} has been approved.`;
                await sendEmail(user.email, subject, text);
            }
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Approve request error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/requests/reject
const rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.body;

        const { data: request, error: fetchError } = await supabase
            .from('shipment_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) throw new Error('Request not found');

        const { error } = await supabase
            .from('shipment_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) throw error;

        // Send Email
        try {
            const { data: { user } } = await supabase.auth.admin.getUserById(request.user_id);
            if (user && user.email) {
                const subject = `Shipment ${request.request_type === 'return' ? 'Return' : 'Cancellation'} Rejected`;
                const text = `Your request to ${request.request_type} shipment ${request.shipment_id} has been rejected. Please contact support.`;
                await sendEmail(user.email, subject, text);

                // Create Notification
                await createNotification(request.user_id, 'Request Rejected', `Your ${request.request_type} request for shipment ${request.shipment_id} has been rejected.`, 'error');
            }
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createRequest, getPendingRequests, getUserRequests, approveRequest, rejectRequest };
