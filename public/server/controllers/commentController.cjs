const db = require('../../db/database.cjs');

const getComments = (req, res) => {
    try {
        const { postId } = req.params;
        const stmt = db.prepare(`
            SELECT c.*, u.username as userName 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        `);
        const comments = stmt.all(postId);
        
        const formattedComments = comments.map(c => ({
            id: c.id.toString(),
            postId: c.post_id,
            userId: c.user_id,
            userName: c.userName,
            content: c.content,
            createdAt: c.created_at
        }));

        res.json(formattedComments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addComment = (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const stmt = db.prepare(`
            INSERT INTO comments (post_id, user_id, content) 
            VALUES (?, ?, ?)
        `);
        const info = stmt.run(postId, userId, content);

        // Create notification for post owner
        const postOwner = db.prepare('SELECT user_id, title FROM posts WHERE id = ?').get(postId);
        if (postOwner && postOwner.user_id !== userId) {
            db.prepare(`
                INSERT INTO notifications (user_id, sender_id, type, message, link_id)
                VALUES (?, ?, 'comment', ?, ?)
            `).run(
                postOwner.user_id,
                userId,
                `New comment on your post "${postOwner.title}"`,
                postId
            );
        }

        res.status(201).json({ message: 'Comment added', id: info.lastInsertRowid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getComments, addComment };
