"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/users (ADMIN Only) - List partner and user accounts
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    const users = memoryStore_1.memoryStore.getUsers();
    return res.json({ users });
});
// POST /api/users (ADMIN Only) - Create new account (Partner / Admin)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const { name, email, password, canEditStock, partnerRegion, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required account fields (name, email, password).' });
        }
        const newUser = memoryStore_1.memoryStore.createPartner({
            name,
            email,
            password,
            canEditStock: Boolean(canEditStock),
            partnerRegion: partnerRegion || 'General',
            phone: phone || '',
            role: role || 'PARTNER'
        }, req.user);
        return res.status(201).json({
            message: 'Account created successfully.',
            user: newUser
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// PUT /api/users/:id (ADMIN Only) - Update account details
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const { name, email, role, canEditStock, partnerRegion, phone, status, password } = req.body;
        const updated = memoryStore_1.memoryStore.updateUser(req.params.id, {
            name,
            email,
            role,
            canEditStock,
            partnerRegion,
            phone,
            status,
            password
        }, req.user);
        if (!updated) {
            return res.status(404).json({ error: 'Account not found.' });
        }
        return res.json({
            message: 'Account updated successfully.',
            user: updated
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// PUT /api/users/:id/permissions (ADMIN Only) - Toggle or update partner permissions
router.put('/:id/permissions', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const { canEditStock } = req.body;
        const updated = memoryStore_1.memoryStore.updatePartnerPermissions(req.params.id, Boolean(canEditStock), req.user);
        if (!updated) {
            return res.status(404).json({ error: 'Partner account not found.' });
        }
        return res.json({
            message: 'Partner permissions updated successfully.',
            user: updated
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// DELETE /api/users/:id (ADMIN Only) - Delete account
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    const success = memoryStore_1.memoryStore.deletePartner(req.params.id, req.user);
    if (!success) {
        return res.status(404).json({ error: 'Account not found or cannot delete.' });
    }
    return res.json({ message: 'Account deleted successfully.' });
});
exports.default = router;
