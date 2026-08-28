import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { notificationStore } from '../store/notificationStore';

const router = Router();

// GET /api/inventory (All Users)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const products = memoryStore.getProducts();

  const inventoryItems = products.map(p => {
    const taxAmount = p.sellingPrice * (p.taxRate / 100);
    const priceWithTax = p.sellingPrice + taxAmount;
    
    let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (p.currentStock === 0) {
      status = 'OUT OF STOCK';
    } else if (p.currentStock <= p.minStockLevel) {
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
router.post('/adjust', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, quantityChange, changeType, reason } = req.body;

    if (!productId || quantityChange === undefined || !changeType) {
      return res.status(400).json({ error: 'Missing required parameters: productId, quantityChange, changeType.' });
    }

    if (!['ADD', 'REMOVE', 'ADJUST'].includes(changeType)) {
      return res.status(400).json({ error: 'Invalid changeType. Must be ADD, REMOVE, or ADJUST.' });
    }

    const updatedProduct = memoryStore.adjustStock(
      productId,
      Number(quantityChange),
      changeType as any,
      reason || 'Manual Admin Stock Adjustment',
      req.user!
    );

    // Broadcast the stock adjustment to all connected partners/admins via SSE
    notificationStore.broadcast({
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      changeType: changeType as any,
      quantityChanged: Number(quantityChange),
      newStock: updatedProduct.currentStock,
      reason: reason || 'Manual Admin Stock Adjustment',
      adjustedBy: req.user!.name,
      timestamp: new Date().toISOString()
    });

    return res.json({
      message: `Stock adjusted successfully for ${updatedProduct.name}`,
      product: updatedProduct
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/inventory/logs (All Users)
router.get('/logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.query;
  const logs = memoryStore.getStockLogs(productId as string);
  return res.json({ logs });
});

export default router;
