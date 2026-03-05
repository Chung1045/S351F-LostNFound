const express = require("express");
const router = express.Router();
const db = require("../../db/database.cjs"); 
const { v4: uuidv4 } = require("uuid");

/**Browse Posts**/
router.get("/posts", (req, res) => {
    const { type, category, q } = req.query;
    try {
        let sql = "SELECT * FROM posts WHERE 1=1";
        const params = [];

        if (type) { sql += " AND type = ?"; params.push(type); }
        if (category) { sql += " AND category = ?"; params.push(category); }
        if (q) { 
            sql += " AND (title LIKE ? OR description LIKE ?)"; 
            params.push(`%${q}%`, `%${q}%`); 
        }

        sql += " ORDER BY created_at DESC";
        const posts = db.prepare(sql).all(...params);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** Get Post Detail**/
router.get("/posts/:id", (req, res) => {
    const { id } = req.params;
    try {
        const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
        if (!post) return res.status(404).json({ error: "nothing found" });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** Create Post**/
router.post("/posts", (req, res) => {
    const { user_id, type, category, title, description, location, item_datetime, contact_info } = req.body;
    
    if (!user_id || !type || !title) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        const id = uuidv4();
        const stmt = db.prepare(`
            INSERT INTO posts (id, user_id, type, category, title, description, location, item_datetime, contact_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, user_id, type, category, title, description, location, item_datetime, contact_info);
        
        res.status(201).json({ message: "Post created successfully", postId: id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/** Update Post/Status**/
router.put("/posts/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, location, status } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE posts 
            SET title = COALESCE(?, title), 
                description = COALESCE(?, description), 
                location = COALESCE(?, location),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(title, description, location, status, id);

        if (result.changes === 0) return res.status(404).json({ error: "nothing found" });
        res.status(200).json({ message: "Post updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/** Delete Post**/
router.delete("/posts/:id", (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare("DELETE FROM posts WHERE id = ?").run(id);
        if (result.changes === 0) return res.status(404).json({ error: "nothing found" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;