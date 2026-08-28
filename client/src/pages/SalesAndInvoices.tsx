import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  FileText, 
  Download, 
  Search, 
  User as UserIcon, 
  Calendar, 
  CheckCircle2, 
  X, 
  Trash2,
  DollarSign,
  Receipt,
  Beef,
  Flame,
  History
} from 'lucide-react';
import { salesAPI, productsAPI, reportsAPI, inventoryAPI } from '../api';
import { Sale, Product, User, StockLog } from '../types';

interface SalesAndInvoicesProps {
  currentUser: User;
}

export const SalesAndInvoices: React.FC<SalesAndInvoicesProps> = ({ currentUser }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // PDF Preview Modal
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<Sale | null>(null);

  // Quantity Movement Log Modal State
  const [showQuantityLogsModal, setShowQuantityLogsModal] = useState(false);
  const [quantityLogs, setQuantityLogs] = useState<StockLog[]>([]);

  const fetchSalesAndProducts = async () => {
    setLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([
        salesAPI.getAll(partnerFilter !== 'ALL' ? partnerFilter : undefined),
        productsAPI.getAll()
      ]);
      setSales(salesData);
      setProducts(productsData.products);
    } catch (err) {
      console.error('Failed to load sales or products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndProducts();
  }, [partnerFilter]);

  const handleOpenQuantityLogs = async () => {
    try {
      const logs = await inventoryAPI.getLogs();
      setQuantityLogs(logs);
      setShowQuantityLogsModal(true);
    } catch (err) {
      console.error('Failed to fetch stock logs:', err);
    }
  };

  const handleAddToCart = (productId: string) => {
    const existing = cartItems.find(i => i.productId === productId);
    if (existing) {
      setCartItems(cartItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(i => i.productId !== productId));
    } else {
      setCartItems(cartItems.map(i => i.productId === productId ? { ...i, quantity } : i));
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(i => i.productId !== productId));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (cartItems.length === 0) {
      setCheckoutError('Please add at least one raw meat product to the order.');
      return;
    }

    try {
      await salesAPI.create({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        items: cartItems,
        paymentMethod
      });

      setIsCheckoutOpen(false);
      setCartItems([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      fetchSalesAndProducts();
    } catch (err: any) {
      setCheckoutError(err.response?.data?.error || err.message || 'Checkout failed.');
    }
  };

  // Calculate live POS Cart totals
  const cartSummary = cartItems.map(item => {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) return null;
    const subtotal = p.sellingPrice * item.quantity;
    const tax = subtotal * (p.taxRate / 100);
    const cost = p.purchasePrice * item.quantity;
    const profit = subtotal - cost;
    return {
      product: p,
      quantity: item.quantity,
      subtotal,
      tax,
      cost,
      profit,
      totalWithTax: subtotal + tax
    };
  }).filter(Boolean);

  const cartTotalRevenue = cartSummary.reduce((acc, i) => acc + (i?.subtotal || 0), 0);
  const cartTotalTax = cartSummary.reduce((acc, i) => acc + (i?.tax || 0), 0);
  const cartGrandTotal = cartTotalRevenue + cartTotalTax;
  const cartTotalProfit = cartSummary.reduce((acc, i) => acc + (i?.profit || 0), 0);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
                          s.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          s.partnerName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Beef className="w-6 h-6 text-red-500" />
            <span>AAS Foods Wholesale Orders &amp; Invoices</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {isAdmin ? 'Manage wholesale raw meat sales across all partner outlets' : 'Create raw meat wholesale orders and generate official PDF invoices'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenQuantityLogs}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-extrabold text-xs transition-colors shadow-md shadow-red-950/40"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Quantity Movement Records</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => reportsAPI.downloadSalesExcel()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-bold text-xs transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Excel Sales Ledger</span>
            </button>
          )}

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Sale POS</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Invoice #, Customer Name, or Partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">Filter Outlet:</span>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-bold bg-stone-900"
            >
              <option value="ALL">All Outlets</option>
              <option value="u-partner-01">North Meat Outlet</option>
              <option value="u-partner-02">West Coast Meats</option>
              <option value="u-partner-03">Southern Butcher Hub</option>
            </select>
          </div>
        )}
      </div>

      {/* Sales Orders Table */}
      <div className="glass-panel rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900/90 border-b border-stone-800 text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Partner Outlet</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items &amp; Quantities Sold</th>
                <th className="py-3.5 px-4">Revenue (Excl. Tax)</th>
                <th className="py-3.5 px-4">Gross Profit</th>
                <th className="py-3.5 px-4">Tax (GST)</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4 text-right">PDF Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-500 font-semibold">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-500 font-semibold">
                    No sales orders recorded yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-bold">
                      {sale.partnerName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sale.items && sale.items.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      ₹{sale.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      +₹{sale.totalGrossProfit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      ₹{sale.totalTax.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-red-300 font-black text-sm">
                      ₹{sale.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoiceForPDF(sale)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-600/40 font-extrabold text-[11px] flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>
                        <a
                          href={salesAPI.getInvoicePDFUrl(sale.id)}
                          download={`${sale.invoiceNumber}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
                          title="Direct PDF Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Sales Order Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-4xl w-full border border-red-600/30 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-black text-white">Create AAS Foods Wholesale Order &amp; Invoice</h2>
                <p className="text-xs text-stone-400">Meat POS Checkout &amp; Automatic Stock Deduction</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-600/40 text-rose-300 text-xs font-medium">
                ⚠️ {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 overflow-y-auto pr-1">
              
              {/* Left Column: Customer Info & Meat Cut Picker */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Wholesale Customer Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">Customer / Hotel Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Grand Hyatt Kitchens"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">Payment Terms</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-stone-900"
                      >
                        <option value="Bank Transfer">Bank Transfer (15 Days)</option>
                        <option value="Cash">Cash on Delivery</option>
                        <option value="Credit Card">Corporate Credit Card</option>
                        <option value="UPI">UPI / NetBanking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">Customer Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="purchasing@hyatt.com"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Catalog Picker */}
                <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1">
                    <Beef className="w-3.5 h-3.5" /> Select Raw Meat Cuts
                  </h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {products.map((p) => {
                      const inCart = cartItems.find(i => i.productId === p.id);
                      const isOutOfStock = p.currentStock === 0;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                            isOutOfStock
                              ? 'bg-stone-950/60 border-stone-800/40 opacity-50'
                              : inCart
                                ? 'bg-red-950/40 border-red-600/40'
                                : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=100&h=100&q=80'} 
                              alt={p.name} 
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-xs font-extrabold text-white">{p.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">
                                SKU: {p.sku} | ₹{p.sellingPrice.toLocaleString()}/{p.unit} (+{p.taxRate}% Tax) | Stock: {p.currentStock} {p.unit}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(p.id)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              isOutOfStock
                                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                : 'bg-red-700 hover:bg-red-600 text-white shadow-md shadow-red-900/30'
                            }`}
                          >
                            {inCart ? `+ Add (${inCart.quantity} ${p.unit})` : 'Add Cut'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Cart Summary & Real-time Tax / Profit Calculator */}
              <div className="lg:col-span-5 glass-card p-4 rounded-2xl border border-red-900/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" />
                    <span>Order Cart Summary</span>
                  </h3>

                  {cartSummary.length === 0 ? (
                    <div className="py-12 text-center text-stone-500 text-xs font-medium">
                      Order cart is empty. Select cuts from the catalog to build order.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {cartSummary.map((item) => (
                        <div key={item!.product.id} className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-extrabold text-white">{item!.product.name}</p>
                            <p className="text-[10px] text-stone-400">₹{item!.product.sellingPrice} &times; {item!.quantity} {item!.product.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item!.product.id, item!.quantity - 1)}
                                className="px-2 py-0.5 text-stone-300 font-bold hover:text-white"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono text-white font-bold">{item!.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item!.product.id, item!.quantity + 1)}
                                className="px-2 py-0.5 text-stone-300 font-bold hover:text-white"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item!.product.id)}
                              className="text-stone-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculation Totals */}
                <div className="pt-4 border-t border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Meat Subtotal (Excl. Tax):</span>
                    <span className="font-bold text-white">₹{cartTotalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Tax (GST Total):</span>
                    <span className="font-bold text-amber-300">+ ₹{cartTotalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-800 text-sm">
                    <span className="font-black text-white">Grand Total:</span>
                    <span className="font-black text-red-400 text-base">₹{cartGrandTotal.toLocaleString()}</span>
                  </div>

                  {isAdmin && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-[11px] text-emerald-300 flex justify-between mt-2 font-bold">
                      <span>Calculated Gross Profit:</span>
                      <span>+ ₹{cartTotalProfit.toLocaleString()}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-red-900/40 transition-all disabled:opacity-50"
                  >
                    Confirm Wholesale Sale &amp; Stream PDF Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Invoice Modal Preview */}
      {selectedInvoiceForPDF && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-4xl w-full border border-red-600/30 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white">AAS Foods Official Invoice: {selectedInvoiceForPDF.invoiceNumber}</h2>
                <p className="text-xs text-stone-400">Customer: {selectedInvoiceForPDF.customerName} | Partner Outlet: {selectedInvoiceForPDF.partnerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={salesAPI.getInvoicePDFUrl(selectedInvoiceForPDF.id)}
                  download={`${selectedInvoiceForPDF.invoiceNumber}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-900/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
                <button onClick={() => setSelectedInvoiceForPDF(null)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 my-4 bg-stone-900 rounded-2xl overflow-hidden min-h-[450px]">
              <iframe
                src={salesAPI.getInvoicePDFUrl(selectedInvoiceForPDF.id)}
                className="w-full h-full min-h-[450px] border-0"
                title="PDF Invoice Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quantity Movement Records Modal */}
      {showQuantityLogsModal && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-4xl w-full border border-red-600/30 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Quantity Movement &amp; Stock Ledger Records</span>
                </h2>
                <p className="text-xs text-stone-400">Complete record of stock additions and sales deductions</p>
              </div>
              <button onClick={() => setShowQuantityLogsModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900/90 border-b border-stone-800 text-[10px] font-extrabold text-stone-400 uppercase">
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Meat Cut / Item</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Quantity Changed</th>
                    <th className="py-2.5 px-3">Stock Progression</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {quantityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500 font-semibold">
                        No quantity movement records logged yet.
                      </td>
                    </tr>
                  ) : (
                    quantityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/40">
                        <td className="py-2.5 px-3 text-stone-400 font-mono text-[10px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {log.productName || log.productId}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            log.changeType === 'ADD' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40' :
                            log.changeType === 'REMOVE' ? 'bg-rose-950 text-rose-300 border border-rose-700/40' :
                            log.changeType === 'SALE' ? 'bg-amber-950 text-amber-300 border border-amber-700/40' :
                            'bg-red-950 text-red-300 border border-red-700/40'
                          }`}>
                            {log.changeType === 'SALE' ? '🛒 SALE DEDUCTION' : log.changeType === 'ADD' ? '📥 STOCK ADDITION' : log.changeType}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-bold font-mono ${log.quantityChanged > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                        </td>
                        <td className="py-2.5 px-3 text-stone-300 font-mono">
                          {log.previousStock} &rarr; <span className="font-bold text-white">{log.newStock}</span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-400 font-medium">
                          {log.userName || log.userId}
                        </td>
                        <td className="py-2.5 px-3 text-stone-400 italic">
                          {log.reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-stone-800 text-right">
              <button
                onClick={() => setShowQuantityLogsModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
