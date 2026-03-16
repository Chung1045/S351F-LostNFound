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

        res.status(201).json({ message: 'Comment added', id: info.lastInsertRowid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getComments, addComment };
