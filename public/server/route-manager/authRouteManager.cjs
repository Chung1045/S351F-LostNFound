const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const {
    register,
    login,
    logout,
    updatePassword,
    getProfile,
    updateProfile,
    getUsers,
    deleteAccount
} = require('../controllers/authController.cjs');


router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

router.put('/users/password', authMiddleware, updatePassword);
router.get('/users/me', authMiddleware, getProfile);
router.put('/users/me', authMiddleware, updateProfile);
router.delete('/users/me', authMiddleware, deleteAccount);
router.get('/users', authMiddleware, getUsers);

module.exports = router;