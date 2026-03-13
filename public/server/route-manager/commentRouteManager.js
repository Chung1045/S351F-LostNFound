const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const { getComments, addComment, deleteComment } = require('../controllers/commentController.cjs');

router.get('/posts/:post_id/comments', getComments);
router.post('/posts/:post_id/comments', authMiddleware, addComment);
router.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = router;