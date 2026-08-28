import { Router, Response } from 'express';
import PDFDocument from 'pdfkit';
import { memoryStore } from '../store/memoryStore';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/invoices/:id/pdf - Stream formatted PDF invoice
router.get('/:id/pdf', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const sale = memoryStore.getSaleById(req.params.id, req.user!);
    if (!sale) {
      return res.status(404).json({ error: 'Invoice not found or access denied.' });
    }

    const settings = memoryStore.getSettings();

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${sale.invoiceNumber}.pdf"`);

    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#1E293B').fontSize(22).text(settings.businessName, { align: 'left' });
    doc.fontSize(9).fillColor('#64748B').text(settings.tagline);
    doc.text(`VAT Reg. No.: ${settings.taxId}`);
    doc.text(`Address: ${settings.address}`);
    doc.text(`Contact: ${settings.phone} | ${settings.email}`);

    // Invoice Title Right aligned
    doc.moveUp(4);
    doc.fillColor('#4F46E5').fontSize(24).text('TAX INVOICE', { align: 'right' });
    doc.fontSize(10).fillColor('#334155').text(`Invoice #: ${sale.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, { align: 'right' });
    doc.text(`Partner: ${sale.partnerName}`, { align: 'right' });
    doc.text(`Status: ${sale.status}`, { align: 'right' });

    doc.moveDown(2);
    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // --- Bill To Section ---
    const billToY = doc.y;
    doc.fillColor('#4F46E5').fontSize(11).text('BILL TO:', 40, billToY);
    doc.fillColor('#1E293B').fontSize(11).text(sale.customerName);
    if (sale.customerEmail) doc.fontSize(9).fillColor('#475569').text(`Email: ${sale.customerEmail}`);
    if (sale.customerPhone) doc.fontSize(9).fillColor('#475569').text(`Phone: ${sale.customerPhone}`);
    doc.fontSize(9).fillColor('#475569').text(`Payment Method: ${sale.paymentMethod}`);

    doc.moveDown(2);

    // --- Table Header ---
    const tableTop = doc.y;
    doc.fillColor('#F1F5F9').rect(40, tableTop, 515, 24).fill();
    doc.fillColor('#1E293B').fontSize(10).text('Product / Item', 45, tableTop + 6);
    doc.text('Qty', 270, tableTop + 6, { width: 30, align: 'center' });
    doc.text('Unit Price', 315, tableTop + 6, { width: 70, align: 'right' });
    doc.text('Tax', 395, tableTop + 6, { width: 60, align: 'right' });
    doc.text('Total (Inc. Tax)', 465, tableTop + 6, { width: 85, align: 'right' });

    let y = tableTop + 30;

    sale.items.forEach((item) => {
      const lineTotalWithTax = item.itemSubtotal + item.taxAmount;
      
      doc.fillColor('#334155').fontSize(9).text(item.productName, 45, y, { width: 220 });
      doc.text(item.quantity.toString(), 270, y, { width: 30, align: 'center' });
      doc.text(`${settings.currencySymbol}${item.unitSellingPrice.toLocaleString()}`, 315, y, { width: 70, align: 'right' });
      doc.text(`${settings.currencySymbol}${item.taxAmount.toLocaleString()} (${item.taxRate}%)`, 395, y, { width: 60, align: 'right' });
      doc.text(`${settings.currencySymbol}${lineTotalWithTax.toLocaleString()}`, 465, y, { width: 85, align: 'right' });

      y += 20;
    });

    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
    y += 15;

    // --- Totals Summary ---
    const summaryX = 350;
    doc.fillColor('#475569').fontSize(10).text('Subtotal (Excl. Tax):', summaryX, y);
    doc.fillColor('#0F172A').text(`${settings.currencySymbol}${sale.totalRevenue.toLocaleString()}`, 465, y, { width: 85, align: 'right' });
    y += 18;

    doc.fillColor('#475569').text('Total Tax:', summaryX, y);
    doc.fillColor('#0F172A').text(`${settings.currencySymbol}${sale.totalTax.toLocaleString()}`, 465, y, { width: 85, align: 'right' });
    y += 18;

    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(summaryX, y).lineTo(555, y).stroke();
    y += 8;

    doc.fillColor('#4F46E5').fontSize(12).text('Grand Total:', summaryX, y);
    doc.fillColor('#4F46E5').fontSize(12).text(`${settings.currencySymbol}${sale.grandTotal.toLocaleString()}`, 465, y, { width: 85, align: 'right' });
    y += 35;

    // --- Footer / Terms ---
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
    y += 15;
    doc.fillColor('#64748B').fontSize(8).text(settings.invoiceFooter, 40, y, { align: 'center' });
    doc.text('This is a computer-generated invoice and requires no physical signature.', 40, y + 12, { align: 'center' });

    doc.end();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error generating PDF invoice.' });
  }
});

export default router;
