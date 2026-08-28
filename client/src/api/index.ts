import axios from 'axios';
import { User, Product, Sale, AnalyticsResponse, BusinessSettings, StockLog, AuditLog } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aas_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.user;
  }
};

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get('/users');
    return res.data.users;
  },
  createPartner: async (data: { name: string; email: string; password: string; canEditStock?: boolean }): Promise<User> => {
    const res = await api.post('/users', data);
    return res.data.user;
  },
  updatePermissions: async (id: string, canEditStock: boolean): Promise<User> => {
    const res = await api.put(`/users/${id}/permissions`, { canEditStock });
    return res.data.user;
  },
  deletePartner: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export const productsAPI = {
  getAll: async (category?: string, search?: string): Promise<{ products: Product[]; total: number }> => {
    const res = await api.get('/products', { params: { category, search } });
    return res.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/products', data);
    return res.data.product;
  },
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data.product;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};

export const inventoryAPI = {
  getInventory: async (): Promise<{ inventory: any[] }> => {
    const res = await api.get('/inventory');
    return res.data;
  },
  adjustStock: async (productId: string, quantityChange: number, changeType: 'ADD' | 'REMOVE' | 'ADJUST', reason: string): Promise<Product> => {
    const res = await api.post('/inventory/adjust', { productId, quantityChange, changeType, reason });
    return res.data.product;
  },
  getLogs: async (productId?: string): Promise<StockLog[]> => {
    const res = await api.get('/inventory/logs', { params: { productId } });
    return res.data.logs;
  }
};

export const salesAPI = {
  getAll: async (partnerId?: string): Promise<Sale[]> => {
    const res = await api.get('/sales', { params: { partnerId } });
    return res.data.sales;
  },
  getById: async (id: string): Promise<Sale> => {
    const res = await api.get(`/sales/${id}`);
    return res.data.sale;
  },
  create: async (payload: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    items: { productId: string; quantity: number }[];
    paymentMethod?: string;
  }): Promise<Sale> => {
    const res = await api.post('/sales', payload);
    return res.data.sale;
  },
  getInvoicePDFUrl: (id: string): string => {
    const token = localStorage.getItem('aas_auth_token');
    return `/api/invoices/${id}/pdf?token=${token}`;
  }
};

export const analyticsAPI = {
  getDashboard: async (preset?: string, startDate?: string, endDate?: string): Promise<AnalyticsResponse> => {
    const res = await api.get('/analytics', { params: { preset, startDate, endDate } });
    return res.data;
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await api.get('/analytics/audit-logs');
    return res.data.logs;
  }
};

export const settingsAPI = {
  getSettings: async (): Promise<BusinessSettings> => {
    const res = await api.get('/settings');
    return res.data.settings;
  },
  updateSettings: async (settings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
    const res = await api.put('/settings', settings);
    return res.data.settings;
  }
};

export const reportsAPI = {
  downloadProductsExcel: () => {
    window.open('/api/reports/excel/products', '_blank');
  },
  downloadSalesExcel: () => {
    window.open('/api/reports/excel/sales', '_blank');
  }
};

export const notificationsAPI = {
  getStreamUrl: (): string => {
    const token = localStorage.getItem('aas_auth_token');
    return `/api/notifications/stream?token=${token}`;
  }
};

