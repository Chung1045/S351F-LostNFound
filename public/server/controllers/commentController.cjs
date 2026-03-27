const db = require('../../db/database.cjs');

// @route   GET /api/posts/:post_id/comments
// @desc    Get all comments for a post
const getComments = (req, res) => {

    console.log(`getComment invoked`)
    console.log(`req.params:`, req.params);

    const {postId} = req.params;
    console.log(`post_id extracted:`, postId);

    try {
        const comments = db.prepare(`
            SELECT comments.*, users.username
            FROM comments
                     JOIN users ON comments.user_id = users.id
            WHERE comments.post_id = ?
            ORDER BY comments.created_at ASC
        `).all(postId);

        console.log(`Raw comments from DB:`, comments);
        console.log(`Number of comments:`, comments.length);

        const formattedComments = comments.map(c => ({
            id: c.id.toString(),
            postId: c.post_id,
            userId: c.user_id,
            userName: c.username,
            content: c.content,
            createdAt: c.created_at
        }));

        console.log(`Formatted comments:`, JSON.stringify(formattedComments, null, 2));

        res.status(200).json(formattedComments);
    } catch (err) {
        console.error(`Cannot fetch comments for post ${post_id}: ${err.message}`)
        res.status(500).json({error: err.message});
    }
};

// @route   GET /api/comments/:id
// @desc    Get single comment by comment ID
const getCommentById = (req, res) => {

    console.log("getCommentById invoked")
    console.log("req.params:", req.params)

    const { id } = req.params
    console.log("comment id extracted:", id)

    try {

        const comment = db.prepare(`
            SELECT id, content, created_at
            FROM comments
            WHERE id = ?
        `).get(id)

        console.log("Raw comment from DB:", comment)

        if (!comment) {
            return res.status(404).json({
                error: "Comment not found"
            })
        }

        res.status(200).json(comment)

    } catch (err) {

        console.error(`Cannot fetch comment ${id}:`, err.message)

        res.status(500).json({
            error: err.message
        })

    }
}

// @route   POST /api/posts/:post_id/comments
// @desc    Add a comment to a post and notify the post owner
const addComment = (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const sender_id = req.user.id;

    console.log(`Received comment for post ${postId} from user ${sender_id} with content: ${content}`);

    if (!content) {
        return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    try {

        const executeTransaction = db.transaction(() => {

            const post = db.prepare('SELECT user_id, title FROM posts WHERE id = ?').get(postId);

            if (!post) {
                throw new Error('POST_NOT_FOUND');
            }

            // 2. saving the comment
            const result = db.prepare(`
                INSERT INTO comments (post_id, user_id, content) 
                VALUES (?, ?, ?)
            `).run(postId, sender_id, content);

            if (post.user_id !== sender_id) {
                const notifyMsg = `Someone commented on your post: "${post.title}"`;

                db.prepare(`
                    INSERT INTO notifications (user_id, sender_id, type, message, link_id)
                    VALUES (?, ?, ?, ?, ?)
                `).run(post.user_id, sender_id, 'comment', notifyMsg, postId);

                console.log(`Notification generated for User: ${post.user_id}`);
            }

            return result.lastInsertRowid;
        });


        const commentId = executeTransaction();

        res.status(201).json({
            message: 'Comment added and post owner notified',
            commentId: commentId
        });

    } catch (err) {
        if (err.message === 'POST_NOT_FOUND') {
            return res.status(404).json({ error: 'Post not found, cannot comment' });
        }
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
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== user_id) return res.status(403).json({ error: 'Unauthorized' });

        db.prepare('DELETE FROM comments WHERE id = ?').run(id);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getComments, getCommentById, addComment, deleteComment };
