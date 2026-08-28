"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memoryStore_1 = require("../store/memoryStore");
const auth_1 = require("../middleware/auth");
const notificationStore_1 = require("../store/notificationStore");
const router = (0, express_1.Router)();
// GET /api/inventory (All Users)
router.get('/', auth_1.authenticateToken, (req, res) => {
    const products = memoryStore_1.memoryStore.getProducts();
    const inventoryItems = products.map(p => {
        const taxAmount = p.sellingPrice * (p.taxRate / 100);
        const priceWithTax = p.sellingPrice + taxAmount;
        let status = 'IN STOCK';
        if (p.currentStock === 0) {
            status = 'OUT OF STOCK';
        }
        else if (p.currentStock <= p.minStockLevel) {
            status = 'LOW STOCK';
        }
        return {
            productId: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            currentStock: p.currentStock,
            purchasePrice: p.purchasePrice,
            sellingPrice: p.sellingPrice,
            taxRate: p.taxRate,
            taxAmount: Number(taxAmount.toFixed(2)),
            priceWithTax: Number(priceWithTax.toFixed(2)),
            minStockLevel: p.minStockLevel,
            unit: p.unit,
            status,
            lastUpdated: p.updatedAt
        };
    });
    return res.json({ inventory: inventoryItems });
});
// POST /api/inventory/adjust (ADMIN Only)
router.post('/adjust', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    try {
        const { productId, quantityChange, changeType, reason } = req.body;
        if (!productId || quantityChange === undefined || !changeType) {
            return res.status(400).json({ error: 'Missing required parameters: productId, quantityChange, changeType.' });
        }
        if (!['ADD', 'REMOVE', 'ADJUST'].includes(changeType)) {
            return res.status(400).json({ error: 'Invalid changeType. Must be ADD, REMOVE, or ADJUST.' });
        }
        const updatedProduct = memoryStore_1.memoryStore.adjustStock(productId, Number(quantityChange), changeType, reason || 'Manual Admin Stock Adjustment', req.user);
        // Broadcast the stock adjustment to all connected partners/admins via SSE
        notificationStore_1.notificationStore.broadcast({
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            changeType: changeType,
            quantityChanged: Number(quantityChange),
            newStock: updatedProduct.currentStock,
            reason: reason || 'Manual Admin Stock Adjustment',
            adjustedBy: req.user.name,
            timestamp: new Date().toISOString()
        });
        return res.json({
            message: `Stock adjusted successfully for ${updatedProduct.name}`,
            product: updatedProduct
        });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// GET /api/inventory/logs (All Users)
router.get('/logs', auth_1.authenticateToken, (req, res) => {
    const { productId } = req.query;
    const logs = memoryStore_1.memoryStore.getStockLogs(productId);
    return res.json({ logs });
});
exports.default = router;
