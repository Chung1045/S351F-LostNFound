// uploadRouteManager.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware.cjs');

// 1. Storage Configuration (Ensure absolute path)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use path.resolve to make sure it points to the correct folder
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uuidv4()}${fileExtension}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);

/**
 * @route   POST /api/upload
 */
router.post('/upload', authMiddleware, (req, res) => {
    upload(req, res, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Please upload at least one file' });
        }

        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        res.status(200).json({
            message: 'Images uploaded successfully',
            image_urls: imageUrls
        });
    });
});

module.exports = router;