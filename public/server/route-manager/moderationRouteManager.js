const express = require("express");
const router = express.Router();
const db = require("../../db/database.cjs"); 
const authMiddleware = require('../middleware/authMiddleware.cjs'); 
const { v4: uuidv4 } = require("uuid");

/**checking admin role middleware*/
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "admin is required" });
    }
};

/** reporting system*/
router.post("/reports", authMiddleware, (req, res) => {
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
});

/** getting report list (GET /api/admin/reports)(admin)*/
router.get("/admin/reports", authMiddleware, isAdmin, (req, res) => {
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
});

/** report status update (admin) */
router.put("/admin/reports/:id", authMiddleware, isAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    try {
        const result = db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return res.status(404).json({ error: "cannot find the report" });
        res.status(200).json({ message: `marked as ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** ban user (admin) */
router.delete("/admin/users/:id", authMiddleware, isAdmin, (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
        if (result.changes === 0) return res.status(404).json({ error: "cannot find the user" });
        res.status(200).json({ message: "user account has been deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;