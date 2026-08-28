"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/settings
router.get('/', auth_1.authenticateToken, (req, res) => {
    const settings = memoryStore_1.memoryStore.getSettings();
    return res.json({ settings });
});
// PUT /api/settings (ADMIN Only)
router.put('/', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const updated = memoryStore_1.memoryStore.updateSettings(req.body, req.user);
        return res.json({
            message: 'Business settings updated successfully.',
            settings: updated
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to update settings.' });
    }
});
exports.default = router;
