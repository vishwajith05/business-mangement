import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to format product response with Price Including Tax
const formatProduct = (p: any) => {
  const taxAmount = p.sellingPrice * (p.taxRate / 100);
  const priceWithTax = p.sellingPrice + taxAmount;
  return {
    ...p,
    taxAmount: Number(taxAmount.toFixed(2)),
    priceWithTax: Number(priceWithTax.toFixed(2))
  };
};

// GET /api/products (Accessible to all authenticated users: Admin & Partners)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { category, search } = req.query;
  let products = memoryStore.getProducts();

  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  return res.json({
    products: products.map(formatProduct),
    total: products.length
  });
});

// GET /api/products/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const product = memoryStore.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json({ product: formatProduct(product) });
});

// POST /api/products (ADMIN Only)
router.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, category, description, purchasePrice, sellingPrice, taxRate, currentStock, minStockLevel, unit } = req.body;

    if (!name || !sku || !category || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ error: 'Missing required product fields (name, sku, category, purchasePrice, sellingPrice).' });
    }

    if (Number(purchasePrice) < 0 || Number(sellingPrice) < 0) {
      return res.status(400).json({ error: 'Prices cannot be negative.' });
    }

    const created = memoryStore.addProduct({
      name,
      sku,
      category,
      description: description || '',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      taxRate: taxRate !== undefined ? Number(taxRate) : 15,
      currentStock: currentStock !== undefined ? Number(currentStock) : 0,
      minStockLevel: minStockLevel !== undefined ? Number(minStockLevel) : 5,
      unit: unit || 'pcs'
    }, req.user!);

    return res.status(211).json({
      message: 'Product created successfully',
      product: formatProduct(created)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (ADMIN Only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = memoryStore.updateProduct(req.params.id, req.body, req.user!);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({
      message: 'Product updated successfully',
      product: formatProduct(updated)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (ADMIN Only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = memoryStore.deleteProduct(req.params.id, req.user!);
  if (!success) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json({ message: 'Product deleted successfully.' });
});

export default router;
