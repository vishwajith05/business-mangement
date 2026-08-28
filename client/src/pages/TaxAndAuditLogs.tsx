import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  ShieldCheck, 
  Search, 
  FileText, 
  Clock, 
  DollarSign, 
  Building2, 
  UserCheck,
  Beef,
  Flame
} from 'lucide-react';
import { analyticsAPI, salesAPI } from '../api';
import { AuditLog, Sale } from '../types';

export const TaxAndAuditLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tax' | 'audit'>('tax');
  const [sales, setSales] = useState<Sale[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salesData, auditData] = await Promise.all([
          salesAPI.getAll(),
          analyticsAPI.getAuditLogs()
        ]);
        setSales(salesData);
        setAuditLogs(auditData);
      } catch (err) {
        console.error('Failed to load tax or audit data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTaxCollected = sales.reduce((acc, s) => acc + s.totalTax, 0);
  const totalTaxableRevenue = sales.reduce((acc, s) => acc + s.totalRevenue, 0);

  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    s.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAudit = auditLogs.filter(a => 
    a.action.toLowerCase().includes(search.toLowerCase()) || 
    a.details.toLowerCase().includes(search.toLowerCase()) ||
    a.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Beef className="w-6 h-6 text-red-500" />
            <span>AAS Foods Tax Reports &amp; Audit Logs</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">Meat VAT collection ledger &amp; partner system security trail</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-lg font-extrabold transition-all ${
              activeTab === 'tax'
                ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Meat Tax Ledger (VAT)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg font-extrabold transition-all ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            System Audit Trail
          </button>
        </div>
      </div>

      {activeTab === 'tax' ? (
        <div className="space-y-6">
          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-stone-800">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Tax Collected (VAT)</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">₹{totalTaxCollected.toLocaleString()}</p>
              <span className="text-[11px] text-stone-400 font-semibold">Separate tax collection ledger</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-stone-800">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Taxable Wholesale Revenue</span>
              <p className="text-2xl font-black text-white mt-1">₹{totalTaxableRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-stone-400 font-semibold">Total raw meat sales base</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-stone-800">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Effective VAT Rate</span>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {totalTaxableRevenue > 0 ? ((totalTaxCollected / totalTaxableRevenue) * 100).toFixed(1) : 0}%
              </p>
              <span className="text-[11px] text-stone-400 font-semibold">Average food tax bracket</span>
            </div>
          </div>

          {/* Tax Table */}
          <div className="glass-panel rounded-2xl border border-stone-800 overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white">Wholesale Meat Tax Transaction Ledger</h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter invoice or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900/90 border-b border-stone-800 text-[10px] font-extrabold text-stone-400 uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Partner Outlet</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal (Excl. Tax)</th>
                  <th className="py-3 px-4">Tax (VAT)</th>
                  <th className="py-3 px-4">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-red-400">{s.invoiceNumber}</td>
                    <td className="py-3 px-4 text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-amber-300 font-bold">{s.partnerName}</td>
                    <td className="py-3 px-4 font-bold text-white">{s.customerName}</td>
                    <td className="py-3 px-4 text-stone-300">₹{s.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">+₹{s.totalTax.toLocaleString()}</td>
                    <td className="py-3 px-4 font-black text-red-300">₹{s.grandTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Section */
        <div className="glass-panel p-6 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span>Security &amp; Partner Activity Audit Logs</span>
              </h2>
              <p className="text-xs text-stone-400">Timestamped record of admin configuration &amp; partner stock operations</p>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredAudit.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-stone-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-amber-400 font-bold mt-1 inline-block">User: {log.userName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
