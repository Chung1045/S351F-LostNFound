const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const isAdmin = require('../middleware/adminMiddleware.cjs');
const { createReport, getReports, updateReportStatus, deleteUser } = require('../controllers/moderationController.cjs');

router.post('/reports', authMiddleware, createReport);
router.get('/admin/reports', authMiddleware, isAdmin, getReports);
router.put('/admin/reports/:id', authMiddleware, isAdmin, updateReportStatus);
router.delete('/admin/users/:id', authMiddleware, isAdmin, deleteUser);

module.exports = router;