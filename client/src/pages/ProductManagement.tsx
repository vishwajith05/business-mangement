import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Beef, 
  Calculator, 
  X, 
  AlertCircle,
  Download,
  Flame,
  Snowflake,
  Layers,
  History
} from 'lucide-react';
import { productsAPI, reportsAPI, inventoryAPI } from '../api';
import { Product, StockLog } from '../types';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  // Product History Log Modal State
  const [showProductHistoryModal, setShowProductHistoryModal] = useState(false);
  const [productLogs, setProductLogs] = useState<StockLog[]>([]);
  const [historyTargetProduct, setHistoryTargetProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Beef',
    meatCategory: 'Beef' as 'Beef' | 'Poultry' | 'Lamb' | 'Pork' | 'Seafood',
    cutType: 'Ribeye Steak',
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
    storageTemp: '+2°C Chilled',
    description: '',
    purchasePrice: 900,
    sellingPrice: 1500,
    taxRate: 12,
    currentStock: 50,
    minStockLevel: 10,
    unit: 'kg'
  });

  const categories = ['All', 'Beef', 'Poultry', 'Lamb', 'Pork', 'Seafood'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll(categoryFilter, search);
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, search]);

  const handleViewProductQuantityHistory = async (product: Product) => {
    try {
      setHistoryTargetProduct(product);
      const logs = await inventoryAPI.getLogs(product.id);
      setProductLogs(logs);
      setShowProductHistoryModal(true);
    } catch (err) {
      console.error('Failed to fetch product quantity logs:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-MEAT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Beef',
      meatCategory: 'Beef',
      cutType: 'Ribeye Steak',
      imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
      storageTemp: '+2°C Chilled',
      description: '',
      purchasePrice: 900,
      sellingPrice: 1500,
      taxRate: 12,
      currentStock: 50,
      minStockLevel: 10,
      unit: 'kg'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      meatCategory: (p.meatCategory || p.category) as any,
      cutType: p.cutType || 'Fresh Cut',
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80',
      storageTemp: p.storageTemp || '+2°C Chilled',
      description: p.description || '',
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      taxRate: p.taxRate,
      currentStock: p.currentStock,
      minStockLevel: p.minStockLevel,
      unit: p.unit
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
      } else {
        await productsAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save product.');
    }
  };

  const handleDelete = async () => {
    if (!deleteProductCandidate) return;
    try {
      await productsAPI.delete(deleteProductCandidate.id);
      setDeleteProductCandidate(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  // Live Auto-Calculation for Tax & Total Price
  const calcTaxAmount = (formData.sellingPrice * formData.taxRate) / 100;
  const calcPriceWithTax = formData.sellingPrice + calcTaxAmount;
  const calcProfitMargin = formData.sellingPrice - formData.purchasePrice;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Beef className="w-6 h-6 text-red-500" />
            <span>Raw Meat Master Catalog</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">Manage fresh meat inventory, cut specs, cold storage temperature specs &amp; pricing</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => reportsAPI.downloadProductsExcel()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Excel Catalog</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Raw Cut</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search raw meats by Name (Wagyu, Chicken, Lamb), SKU, or Cut..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-amber-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-bold text-stone-200 bg-stone-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat} Selection</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid & Table View */}
      <div className="glass-panel rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900/90 border-b border-stone-800 text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Meat Cut / SKU</th>
                <th className="py-3.5 px-4">Category &amp; Cut</th>
                <th className="py-3.5 px-4">Cold Storage</th>
                <th className="py-3.5 px-4">Purchase Price</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Price Inc. Tax</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500 font-semibold">
                    Loading raw meat catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500 font-semibold">
                    No meat products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=120&h=120&q=80'} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-red-900/30"
                        />
                        <div>
                          <p className="font-extrabold text-white text-sm">{p.name}</p>
                          <p className="text-[10px] font-mono text-red-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-stone-900 text-amber-300 border border-stone-700">
                          {p.category}
                        </span>
                        {p.cutType && <p className="text-[10px] text-stone-400 font-medium">{p.cutType}</p>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        <Snowflake className="w-3 h-3 text-cyan-400" />
                        {p.storageTemp || '+2°C Chilled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      ₹{p.purchasePrice.toLocaleString()} / {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-extrabold">
                      ₹{p.sellingPrice.toLocaleString()} / {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-red-300 font-extrabold bg-red-950/20">
                      ₹{p.priceWithTax?.toLocaleString() || (p.sellingPrice * (1 + p.taxRate / 100)).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        p.currentStock === 0
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                          : p.currentStock <= p.minStockLevel
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                      }`}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewProductQuantityHistory(p)}
                          className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/60 border border-amber-800/40 transition-colors flex items-center gap-1 text-[10px] font-extrabold px-2"
                          title="View Product Quantity Movement Records"
                        >
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          <span>Quantity Log</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
                          title="Edit Meat Cut Specs"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProductCandidate(p)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Cut"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full border border-red-600/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="text-lg font-black text-white">
                {editingProduct ? `Edit Raw Cut (${editingProduct.sku})` : 'Add New Meat Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Meat Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. A5 Wagyu Striploin Cut"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-BEEF-WAGYU"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, meatCategory: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-stone-900"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Cut Specification</label>
                  <input
                    type="text"
                    value={formData.cutType}
                    onChange={(e) => setFormData({ ...formData, cutType: e.target.value })}
                    placeholder="e.g. Ribeye, Boneless Breast, Chops"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Cold Storage Temp</label>
                  <select
                    value={formData.storageTemp}
                    onChange={(e) => setFormData({ ...formData, storageTemp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-stone-900"
                  >
                    <option value="+2°C Chilled">+2°C Fresh Chilled</option>
                    <option value="-18°C Frozen">-18°C Deep Frozen</option>
                    <option value="-24°C Cryo">-24°C Cryo Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Purchase Price (Cost) ₹ *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Selling Price (Excl. Tax) ₹ *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Tax Rate (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Unit of Measure (kg/lbs/units)</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, lbs, units, tray"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    {editingProduct ? 'Current Stock Quantity' : 'Initial Stock Quantity'} ({formData.unit || 'kg'}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-400"
                    placeholder="e.g. 100"
                  />
                  {!editingProduct && (
                    <p className="text-[10px] text-stone-500 mt-1">This sets the opening stock when the product is created.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Min Reorder Level ({formData.unit || 'kg'})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    placeholder="e.g. 10"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Alert triggers when stock falls below this level.</p>
                </div>
              </div>

              {/* Automatic Tax & Price Calculator Preview Box */}
              <div className="p-4 rounded-2xl bg-stone-900 border border-red-900/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  <span>Automatic Price &amp; Tax Calculator</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-stone-400">Base Selling Price:</span>
                    <p className="font-bold text-white">₹{formData.sellingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Tax Amount ({formData.taxRate}%):</span>
                    <p className="font-bold text-amber-300">+ ₹{calcTaxAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Price Including Tax:</span>
                    <p className="font-black text-red-400 text-sm">₹{calcPriceWithTax.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                  Gross Profit Margin: <span className="font-extrabold text-emerald-400">₹{calcProfitMargin.toLocaleString()} per {formData.unit}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes on marbling grade, organic origin, butchery cut instructions..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-900/40"
                >
                  {editingProduct ? 'Update Meat Cut' : 'Save Meat Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductCandidate && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-rose-600/40 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Meat Product?</h3>
            <p className="text-xs text-stone-300 my-2">
              Are you sure you want to delete <span className="font-bold text-white">{deleteProductCandidate.name}</span> ({deleteProductCandidate.sku})?
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setDeleteProductCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Quantity Movement Log Modal */}
      {showProductHistoryModal && historyTargetProduct && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-4xl w-full border border-red-600/30 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Quantity Records: {historyTargetProduct.name} ({historyTargetProduct.sku})</span>
                </h2>
                <p className="text-xs text-stone-400">Audit trail of all additions, removals, and sales deductions</p>
              </div>
              <button onClick={() => setShowProductHistoryModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900/90 border-b border-stone-800 text-[10px] font-extrabold text-stone-400 uppercase">
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Qty Changed</th>
                    <th className="py-2.5 px-3">Stock Before ➔ After</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {productLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500 font-semibold">
                        No quantity changes recorded for this item yet.
                      </td>
                    </tr>
                  ) : (
                    productLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-800/40">
                        <td className="py-2.5 px-3 text-stone-400 font-mono text-[10px]">
                          {new Date(log.createdAt).toLocaleString()}
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
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged} {historyTargetProduct.unit}
                        </td>
                        <td className="py-2.5 px-3 text-stone-300 font-mono">
                          {log.previousStock} &rarr; <span className="font-bold text-white">{log.newStock}</span> {historyTargetProduct.unit}
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
                onClick={() => setShowProductHistoryModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
