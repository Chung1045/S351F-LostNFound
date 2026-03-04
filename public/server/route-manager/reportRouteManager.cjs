const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const {
    getReports,
    createReport,
    resolveReport
} = require('../controllers/reportController.cjs');

router.get('/reports', authMiddleware, getReports);
router.post('/reports', authMiddleware, createReport);
router.put('/reports/:id/resolve', authMiddleware, resolveReport);

module.exports = router;
