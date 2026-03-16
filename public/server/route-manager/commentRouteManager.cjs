const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const {
    getComments,
    addComment,
    deleteComment
} = require('../controllers/commentController.cjs');

router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', authMiddleware, addComment);
router.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = router;
