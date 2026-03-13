const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// reporting system
const createReport = (req, res) => {
    const { target_type, target_id, category_id, reason } = req.body;
    const reporter_id = req.user.id;

    try {
        const id = uuidv4();
        db.prepare(`
            INSERT INTO reports (id, reporter_id, target_type, target_id, category_id, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, reporter_id, target_type, target_id, category_id, reason);

        res.status(201).json({ message: "report submitted", reportId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// getting report list (GET /api/admin/reports)(admin)
const getReports = (req, res) => {
    try {
        const reports = db.prepare(`
            SELECT reports.*, report_categories.name as category_name, users.username as reporter_name
            FROM reports
            JOIN report_categories ON reports.category_id = report_categories.id
            JOIN users ON reports.reporter_id = users.id
            WHERE reports.status = 'pending'
        `).all();

        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// report status update (admin)
const updateReportStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return res.status(404).json({ error: "cannot find the report" });
        res.status(200).json({ message: `marked as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ban user (admin)
const deleteUser = (req, res) => {
    const { id } = req.params;

    try {
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createReport, getReports, updateReportStatus, deleteUser };
