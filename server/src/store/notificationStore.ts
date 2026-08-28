import { Response } from 'express';

export interface StockNotificationPayload {
  productId: string;
  productName: string;
  changeType: 'ADD' | 'REMOVE' | 'ADJUST';
  quantityChanged: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  timestamp: string;
}

class NotificationStore {
  private clients: Set<Response> = new Set();

  addClient(res: Response): void {
    this.clients.add(res);
  }

  removeClient(res: Response): void {
    this.clients.delete(res);
  }

  broadcast(payload: StockNotificationPayload): void {
    const data = JSON.stringify(payload);
    const deadClients: Response[] = [];

    this.clients.forEach((res) => {
      try {
        res.write(`event: stock_update\n`);
        res.write(`data: ${data}\n\n`);
        // flush for Node's http module if available
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      } catch {
        deadClients.push(res);
      }
    });

    // Clean up any closed connections
    deadClients.forEach((res) => this.clients.delete(res));
  }

  get clientCount(): number {
    return this.clients.size;
  }
}

export const notificationStore = new NotificationStore();
