"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notificationStore_1 = require("../store/notificationStore");
const router = (0, express_1.Router)();
// GET /api/notifications/stream - SSE connection for partners/admins
router.get('/stream', auth_1.authenticateToken, (req, res) => {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Prevent buffering by Nginx / reverse proxies
    });
    // Send initial comment to establish connection immediately
    res.write(': connection established\n\n');
    if (typeof res.flush === 'function') {
        res.flush();
    }
    // Register client
    notificationStore_1.notificationStore.addClient(res);
    // Periodic heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
        try {
            res.write(': ping\n\n');
            if (typeof res.flush === 'function') {
                res.flush();
            }
        }
        catch (err) {
            clearInterval(heartbeatInterval);
        }
    }, 30000);
    // Clean up on connection close
    req.on('close', () => {
        clearInterval(heartbeatInterval);
        notificationStore_1.notificationStore.removeClient(res);
    });
});
exports.default = router;
