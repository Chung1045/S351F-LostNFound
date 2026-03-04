const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const {
    getPosts,
    createPost,
    updatePostStatus,
    deletePost
} = require('../controllers/postController.cjs');

router.get('/posts', getPosts);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id/status', authMiddleware, updatePostStatus);
router.delete('/posts/:id', authMiddleware, deletePost);

module.exports = router;
