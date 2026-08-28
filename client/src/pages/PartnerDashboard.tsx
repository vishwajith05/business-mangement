import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Boxes, 
  TrendingUp, 
  Plus, 
  Search, 
  Lock, 
  UserCheck,
  CheckCircle2,
  Sliders,
  Flame,
  Snowflake,
  Beef
} from 'lucide-react';
import { salesAPI, productsAPI, inventoryAPI } from '../api';
import { Sale, Product, User } from '../types';

interface PartnerDashboardProps {
  currentUser: User;
  onOpenNewSale: () => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ currentUser, onOpenNewSale }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCatalog, setSearchCatalog] = useState('');

  // Stock Adjustment for Partners with Edit Access
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qtyValue, setQtyValue] = useState(10);
  const [reasonNote, setReasonNote] = useState('');

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      const [mySales, catalogData] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll()
      ]);
      setSales(mySales);
      setProducts(catalogData.products);
    } catch (err) {
      console.error('Failed to load partner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  const handlePartnerStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await inventoryAPI.adjustStock(selectedProduct.id, qtyValue, 'ADD', reasonNote || 'Partner Meat Shipment Receipt');
      setSelectedProduct(null);
      loadPartnerData();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Stock adjustment failed.');
    }
  };

  const totalMySales = sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const myOrdersCount = sales.length;

  const filteredCatalog = products.filter(p => 
    p.name.toLowerCase().includes(searchCatalog.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    p.category.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-red-900/30 bg-gradient-to-r from-red-950/50 via-stone-900 to-amber-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="text-xl font-black text-white">{currentUser.name} Wholesale Portal</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
              {currentUser.role} ROLE • {currentUser.partnerRegion || 'North Zone'}
            </span>
          </div>
          <p className="text-xs text-stone-300 mt-1">
            Cold Stock Control Access: <span className="font-bold text-white">{currentUser.canEditStock ? 'Full Edit Access Granted' : 'Read-Only Catalog Mode'}</span>
          </p>
        </div>

        <button
          onClick={onOpenNewSale}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Wholesale POS Order</span>
        </button>
      </div>

      {/* Partner Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">My Outlet Sales Revenue</span>
            <p className="text-2xl font-black text-white mt-1">₹{totalMySales.toLocaleString()}</p>
            <span className="text-[11px] text-amber-400 font-semibold">Isolated to your transactions</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Completed Wholesale Orders</span>
            <p className="text-2xl font-black text-white mt-1">{myOrdersCount}</p>
            <span className="text-[11px] text-emerald-400 font-semibold">PDF Invoices generated</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Assigned Stock Level</span>
            <p className="text-sm font-bold text-stone-200 mt-1">
              {currentUser.canEditStock ? 'Edit Stock Access Granted' : 'Read-Only Catalog Mode'}
            </p>
            <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1 font-semibold">
              {currentUser.canEditStock ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              {currentUser.canEditStock ? 'Cold stock edits active' : 'Admin controlled'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Available Stock Catalog View */}
      <div className="glass-panel p-6 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Beef className="w-5 h-5 text-red-500" />
              <span>Available Raw Meat Catalog</span>
            </h2>
            <p className="text-xs text-stone-400">Live meat stock level, temperature specs &amp; pricing</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search raw meats catalog..."
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {filteredCatalog.map((item) => (
            <div key={item.id} className="p-4 rounded-xl glass-card border border-stone-800 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl overflow-hidden mb-2 border border-red-900/30">
                  <img 
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80'} 
                    alt={item.name} 
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-stone-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                    <Snowflake className="w-3 h-3 text-cyan-400" />
                    {item.storageTemp || '+2°C Chilled'}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-red-400 font-bold">{item.sku}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-amber-300 font-bold border border-stone-800">{item.category}</span>
                </div>
                <h3 className="font-extrabold text-white text-xs line-clamp-1">{item.name}</h3>
                <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400">Selling Price:</span>
                    <p className="font-extrabold text-amber-400">₹{item.sellingPrice.toLocaleString()} / {item.unit}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    item.currentStock === 0
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                      : item.currentStock <= item.minStockLevel
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                  }`}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>

                {currentUser.canEditStock && (
                  <button
                    onClick={() => setSelectedProduct(item)}
                    className="w-full py-1.5 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-900/60 border border-red-700/40 font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Quick Add Stock</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Stock Adjustment Modal */}
      {selectedProduct && currentUser.canEditStock && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-red-600/40">
            <h3 className="text-base font-black text-white mb-1">Add Stock to {selectedProduct.name}</h3>
            <p className="text-xs text-stone-400 font-mono mb-4">SKU: {selectedProduct.sku}</p>

            <form onSubmit={handlePartnerStockAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Quantity ({selectedProduct.unit}) to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qtyValue}
                  onChange={(e) => setQtyValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Receipt Note / Batch No.</label>
                <input
                  type="text"
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder="e.g. Cold truck shipment receipt"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-extrabold text-xs"
                >
                  Confirm Stock Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
