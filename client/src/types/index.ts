export type UserRole = 'ADMIN' | 'PARTNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  canEditStock: boolean;
  partnerRegion?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  meatCategory?: 'Beef' | 'Poultry' | 'Lamb' | 'Pork' | 'Seafood';
  cutType?: string;
  imageUrl?: string;
  storageTemp?: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  taxAmount: number;
  priceWithTax: number;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName?: string;
  changeType: 'ADD' | 'REMOVE' | 'ADJUST' | 'SALE';
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPurchasePrice: number;
  unitSellingPrice: number;
  taxRate: number;
  taxAmount: number;
  itemSubtotal: number;
  itemCost: number;
  itemProfit: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  totalTax: number;
  grandTotal: number;
  paymentMethod: string;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items: SaleItem[];
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  currencySymbol: string;
  defaultTaxRate: number;
  invoiceFooter: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface KPICardData {
  value: number;
  trend?: number;
  isUp?: boolean;
  status?: string;
}

export interface AnalyticsResponse {
  kpis: {
    totalSales: KPICardData;
    totalProfit: KPICardData;
    totalOrders: KPICardData;
    totalProducts: KPICardData;
    currentStock: KPICardData;
    lowStockItems: KPICardData;
    outOfStockItems: KPICardData;
    taxCollected: KPICardData;
  };
  charts: {
    salesAndProfitTrend: { date: string; Sales: number; Cost: number; Profit: number }[];
    salesByProduct: { name: string; quantity: number; revenue: number; profit: number }[];
    salesByPartner: { partner: string; salesCount: number; revenue: number; profit: number; quantity: number }[];
    stockStatus: { name: string; value: number; color: string }[];
    profitAnalysis: { category: string; amount: number; color: string }[];
  };
}
