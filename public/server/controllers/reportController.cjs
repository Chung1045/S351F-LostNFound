const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

const getReports = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const stmt = db.prepare(`
            SELECT r.*, u.username as reporterName 
            FROM reports r 
            JOIN users u ON r.reporter_id = u.id 
            ORDER BY r.created_at DESC
        `);
        const reports = stmt.all();
        
        const formattedReports = reports.map(r => ({
            id: r.id,
            targetType: r.target_type,
            targetId: r.target_id,
            reporterId: r.reporter_id,
            reporterName: r.reporterName,
            reason: r.reason,
            status: r.status,
            createdAt: r.created_at
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createReport = (req, res) => {
    try {
        const { targetType, targetId, reason } = req.body;
        const id = uuidv4();
        const reporterId = req.user.id;

        const stmt = db.prepare(`
            INSERT INTO reports (id, reporter_id, target_type, target_id, reason, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `);
        stmt.run(id, reporterId, targetType, targetId, reason);

        res.status(201).json({ message: 'Report submitted', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resolveReport = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const stmt = db.prepare('UPDATE reports SET status = ? WHERE id = ?');
        stmt.run('resolved', id);

        res.json({ message: 'Report resolved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getReports, createReport, resolveReport };
