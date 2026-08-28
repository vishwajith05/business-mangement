"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/analytics
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { preset, startDate, endDate } = req.query;
        const analytics = memoryStore_1.memoryStore.getAnalytics(req.user, {
            preset: preset,
            startDate: startDate,
            endDate: endDate
        });
        return res.json(analytics);
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Error fetching analytics.' });
    }
});
// GET /api/analytics/audit-logs (ADMIN Only)
router.get('/audit-logs', auth_1.authenticateToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only administrators can view system audit logs.' });
    }
    const logs = memoryStore_1.memoryStore.getAuditLogs();
    return res.json({ logs });
});
exports.default = router;
