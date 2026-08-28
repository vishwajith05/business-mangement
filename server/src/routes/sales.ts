import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/sales (Partner gets ONLY their own sales, Admin gets all)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { partnerId } = req.query;
  const sales = memoryStore.getSales(req.user!, partnerId as string);
  return res.json({ sales });
});

// GET /api/sales/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sale = memoryStore.getSaleById(req.params.id, req.user!);
    if (!sale) {
      return res.status(404).json({ error: 'Sale record or invoice not found.' });
    }
    return res.json({ sale });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// POST /api/sales (Create Sale transaction)
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, items, paymentMethod } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and at least one item are required to create a sale.' });
    }

    const sale = memoryStore.createSale(
      req.user!,
      customerName,
      customerEmail,
      customerPhone,
      items,
      paymentMethod
    );

    return res.status(201).json({
      message: 'Sale transaction processed successfully.',
      sale
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
