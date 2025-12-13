const { supabase } = require('./supabaseService');

const createNotification = async (userId, title, message, type = 'info') => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                title,
                message,
                type,
                is_read: false
            }]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

module.exports = { createNotification };
