const express = require("express");
const router = express.Router();
const db = require("../../db/database.cjs"); 
const authMiddleware = require('../middleware/authMiddleware.cjs'); 

/** getting post's comments*/   
router.get("/posts/:id/comments", (req, res) => {
    const { id } = req.params;
    try {
        const comments = db.prepare(`
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.post_id = ?
            ORDER BY comments.created_at ASC
        `).all(id);
        
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: "error to load the comment: " + err.message });
    }
});

/** Adding a comment (Triggers a notification for the post owner)*/
router.post("/comments", authMiddleware, (req, res) => {
    const { post_id, content } = req.body;
    const user_id = req.user.id;

    if (!post_id || !content) {
        return res.status(400).json({ error: "Post ID and content cannot be empty" });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO comments (post_id, user_id, content) 
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(post_id, user_id, content);

        res.status(201).json({ 
            message: "Comment added successfully", 
            commentId: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: "Posting error: " + err.message });
    }
});

module.exports = router;