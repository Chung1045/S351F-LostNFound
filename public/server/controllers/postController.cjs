const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// @route   GET /api/posts
// @desc    Browse Posts with Search, Filters, and Pagination
const getPosts = (req, res) => {

    const { type, category, q, limit, page, start_date } = req.query;

    try {
        let sql = "SELECT * FROM posts WHERE 1=1";
        const params = [];

        if (type) { 
            sql += " AND type = ?"; 
            params.push(type); 
        }
        if (category) { 
            sql += " AND category = ?"; 
            params.push(category); 
        }
        if (q) {
            sql += " AND (title LIKE ? OR description LIKE ?)";
            params.push(`%${q}%`, `%${q}%`);
        }

        // datetime filter
        if (start_date) {
            sql += " AND item_datetime >= ?";
            params.push(start_date);
        }

        sql += " ORDER BY created_at DESC";

        // limit & pagination
        const limitVal = parseInt(limit) || 10;
        const pageVal = parseInt(page) || 1;
        const offset = (pageVal - 1) * limitVal; 

        sql += " LIMIT ? OFFSET ?";
        params.push(limitVal, offset);

        const posts = db.prepare(sql).all(...params);
        res.status(200).json(posts);

    } catch (err) {
        console.error("GET Posts error:", err);
        res.status(500).json({ error: err.message });
    }
};


// @route   GET /api/posts/:id
// @desc    Get Post Detail (With Privacy Filter)
// @route   GET /api/posts/:id
// @desc    Get Post Detail (With Privacy Check)
const getPostById = (req, res) => {
    const { id } = req.params;

    try {
        // 1. 🟢 關鍵改動：使用 JOIN 同時查詢貼文和該作者的隱私設定
        const query = `
            SELECT posts.*, users.show_contact 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            WHERE posts.id = ?
        `;
        
        const post = db.prepare(query).get(id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }


        if (post.show_contact === 0) {
            post.contact_info = null; 
        }

        res.status(200).json(post);

    } catch (err) {
        console.error("GET Post Detail error:", err);
        res.status(500).json({ error: err.message });
    }
};

// @route   POST /api/posts
// @desc    Create Post (Security Fix: user_id from Token)
const createPost = (req, res) => {
    // 🟢 Security Fix: Get user_id from JWT payload, not req.body
    const user_id = req.user.id;
    const { type, category, title, description, location, item_datetime, contact_info, image_url } = req.body;

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
            stmt.run(postId, user_id, type, category, title, description, location, item_datetime, contact_info);

            // 2. Insert into post_images if image_url exists (Method A)
            if (image_url) {
                db.prepare(`INSERT INTO post_images (id, post_id, image_url) VALUES (?, ?, ?)`)
                  .run(uuidv4(), postId, image_url);
            }

            return postId;
        });

        const id = executeTransaction();
        res.status(201).json({ message: "Post created successfully", postId: id });

    } catch (err) {
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

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };
