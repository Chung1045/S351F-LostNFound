const db = require('../../db/database.cjs');

// @route   GET /api/posts/:post_id/comments
// @desc    Get all comments for a post
const getComments = (req, res) => {
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
};

// @route   POST /api/posts/:post_id/comments
// @desc    Add a comment to a post and notify the post owner
const addComment = (req, res) => {
    const { post_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content) {
        return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    try {
        const post = db.prepare('SELECT user_id, title FROM posts WHERE id = ?').get(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found, cannot comment' });
        }

        const result = db.prepare(`
            INSERT INTO comments (post_id, user_id, content) 
            VALUES (?, ?, ?)
        `).run(post_id, user_id, content);

        res.status(201).json({
            message: 'Comment added successfully',
            commentId: result.lastInsertRowid
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @route   DELETE /api/comments/:id
// @desc    Delete a comment (owner only)
const deleteComment = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        db.prepare('DELETE FROM comments WHERE id = ?').run(id);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getComments, addComment, deleteComment };
