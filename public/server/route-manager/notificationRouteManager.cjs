const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController.cjs');

router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/read-all', authMiddleware, markAllAsRead);
router.put('/notifications/:id/read', authMiddleware, markAsRead);

module.exports = router;