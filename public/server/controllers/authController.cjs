const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db/database.cjs');

// Register
const register = async (req, res) => {
    return 0;
}

// Login
const login = async (req, res) => {
    return 0;
}

// Logout
const logout = (req, res) => {
    return 0;
}

// Update Current User Password
const updatePassword = async (req, res) => {
    return 0;
};

// Get Current User Profile
const getProfile = (req, res) => {
    return 0;
};

// Update Current User Profile
const updateProfile = (req, res) => {
    return 0;
};

module.exports = { register, login, logout, updatePassword, getProfile, updateProfile };
