const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const isAdmin = require('../middleware/adminMiddleware.cjs');
const {
    getComments,
    getCommentById,
    addComment,
    deleteComment
} = require('../controllers/commentController.cjs');

router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', authMiddleware, addComment);
router.delete('/comments/:id', authMiddleware, deleteComment);
router.get('/comments/:id', authMiddleware, isAdmin, getCommentById);

module.exports = router;
