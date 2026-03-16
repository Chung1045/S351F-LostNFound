const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

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
            type: p.type.toLowerCase(),
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

// const createPost = (req, res) => {
//     try {
//         const { type, title, category, description, location, date, time, contactInfo, imageUrl } = req.body;
//         const id = uuidv4();
//         const userId = req.user.id;
//         const itemDatetime = `${date}T${time}:00Z`;
//
//         const stmt = db.prepare(`
//             INSERT INTO posts (id, user_id, type, category, title, description, location, item_datetime, contact_info, status)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
//         `);
//
//         // Ensure type is capitalized for DB check constraint ('Lost', 'Found')
//         const dbType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
//
//         stmt.run(id, userId, dbType, category, title, description, location, itemDatetime, contactInfo);
//
//         if (imageUrl) {
//             const imgStmt = db.prepare(`INSERT INTO post_images (id, post_id, image_url) VALUES (?, ?, ?)`);
//             imgStmt.run(uuidv4(), id, imageUrl);
//         }
//
//         res.status(201).json({ message: 'Post created successfully', id });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

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

const updatePostStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check ownership or admin
        const postStmt = db.prepare('SELECT user_id FROM posts WHERE id = ?');
        const post = postStmt.get(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const stmt = db.prepare('UPDATE posts SET status = ? WHERE id = ?');
        stmt.run(status, id);

        res.json({ message: 'Post status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deletePost = (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const postStmt = db.prepare('SELECT user_id FROM posts WHERE id = ?');
        const post = postStmt.get(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
        stmt.run(id);

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getPosts, createPost, updatePostStatus, deletePost };
