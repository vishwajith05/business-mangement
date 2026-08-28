"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/sales (Partner gets ONLY their own sales, Admin gets all)
router.get('/', auth_1.authenticateToken, (req, res) => {
    const { partnerId } = req.query;
    const sales = memoryStore_1.memoryStore.getSales(req.user, partnerId);
    return res.json({ sales });
});
// GET /api/sales/:id
router.get('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const sale = memoryStore_1.memoryStore.getSaleById(req.params.id, req.user);
        if (!sale) {
            return res.status(404).json({ error: 'Sale record or invoice not found.' });
        }
        return res.json({ sale });
    }
    catch (err) {
        return res.status(403).json({ error: err.message });
    }
});
// POST /api/sales (Create Sale transaction)
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, items, paymentMethod } = req.body;
        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Customer name and at least one item are required to create a sale.' });
        }
        const sale = memoryStore_1.memoryStore.createSale(req.user, customerName, customerEmail, customerPhone, items, paymentMethod);
        return res.status(201).json({
            message: 'Sale transaction processed successfully.',
            sale
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.default = router;
