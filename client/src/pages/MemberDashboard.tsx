import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  UserCheck, 
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { inventoryAPI, productsAPI } from '../api';
import { Product, User } from '../types';

interface MemberDashboardProps {
  currentUser: User;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const assignedCategory = currentUser.assignedCategory || 'All';

  useEffect(() => {
    const fetchMemberInventory = async () => {
      setLoading(true);
      try {
        const data = await productsAPI.getAll(assignedCategory !== 'All' ? assignedCategory : undefined);
        setProducts(data.products);
      } catch (err) {
        console.error('Failed to fetch member inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberInventory();
  }, [assignedCategory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-white">{currentUser.name} Portal</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              MEMBER ROLE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">Assigned Stock Scope: <span className="font-bold text-indigo-400">{assignedCategory}</span></p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400">Permissions:</span>
          <span className="font-bold text-white">{currentUser.canEditStock ? 'Read & Edit Stock' : 'Read-Only Assigned Stock'}</span>
        </div>
      </div>

      {/* Member Assigned Inventory Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-400" />
              <span>Assigned Inventory Catalog ({assignedCategory})</span>
            </h2>
            <p className="text-xs text-slate-400">Live stock view restricted to assigned member scope</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assigned stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Price Inc. Tax</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">Loading assigned inventory...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No stock found in assigned category.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{p.sku}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{p.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-white">{p.currentStock}</span> <span className="text-[10px] text-slate-400">{p.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">₹{p.sellingPrice.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-indigo-300 font-bold">₹{p.priceWithTax?.toLocaleString() || (p.sellingPrice * (1 + p.taxRate / 100)).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.currentStock === 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : p.currentStock <= p.minStockLevel
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.currentStock === 0 ? 'OUT OF STOCK' : p.currentStock <= p.minStockLevel ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
