import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { notificationStore } from '../store/notificationStore';

const router = Router();

// GET /api/notifications/stream - SSE connection for partners/admins
router.get('/stream', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevent buffering by Nginx / reverse proxies
  });

  // Send initial comment to establish connection immediately
  res.write(': connection established\n\n');
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  // Register client
  notificationStore.addClient(res);

  // Periodic heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    } catch (err) {
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Clean up on connection close
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    notificationStore.removeClient(res);
  });
});

export default router;
