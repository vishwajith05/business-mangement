import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/settings
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const settings = memoryStore.getSettings();
  return res.json({ settings });
});

// PUT /api/settings (ADMIN Only)
router.put('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = memoryStore.updateSettings(req.body, req.user!);
    return res.json({
      message: 'Business settings updated successfully.',
      settings: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update settings.' });
  }
});

export default router;
