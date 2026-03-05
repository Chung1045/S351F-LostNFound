const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// Register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await argon2.hash(password);
        const id = uuidv4();

        const stmt = db.prepare('INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)');
        stmt.run(id, username, email, hashedPassword, 'user');

        const token = jwt.sign({ id, username, role: 'user' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({ user: { id, name: username, email, role: 'user' }, token });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user || !(await argon2.verify(user.password, password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({ user: { id: user.id, name: user.username, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Logout
const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
}

// Update Current User Password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const stmt = db.prepare('SELECT password FROM users WHERE id = ?');
        const user = stmt.get(userId);

        if (!user || !(await argon2.verify(user.password, currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        const hashedNewPassword = await argon2.hash(newPassword);
        const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        updateStmt.run(hashedNewPassword, userId);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Current User Profile
const getProfile = (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, username as name, email, role FROM users WHERE id = ?');
        const user = stmt.get(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Current User Profile
const updateProfile = (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        const stmt = db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?');
        stmt.run(name, email, userId);

        res.json({ message: 'Profile updated successfully', user: { id: userId, name, email, role: req.user.role } });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get All Users (Admin only)
const getUsers = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const stmt = db.prepare('SELECT id, username as name, email, role FROM users');
        const users = stmt.all();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete Current User Account
const deleteAccount = (req, res) => {
    try {
        const userId = req.user.id;
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(userId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { register, login, logout, updatePassword, getProfile, updateProfile, getUsers, deleteAccount };
