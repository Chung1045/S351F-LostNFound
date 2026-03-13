const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.cjs');
const {
    refresh,
    register,
    login,
    logout,
    updatePassword,
    getProfile,
    updateProfile
} = require('../controllers/authController.cjs');


router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

router.put('/users/password', authMiddleware, updatePassword);
router.get('/users/me', authMiddleware, getProfile);
router.put('/users/me', authMiddleware, updateProfile);

module.exports = router;