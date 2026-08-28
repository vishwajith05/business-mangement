import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { preset, startDate, endDate } = req.query;

    const analytics = memoryStore.getAnalytics(req.user!, {
      preset: preset as any,
      startDate: startDate as string,
      endDate: endDate as string
    });

    return res.json(analytics);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching analytics.' });
  }
});

// GET /api/analytics/audit-logs (ADMIN Only)
router.get('/audit-logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can view system audit logs.' });
  }
  const logs = memoryStore.getAuditLogs();
  return res.json({ logs });
});

export default router;
