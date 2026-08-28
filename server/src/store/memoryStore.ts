import { User, UserRole, Product, StockLog, Sale, BusinessSettings, AuditLog, DateFilterRange } from '../types';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const PARTNER1_HASH = bcrypt.hashSync('partner123', 10);
const PARTNER2_HASH = bcrypt.hashSync('partner223', 10);
const PARTNER3_HASH = bcrypt.hashSync('partner323', 10);

export class MemoryStore {
  private users: User[] = [
    {
      id: 'u-admin-01',
      email: 'admin@business.com',
      name: 'AAS Foods Admin',
      role: 'ADMIN',
      passwordHash: DEFAULT_PASSWORD_HASH,
      canEditStock: true,
      partnerRegion: 'Headquarters',
      phone: '+91 98765 00001',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      id: 'u-partner-01',
      email: 'partner1@business.com',
      name: 'North Meat Outlet',
      role: 'PARTNER',
      passwordHash: PARTNER1_HASH,
      canEditStock: true,
      partnerRegion: 'North Zone',
      phone: '+91 98765 00002',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      id: 'u-partner-02',
      email: 'partner2@business.com',
      name: 'West Coast Meats',
      role: 'PARTNER',
      passwordHash: PARTNER2_HASH,
      canEditStock: true,
      partnerRegion: 'West Zone',
      phone: '+91 98765 00003',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      id: 'u-partner-03',
      email: 'partner3@business.com',
      name: 'Southern Butcher Hub',
      role: 'PARTNER',
      passwordHash: PARTNER3_HASH,
      canEditStock: false,
      partnerRegion: 'South Zone',
      phone: '+91 98765 00004',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80'
    }
  ];

