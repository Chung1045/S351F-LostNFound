const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// TDOD: Update with the one from the backend that supports imageURL fetching
const getPosts = (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.*, u.username as userName,
                   (SELECT COUNT(*) FROM reports r WHERE r.target_id = p.id AND r.status = 'pending') as reportCount,
                   (SELECT image_url FROM post_images pi WHERE pi.post_id = p.id LIMIT 1) as imageUrl
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        const posts = stmt.all();

        // Map database fields to frontend model
        const formattedPosts = posts.map(p => ({
            id: p.id,
            // type: p.type.toLowerCase(),
            type: p.type,
            title: p.title,
            category: p.category,
            description: p.description,
            location: p.location,
            date: p.item_datetime.split('T')[0],
            time: p.item_datetime.split('T')[1]?.substring(0, 5) || '00:00',
            contactInfo: p.contact_info,
            status: p.status,
            userId: p.user_id,
            userName: p.userName,
            createdAt: p.created_at,
            imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1621735320171-a682f45d7172?auto=format&fit=crop&q=80&w=800',
            isReported: p.reportCount > 0
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// @route   POST /api/posts
// @desc    Create Post (Security Fix: user_id from Token)
const createPost = (req, res) => {
    const user_id = req.user.id;
    const { type, title, category, description, location, date, time, contactInfo, imageUrl } = req.body;
    const itemDatetime = `${date}T${time}:00Z`;

    console.log("Received data:", { user_id, type, title, category, description, location, date, time, contactInfo, imageUrl });

    if (!type || !title) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        // Use Transaction to handle posts and images linkage
        const executeTransaction = db.transaction(() => {
            const postId = uuidv4();

            // 1. Insert into posts
            const stmt = db.prepare(`
                INSERT INTO posts (id, user_id, type, category, title, description, location, item_datetime, contact_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(postId, user_id, type, category, title, description, location, itemDatetime, contactInfo);

            // 2. Insert into post_images if image_url exists (Method A)
            if (imageUrl) {
                db.prepare(`INSERT INTO post_images (id, post_id, image_url) VALUES (?, ?, ?)`)
                    .run(uuidv4(), postId, imageUrl);
            }

            return postId;
        });

        const id = executeTransaction();
        res.status(201).json({ message: "Post created successfully", postId: id });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(400).json({ error: err.message });
    }
};

// @route   PUT /api/posts/:id
// @desc    Update Post (Owner or Admin Only)
const updatePost = (req, res) => {
    const { id } = req.params;
    const { title, description, location, status } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    try {
        // Check ownership/role before update
        const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.user_id !== currentUserId && currentUserRole !== 'admin') {
            return res.status(403).json({ error: "Unauthorized to update this post" });
        }

        const stmt = db.prepare(`
            UPDATE posts 
            SET title = COALESCE(?, title), 
                description = COALESCE(?, description), 
                location = COALESCE(?, location),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(title, description, location, status, id);

        res.status(200).json({ message: "Post updated successfully" });
    } catch (err) {
        console.error("Update Post error:", err);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
};

// @route   DELETE /api/posts/:id
// @desc    Delete a post (Owner or Admin Only)
const deletePost = (req, res) => {
    const { id } = req.params;

    console.log("delete post is invoked")

    // 1.getting current user info from auth middleware
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    try {

        const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // 3. Only allow deletion if the user is the post owner or an admin
        if (post.user_id !== currentUserId && currentUserRole !== 'admin') {
            return res.status(403).json({
                error: 'Only admin and post owner can delete this post'
            });
        }

        // 4. Perform the delete operation
        const result = db.prepare("DELETE FROM posts WHERE id = ?").run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Delete failed, post not found" });
        }

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        console.error("Delete Post error:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getPosts, createPost, updatePost, deletePost };
