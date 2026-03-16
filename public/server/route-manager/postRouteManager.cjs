const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController.cjs');

router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);

module.exports = router
