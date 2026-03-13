const db = require('../../db/database.cjs');

// @route   GET /api/notifications
// @desc    Fetch notifications for the logged-in user
const getNotifications = (req, res) => {
    const user_id = req.user.id;

    try {
        const notifications = db.prepare(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).all(user_id);

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications: ' + err.message });
    }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark a specific notification as read
const markAsRead = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = db.prepare(`
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = ? AND user_id = ?
        `).run(id, user_id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Notification not found or unauthorized' });
        }

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed: ' + err.message });
    }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for the current user
const markAllAsRead = (req, res) => {
    const user_id = req.user.id;

    try {
        const result = db.prepare(`
            UPDATE notifications 
            SET is_read = 1 
            WHERE user_id = ? AND is_read = 0
        `).run(user_id);

        res.status(200).json({
            message: 'All notifications marked as read',
            updatedCount: result.changes
        });
    } catch (err) {
        res.status(500).json({ error: 'Update failed: ' + err.message });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