  private products: Product[] = [
    {
      id: 'prod-001',
      name: 'A5 Japanese Wagyu Ribeye Cut',
      sku: 'SKU-BEEF-A5',
      category: 'Beef',
      meatCategory: 'Beef',
      cutType: 'Ribeye Steak',
      imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
      storageTemp: '-18°C Frozen',
      description: 'Ultra-premium marbled Japanese A5 Wagyu beef ribeye with delicate marbling and intense tenderness',
      purchasePrice: 2400,
      sellingPrice: 3800,
      taxRate: 12,
      currentStock: 45,
      minStockLevel: 10,
      unit: 'kg',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-002',
      name: 'Fresh Farm Chicken Breast Fillet',
      sku: 'SKU-CHICK-BRST',
      category: 'Poultry',
      meatCategory: 'Poultry',
      cutType: 'Boneless Breast',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
      storageTemp: '+2°C Chilled',
      description: '100% organic farm-fresh skinless boneless chicken breast fillets, rich in lean protein',
      purchasePrice: 190,
      sellingPrice: 320,
      taxRate: 5,
      currentStock: 180,
      minStockLevel: 30,
      unit: 'kg',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-003',
      name: 'Grass-Fed Australian Lamb Chops',
      sku: 'SKU-LAMB-CHP',
      category: 'Lamb',
      meatCategory: 'Lamb',
      cutType: 'Loin Chops',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      storageTemp: '+2°C Chilled',
      description: 'Tender pasture-raised Australian lamb loin chops cut fresh by master butchers',
      purchasePrice: 920,
      sellingPrice: 1450,
      taxRate: 12,
      currentStock: 60,
      minStockLevel: 15,
      unit: 'kg',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-004',
      name: 'Prime USDA Angus T-Bone Steak',
      sku: 'SKU-BEEF-TBONE',
      category: 'Beef',
      meatCategory: 'Beef',
      cutType: 'T-Bone Steak',
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      storageTemp: '-18°C Frozen',
      description: 'USDA Prime certified Black Angus T-Bone combining rich strip loin and tender tenderloin',
      purchasePrice: 1100,
      sellingPrice: 1850,
      taxRate: 12,
      currentStock: 35,
      minStockLevel: 8,
      unit: 'kg',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-005',
      name: 'Fresh Whole Free-Range Chicken',
      sku: 'SKU-CHICK-WHL',
      category: 'Poultry',
      meatCategory: 'Poultry',
      cutType: 'Whole Bird',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
      storageTemp: '+2°C Chilled',
      description: 'Whole cleaned organic free-range chicken perfect for roasting and broiling',
      purchasePrice: 280,
      sellingPrice: 480,
      taxRate: 5,
      currentStock: 90,
      minStockLevel: 20,
      unit: 'units',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-006',
      name: 'Boneless Raw Pork Tenderloin',
      sku: 'SKU-PORK-TLN',
      category: 'Pork',
      meatCategory: 'Pork',
      cutType: 'Tenderloin Cut',
      imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=600&q=80',
      storageTemp: '+2°C Chilled',
      description: 'Succulent lean pork tenderloin carefully trimmed and vacuum packed',
      purchasePrice: 380,
      sellingPrice: 650,
      taxRate: 12,
      currentStock: 50,
      minStockLevel: 12,
      unit: 'kg',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-007',
      name: 'Fresh Wild Atlantic Salmon Fillet',
      sku: 'SKU-FISH-SALM',
      category: 'Seafood',
      meatCategory: 'Seafood',
      cutType: 'Skin-on Fillet',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      storageTemp: '-18°C Frozen',
      description: 'Sustainably caught sashimi-grade Norwegian Atlantic salmon fillets rich in Omega-3',
      purchasePrice: 780,
      sellingPrice: 1290,
      taxRate: 12,
      currentStock: 0,
      minStockLevel: 15,
      unit: 'kg',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-008',
      name: 'Slow-Roast Lamb Shanks',
      sku: 'SKU-LAMB-SHNK',
      category: 'Lamb',
      meatCategory: 'Lamb',
      cutType: 'Foreshank',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      storageTemp: '-18°C Frozen',
      description: 'Meaty bone-in lamb foreshanks ideal for braising and braised stew preparations',
      purchasePrice: 700,
      sellingPrice: 1150,
      taxRate: 12,
      currentStock: 25,
      minStockLevel: 5,
      unit: 'kg',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private stockLogs: StockLog[] = [];
  private sales: Sale[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: BusinessSettings = {
    businessName: 'AAS Foods',
    tagline: 'Artisanal Raw Meat & Food Supply Platform',
    taxId: 'GSTIN27AABCU9603R1ZM',
    email: 'orders@aasfoods.com',
    phone: '+91 98765 43210',
    address: 'AAS Foods Central Meat Hub, Plot 42, Cold Storage Complex, Sector 9',
    currencySymbol: '₹',
    defaultTaxRate: 12,
    invoiceFooter: 'Thank you for choosing AAS Foods! Keeping your meat fresh & top quality.'
  };

  constructor() {
    this.seedInitialHistoryAndSales();
    this.syncInventoryToExcelOnDisk();
  }

  private seedInitialHistoryAndSales() {
    // Fresh start: no historical sales or dummy analytical data
    this.sales = [];
    this.stockLogs = [];
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'u-admin-01',
        userName: 'AAS Foods Admin',
        action: 'SYSTEM_INIT',
        details: 'System initialized for AAS Foods Wholesale Management.',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // --- Real-Time Excel Auto-Sync Engine ---
  public async syncInventoryToExcelOnDisk(): Promise<string> {
    try {
      const exportsDir = path.join(__dirname, '..', '..', 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filePath = path.join(exportsDir, 'inventory_sync.xlsx');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Live Inventory Sync');

      sheet.columns = [
        { header: 'Product ID', key: 'id', width: 15 },
        { header: 'Product Name', key: 'name', width: 32 },
        { header: 'SKU Code', key: 'sku', width: 18 },
        { header: 'Category', key: 'category', width: 16 },
        { header: 'Purchase Price (₹)', key: 'purchasePrice', width: 20 },
        { header: 'Selling Price (₹)', key: 'sellingPrice', width: 20 },
        { header: 'Tax Rate (%)', key: 'taxRate', width: 14 },
        { header: 'Price Inc. Tax (₹)', key: 'priceWithTax', width: 20 },
        { header: 'Current Stock', key: 'currentStock', width: 16 },
        { header: 'Min Threshold', key: 'minStockLevel', width: 16 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Stock Status', key: 'status', width: 15 },
        { header: 'Last Updated', key: 'updatedAt', width: 24 }
      ];

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

      this.products.forEach(p => {
        const taxAmount = p.sellingPrice * (p.taxRate / 100);
        let status = 'IN STOCK';
        if (p.currentStock === 0) status = 'OUT OF STOCK';
        else if (p.currentStock <= p.minStockLevel) status = 'LOW STOCK';

        sheet.addRow({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice,
          taxRate: p.taxRate,
          priceWithTax: Number((p.sellingPrice + taxAmount).toFixed(2)),
          currentStock: p.currentStock,
          minStockLevel: p.minStockLevel,
          unit: p.unit,
          status,
          updatedAt: new Date(p.updatedAt).toLocaleString()
        });
      });

      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (err) {
      console.error('Error syncing inventory to Excel:', err);
      return '';
    }
  }

  // --- User & Partner Account Management ---
  getUsers(): User[] {
    return this.users.map(({ passwordHash, ...u }) => u as User);
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createPartner(partnerData: { name: string; email: string; password: string; canEditStock?: boolean; partnerRegion?: string; phone?: string; role?: UserRole }, actor: User): User {
    const existing = this.findUserByEmail(partnerData.email);
    if (existing) {
      throw new Error(`An account with email ${partnerData.email} already exists.`);
    }

    const role = partnerData.role || 'PARTNER';
    const newPartner: User = {
      id: `u-${role.toLowerCase()}-${Date.now()}`,
      name: partnerData.name,
      email: partnerData.email,
      role: role,
      passwordHash: bcrypt.hashSync(partnerData.password, 10),
      canEditStock: partnerData.canEditStock ?? (role === 'ADMIN'),
      partnerRegion: partnerData.partnerRegion || 'General',
      phone: partnerData.phone || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.users.push(newPartner);
    this.logAudit(actor, 'ACCOUNT_CREATE', `Created ${role} account ${newPartner.name} (${newPartner.email}). Region: ${newPartner.partnerRegion}`);

    const { passwordHash, ...res } = newPartner;
    return res as User;
  }

  updateUser(id: string, updates: Partial<{ name: string; email: string; role: UserRole; canEditStock: boolean; partnerRegion: string; phone: string; status: 'ACTIVE' | 'INACTIVE'; password?: string }>, actor: User): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const user = this.users[idx];
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.canEditStock !== undefined) user.canEditStock = updates.canEditStock;
    if (updates.partnerRegion !== undefined) user.partnerRegion = updates.partnerRegion;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.status !== undefined) user.status = updates.status;
    if (updates.password) {
      user.passwordHash = bcrypt.hashSync(updates.password, 10);
    }

    this.logAudit(actor, 'ACCOUNT_UPDATE', `Updated user account ${user.name} (${user.email}).`);
    const { passwordHash, ...res } = user;
    return res as User;
  }

  updatePartnerPermissions(id: string, canEditStock: boolean, actor: User): User | null {
    return this.updateUser(id, { canEditStock }, actor);
  }

  deletePartner(id: string, actor: User): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;

    const deleted = this.users.splice(idx, 1)[0];
    this.logAudit(actor, 'ACCOUNT_DELETE', `Deleted account ${deleted.name} (${deleted.email}).`);
    return true;
  }

  // --- Products ---
  getProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, actor: User): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);

    this.logAudit(actor, 'PRODUCT_CREATE', `Created product ${newProduct.name} (${newProduct.sku}) with stock ${newProduct.currentStock}.`);
    this.logStockMovement({
      productId: newProduct.id,
      productName: newProduct.name,
      userId: actor.id,
      userName: actor.name,
      changeType: 'ADD',
      quantityChanged: newProduct.currentStock,
      previousStock: 0,
      newStock: newProduct.currentStock,
      reason: 'Initial stock on product creation'
    });

    this.syncInventoryToExcelOnDisk();
    return newProduct;
  }

  updateProduct(id: string, productData: Partial<Product>, actor: User): Product | null {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const oldProduct = this.products[idx];
    const updatedProduct: Product = {
      ...oldProduct,
      ...productData,
      updatedAt: new Date().toISOString()
    };

    this.products[idx] = updatedProduct;

    this.logAudit(actor, 'PRODUCT_UPDATE', `Updated product details for ${updatedProduct.name} (${updatedProduct.sku}).`);
    this.syncInventoryToExcelOnDisk();
    return updatedProduct;
  }

  deleteProduct(id: string, actor: User): boolean {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;

    const deleted = this.products.splice(idx, 1)[0];
    this.logAudit(actor, 'PRODUCT_DELETE', `Deleted product ${deleted.name} (${deleted.sku}).`);
    this.syncInventoryToExcelOnDisk();
    return true;
  }

  // --- Inventory & Stock ---
  adjustStock(productId: string, quantityChange: number, changeType: 'ADD' | 'REMOVE' | 'ADJUST', reason: string, actor: User): Product {
    if (actor.role !== 'ADMIN' && !actor.canEditStock) {
      throw new Error(`Access Denied: Partner account (${actor.name}) has Read-Only permissions. Admin must grant stock edit access.`);
    }

    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (changeType === 'ADD') {
      newStock += Math.abs(quantityChange);
    } else if (changeType === 'REMOVE') {
      newStock -= Math.abs(quantityChange);
    } else if (changeType === 'ADJUST') {
      newStock = quantityChange;
    }

    if (newStock < 0) {
      throw new Error(`Insufficient stock for ${product.name}. Current stock is ${previousStock}, attempted adjustment results in ${newStock}. Negative stock is strictly prohibited.`);
    }

    product.currentStock = newStock;
    product.updatedAt = new Date().toISOString();

    const actualDiff = newStock - previousStock;
    this.logStockMovement({
      productId: product.id,
      productName: product.name,
      userId: actor.id,
      userName: actor.name,
      changeType,
      quantityChanged: actualDiff,
      previousStock,
      newStock,
      reason
    });

    this.logAudit(actor, 'STOCK_ADJUST', `Adjusted stock for ${product.name}: ${previousStock} -> ${newStock} (${changeType}). Reason: ${reason}`);
    this.syncInventoryToExcelOnDisk();

    return product;
  }

  getStockLogs(productId?: string): StockLog[] {
    if (productId) {
      return this.stockLogs.filter(l => l.productId === productId);
    }
    return [...this.stockLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private logStockMovement(log: Omit<StockLog, 'id' | 'createdAt'>) {
    this.stockLogs.unshift({
      ...log,
      id: `slog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    });
  }

  // --- Sales & Transactions ---
  createSale(
    partner: User,
    customerName: string,
    customerEmail: string | undefined,
    customerPhone: string | undefined,
    items: { productId: string; quantity: number }[],
    paymentMethod: string = 'Cash'
  ): Sale {
    if (items.length === 0) {
      throw new Error('Sale must contain at least one product item.');
    }

    for (const item of items) {
      const p = this.getProductById(item.productId);
      if (!p) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }
      if (p.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for "${p.name}". Required: ${item.quantity}, Available: ${p.currentStock}.`);
      }
    }

    const saleId = `sale-${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    let totalRevenue = 0;
    let totalCost = 0;
    let totalGrossProfit = 0;
    let totalTax = 0;

    const saleItems = items.map((item, idx) => {
      const p = this.getProductById(item.productId)!;
      const subtotal = p.sellingPrice * item.quantity;
      const cost = p.purchasePrice * item.quantity;
      const profit = subtotal - cost;
      const tax = subtotal * (p.taxRate / 100);

      totalRevenue += subtotal;
      totalCost += cost;
      totalGrossProfit += profit;
      totalTax += tax;

      const prevStock = p.currentStock;
      p.currentStock -= item.quantity;
      p.updatedAt = new Date().toISOString();

      this.logStockMovement({
        productId: p.id,
        productName: p.name,
        userId: partner.id,
        userName: partner.name,
        changeType: 'SALE',
        quantityChanged: -item.quantity,
        previousStock: prevStock,
        newStock: p.currentStock,
        reason: `Deducted for sale ${invoiceNumber}`
      });

      return {
        id: `sitem-${Date.now()}-${idx}`,
        saleId,
        productId: p.id,
        productName: p.name,
        quantity: item.quantity,
        unitPurchasePrice: p.purchasePrice,
        unitSellingPrice: p.sellingPrice,
        taxRate: p.taxRate,
        taxAmount: Number(tax.toFixed(2)),
        itemSubtotal: Number(subtotal.toFixed(2)),
        itemCost: Number(cost.toFixed(2)),
        itemProfit: Number(profit.toFixed(2))
      };
    });

    const grandTotal = totalRevenue + totalTax;

    const newSale: Sale = {
      id: saleId,
      invoiceNumber,
      partnerId: partner.id,
      partnerName: partner.name,
      customerName,
      customerEmail,
      customerPhone,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalGrossProfit: Number(totalGrossProfit.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      paymentMethod,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      items: saleItems
    };

    this.sales.unshift(newSale);
    this.logAudit(partner, 'SALE_CREATE', `Created Sale ${invoiceNumber} for ${customerName}. Grand Total: ₹${grandTotal.toLocaleString()}`);

    this.syncInventoryToExcelOnDisk();
    return newSale;
  }

  getSales(actor: User, filterPartnerId?: string): Sale[] {
    if (actor.role !== 'ADMIN') {
      return this.sales.filter(s => s.partnerId === actor.id);
    }
    if (filterPartnerId) {
      return this.sales.filter(s => s.partnerId === filterPartnerId);
    }
    return [...this.sales];
  }

  getSaleById(id: string, actor: User): Sale | null {
    const sale = this.sales.find(s => s.id === id || s.invoiceNumber === id);
    if (!sale) return null;

    if (actor.role !== 'ADMIN' && sale.partnerId !== actor.id) {
      throw new Error('Access denied: You are not authorized to view another partner\'s invoice.');
    }

    return sale;
  }

  // --- Analytics & KPIs ---
  getAnalytics(actor: User, range?: DateFilterRange) {
    let salesPool = actor.role === 'ADMIN' ? this.sales : this.sales.filter(s => s.partnerId === actor.id);

    const totalSales = salesPool.reduce((acc, s) => acc + s.totalRevenue, 0);
    const totalCost = salesPool.reduce((acc, s) => acc + s.totalCost, 0);
    const totalProfit = salesPool.reduce((acc, s) => acc + s.totalGrossProfit, 0);
    const totalTax = salesPool.reduce((acc, s) => acc + s.totalTax, 0);
    const totalOrders = salesPool.length;

    const totalProducts = this.products.length;
    const currentStockUnits = this.products.reduce((acc, p) => acc + p.currentStock, 0);
    const lowStockCount = this.products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length;
    const outOfStockCount = this.products.filter(p => p.currentStock === 0).length;

    const mockTrendSales = totalOrders > 0 ? +12.5 : 0;
    const mockTrendProfit = totalOrders > 0 ? +15.8 : 0;
    const mockTrendOrders = totalOrders > 0 ? +8.3 : 0;
    const mockTrendTax = totalOrders > 0 ? +14.2 : 0;

    const trendMap = new Map<string, { date: string; Sales: number; Cost: number; Profit: number }>();
    salesPool.forEach(s => {
      const dateKey = s.createdAt.substring(0, 10);
      const existing = trendMap.get(dateKey) || { date: dateKey, Sales: 0, Cost: 0, Profit: 0 };
      existing.Sales += s.totalRevenue;
      existing.Cost += s.totalCost;
      existing.Profit += s.totalGrossProfit;
      trendMap.set(dateKey, existing);
    });

    const salesAndProfitTrend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
    salesPool.forEach(s => {
      s.items.forEach(item => {
        const existing = productSalesMap.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0, profit: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.itemSubtotal;
        existing.profit += item.itemProfit;
        productSalesMap.set(item.productName, existing);
      });
    });

    const salesByProduct = Array.from(productSalesMap.values());

    const partnerMap = new Map<string, { partner: string; salesCount: number; revenue: number; profit: number; quantity: number }>();
    ['Partner One (North)', 'Partner Two (West)', 'Partner Three (South)'].forEach(pName => {
      partnerMap.set(pName, { partner: pName, salesCount: 0, revenue: 0, profit: 0, quantity: 0 });
    });

    salesPool.forEach(s => {
      const pData = partnerMap.get(s.partnerName) || { partner: s.partnerName, salesCount: 0, revenue: 0, profit: 0, quantity: 0 };
      pData.salesCount += 1;
      pData.revenue += s.totalRevenue;
      pData.profit += s.totalGrossProfit;
      pData.quantity += s.items.reduce((acc, i) => acc + i.quantity, 0);
      partnerMap.set(s.partnerName, pData);
    });

    const salesByPartner = Array.from(partnerMap.values());

    const stockStatus = [
      { name: 'In Stock', value: this.products.filter(p => p.currentStock > p.minStockLevel).length, color: '#10B981' },
      { name: 'Low Stock', value: lowStockCount, color: '#F59E0B' },
      { name: 'Out of Stock', value: outOfStockCount, color: '#EF4444' }
    ];

    const profitAnalysis = [
      { category: 'Total Revenue', amount: totalSales, color: '#3B82F6' },
      { category: 'Cost of Goods Sold (COGS)', amount: totalCost, color: '#64748B' },
      { category: 'Gross Profit', amount: totalProfit, color: '#10B981' },
      { category: 'Estimated Net Profit (After Tax)', amount: totalProfit, color: '#6366F1' }
    ];

    return {
      kpis: {
        totalSales: { value: totalSales, trend: mockTrendSales, isUp: mockTrendSales >= 0 },
        totalProfit: { value: totalProfit, trend: mockTrendProfit, isUp: mockTrendProfit >= 0 },
        totalOrders: { value: totalOrders, trend: mockTrendOrders, isUp: mockTrendOrders >= 0 },
        totalProducts: { value: totalProducts, trend: 0, isUp: true },
        currentStock: { value: currentStockUnits, trend: -2.1, isUp: false },
        lowStockItems: { value: lowStockCount, status: lowStockCount > 0 ? 'warning' : 'ok' },
        outOfStockItems: { value: outOfStockCount, status: outOfStockCount > 0 ? 'danger' : 'ok' },
        taxCollected: { value: totalTax, trend: mockTrendTax, isUp: mockTrendTax >= 0 }
      },
      charts: {
        salesAndProfitTrend,
        salesByProduct,
        salesByPartner,
        stockStatus,
        profitAnalysis
      }
    };
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  getSettings(): BusinessSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<BusinessSettings>, actor: User): BusinessSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.logAudit(actor, 'SETTINGS_UPDATE', 'Updated business settings & tax defaults.');
    return this.settings;
  }

  private logAudit(actor: User, action: string, details: string) {
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: actor.id,
      userName: actor.name,
      action,
      details,
      createdAt: new Date().toISOString()
    });
  }
}

export const memoryStore = new MemoryStore();
