const express = require("express");
const router = express.Router();
const db = require("../../db/database.cjs"); 
const authMiddleware = require('../middleware/authMiddleware.cjs'); 

/** getting comments for post */
router.get("/posts/:post_id/comments", (req, res) => {
    const { post_id } = req.params;

    try {
        const comments = db.prepare(`
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.post_id = ?
            ORDER BY comments.created_at ASC
        `).all(post_id);
        
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** adding comment to a post */
router.post("/posts/:post_id/comments", authMiddleware, (req, res) => {
    const { post_id } = req.params; 
    const { content } = req.body;   
    const user_id = req.user.id;    

    if (!content) {
        return res.status(400).json({ error: "comment cannot be empty" });
    }

    try {
        
        const post = db.prepare("SELECT user_id, title FROM posts WHERE id = ?").get(post_id);
        if (!post) {
            return res.status(404).json({ error: "post not found, cannot comment" });
        }

        // adding comment to database
        const stmt = db.prepare(`
            INSERT INTO comments (post_id, user_id, content) 
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(post_id, user_id, content);


        res.status(201).json({ 
            message: "Comment successful", 
            commentId: result.lastInsertRowid 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;