import { Router, Response } from 'express';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/users (ADMIN Only) - List partner and user accounts
router.get('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = memoryStore.getUsers();
  return res.json({ users });
});

// POST /api/users (ADMIN Only) - Create new account (Partner / Admin)
router.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, canEditStock, partnerRegion, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required account fields (name, email, password).' });
    }

    const newUser = memoryStore.createPartner({
      name,
      email,
      password,
      canEditStock: Boolean(canEditStock),
      partnerRegion: partnerRegion || 'General',
      phone: phone || '',
      role: role || 'PARTNER'
    }, req.user!);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: newUser
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/users/:id (ADMIN Only) - Update account details
router.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, role, canEditStock, partnerRegion, phone, status, password } = req.body;
    const updated = memoryStore.updateUser(req.params.id, {
      name,
      email,
      role,
      canEditStock,
      partnerRegion,
      phone,
      status,
      password
    }, req.user!);

    if (!updated) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    return res.json({
      message: 'Account updated successfully.',
      user: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/permissions (ADMIN Only) - Toggle or update partner permissions
router.put('/:id/permissions', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { canEditStock } = req.body;
    const updated = memoryStore.updatePartnerPermissions(req.params.id, Boolean(canEditStock), req.user!);
    if (!updated) {
      return res.status(404).json({ error: 'Partner account not found.' });
    }
    return res.json({
      message: 'Partner permissions updated successfully.',
      user: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (ADMIN Only) - Delete account
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = memoryStore.deletePartner(req.params.id, req.user!);
  if (!success) {
    return res.status(404).json({ error: 'Account not found or cannot delete.' });
  }
  return res.json({ message: 'Account deleted successfully.' });
});

export default router;
