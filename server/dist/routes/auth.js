"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = memoryStore_1.memoryStore.findUserByEmail(email);
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = bcryptjs_1.default.compareSync(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl
        };
        const token = jsonwebtoken_1.default.sign(payload, auth_1.JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            message: 'Authentication successful',
            token,
            user: payload
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticateToken, (req, res) => {
    return res.json({ user: req.user });
});
exports.default = router;
