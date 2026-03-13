const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// Register
const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
    }

    try {
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await argon2.hash(password);
        const id = uuidv4();

        db.prepare(`
            INSERT INTO users (id, username, email, password)
            VALUES (?, ?, ?, ?)
        `).run(id, username, email, hashedPassword);

        return res.status(201).json({ message: 'Account created successfully' });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await argon2.verify(user.password.toString(), password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = uuidv4();

        db.prepare(`
            INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)
        `).run(refreshToken, user.id);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                show_contact: user.show_contact
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Refresh Token
const refresh = (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const storedToken = db.prepare(`
            SELECT * FROM refresh_tokens WHERE token = ?
        `).get(refreshToken);

        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(storedToken.user_id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return res.status(200).json({ accessToken });

    } catch (err) {
        console.error('Refresh error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout
const logout = (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
}

// Update Current User Password
const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        const validPassword = await argon2.verify(user.password.toString(), currentPassword);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await argon2.hash(newPassword);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.user.Id);

        return res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error('Update password error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Current User Profile
const getProfile = (req, res) => {
    try {
        const user = db.prepare(
            'SELECT id, username, email, role, show_contact, created_at FROM users WHERE id = ?'
        ).get(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });

    } catch (err) {
        console.error('Get me error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Current User Profile
const updateProfile = (req, res) => {
    const { username, email, show_contact } = req.body;

    if (!username && !email && show_contact === undefined) {
        return res.status(400).json({ message: 'Nothing to update' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        const updatedUsername = username ?? user.username;
        const updatedEmail = email ?? user.email;
        const updatedShowContact = show_contact !== undefined ? (show_contact ? 1 : 0) : user.show_contact;

        db.prepare(`
            UPDATE users SET username = ?, email = ?, show_contact = ? WHERE id = ?
        `).run(updatedUsername, updatedEmail, updatedShowContact, req.user.id);

        return res.status(200).json({ message: 'Profile updated successfully' });

    } catch (err) {
        console.error('Update me error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, refresh, login, logout, updatePassword, getProfile, updateProfile };
