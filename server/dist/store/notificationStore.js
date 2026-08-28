"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationStore = void 0;
class NotificationStore {
    clients = new Set();
    addClient(res) {
        this.clients.add(res);
    }
    removeClient(res) {
        this.clients.delete(res);
    }
    broadcast(payload) {
        const data = JSON.stringify(payload);
        const deadClients = [];
        this.clients.forEach((res) => {
            try {
                res.write(`event: stock_update\n`);
                res.write(`data: ${data}\n\n`);
                // flush for Node's http module if available
                if (typeof res.flush === 'function') {
                    res.flush();
                }
            }
            catch {
                deadClients.push(res);
            }
        });
        // Clean up any closed connections
        deadClients.forEach((res) => this.clients.delete(res));
    }
    get clientCount() {
        return this.clients.size;
    }
}
exports.notificationStore = new NotificationStore();
