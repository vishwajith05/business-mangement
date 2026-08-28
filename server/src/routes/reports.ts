import { Router, Response } from 'express';
import ExcelJS from 'exceljs';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/excel/products
router.get('/excel/products', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = memoryStore.getProducts();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products Catalog');

    sheet.columns = [
      { header: 'Product ID', key: 'id', width: 15 },
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Purchase Price (Cost)', key: 'purchasePrice', width: 20 },
      { header: 'Selling Price', key: 'sellingPrice', width: 18 },
      { header: 'Tax Rate (%)', key: 'taxRate', width: 14 },
      { header: 'Price Inc. Tax', key: 'priceWithTax', width: 18 },
      { header: 'Current Stock', key: 'currentStock', width: 15 },
      { header: 'Min Stock Level', key: 'minStockLevel', width: 16 },
      { header: 'Unit', key: 'unit', width: 10 }
    ];

    // Style Header Row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

    products.forEach(p => {
      const taxAmount = p.sellingPrice * (p.taxRate / 100);
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
        unit: p.unit
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Products_Catalog_Report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate Excel report.' });
  }
});

// GET /api/reports/excel/sales
router.get('/excel/sales', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sales = memoryStore.getSales(req.user!);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Ledger');

    sheet.columns = [
      { header: 'Invoice #', key: 'invoiceNumber', width: 20 },
      { header: 'Date', key: 'createdAt', width: 20 },
      { header: 'Partner Name', key: 'partnerName', width: 25 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Total Revenue (Excl. Tax)', key: 'totalRevenue', width: 24 },
      { header: 'Cost of Goods', key: 'totalCost', width: 18 },
      { header: 'Gross Profit', key: 'totalGrossProfit', width: 18 },
      { header: 'Tax Amount', key: 'totalTax', width: 16 },
      { header: 'Grand Total', key: 'grandTotal', width: 18 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };

    sales.forEach(s => {
      sheet.addRow({
        invoiceNumber: s.invoiceNumber,
        createdAt: new Date(s.createdAt).toLocaleString(),
        partnerName: s.partnerName,
        customerName: s.customerName,
        totalRevenue: s.totalRevenue,
        totalCost: s.totalCost,
        totalGrossProfit: s.totalGrossProfit,
        totalTax: s.totalTax,
        grandTotal: s.grandTotal,
        paymentMethod: s.paymentMethod
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Sales_Ledger_Report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate Excel sales report.' });
  }
});

export default router;
