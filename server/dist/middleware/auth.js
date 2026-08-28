"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAdmin = exports.authenticateToken = exports.JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.JWT_SECRET = process.env.JWT_SECRET || 'nexus-production-super-secret-jwt-key-2026';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    // Allow token via query param for PDF iframe/download links (browsers can't set headers on these)
    const queryToken = req.query?.token;
    const token = headerToken || queryToken || null;
    if (!token) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            error: 'Access Denied: This operation requires ADMIN privileges. Partner accounts do not have permission.'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user.role}) is not authorized for this resource.`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
