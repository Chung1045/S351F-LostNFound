const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided or invalid format');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token verified, user:', req.user);
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;