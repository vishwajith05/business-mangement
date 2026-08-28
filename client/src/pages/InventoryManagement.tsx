import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  PlusCircle, 
  MinusCircle, 
  Sliders, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  X,
  Search,
  RefreshCw,
  Beef,
  Snowflake,
  Flame
} from 'lucide-react';
import { inventoryAPI } from '../api';
import { StockLog } from '../types';

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stock Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [changeType, setChangeType] = useState<'ADD' | 'REMOVE' | 'ADJUST'>('ADD');
  const [quantityValue, setQuantityValue] = useState(10);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // History Log Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [historyTargetName, setHistoryTargetName] = useState<string>('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getInventory();
      setInventory(data.inventory);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdjustModal = (item: any, defaultType: 'ADD' | 'REMOVE' | 'ADJUST') => {
    setSelectedProduct(item);
    setChangeType(defaultType);
    setQuantityValue(defaultType === 'ADJUST' ? item.currentStock : 10);
    setReason('');
    setErrorMsg(null);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMsg(null);

    try {
      await inventoryAPI.adjustStock(
        selectedProduct.productId,
        quantityValue,
        changeType,
        reason || `Cold Stock ${changeType} Action`
      );
      setSelectedProduct(null);
      fetchInventory();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Stock adjustment failed.');
    }
  };

  const handleViewHistory = async (item?: any) => {
    try {
      const productId = item ? item.productId : undefined;
      setHistoryTargetName(item ? `${item.name} (${item.sku})` : 'All Meat Cuts Stock Movements');
      const data = await inventoryAPI.getLogs(productId);
      setLogs(data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Beef className="w-6 h-6 text-red-500" />
            <span>AAS Foods Cold Storage Inventory</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">Real-time raw meat stock audit, cold storage alerts &amp; movement history</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleViewHistory()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-bold text-xs transition-colors"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Meat Audit History</span>
          </button>
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl glass-panel text-stone-400 hover:text-white border border-stone-800"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search raw meat inventory by Cut Name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs">
          {['ALL', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Inventory Table */}
      <div className="glass-panel rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900/90 border-b border-stone-800 text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Raw Meat Cut</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Cold Stock</th>
                <th className="py-3.5 px-4">Cost / Unit</th>
                <th className="py-3.5 px-4">Selling / Unit</th>
                <th className="py-3.5 px-4">Tax (VAT)</th>
                <th className="py-3.5 px-4">Price Inc. Tax</th>
                <th className="py-3.5 px-4">Min Reorder</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Admin Cold Stock Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-stone-500 font-semibold">
                    Loading cold storage records...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-stone-500 font-semibold">
                    No raw meat records match filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.productId} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-red-400 font-bold">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-bold">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-white">
                        {item.currentStock}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-1 font-semibold">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      ₹{item.purchasePrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      ₹{item.sellingPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      ₹{item.taxAmount.toLocaleString()} ({item.taxRate}%)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-300">
                      ₹{item.priceWithTax.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {item.minStockLevel} {item.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        item.status === 'OUT OF STOCK'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40'
                          : item.status === 'LOW STOCK'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                      }`}>
                        {item.status === 'OUT OF STOCK' && <XCircle className="w-3 h-3" />}
                        {item.status === 'LOW STOCK' && <AlertTriangle className="w-3 h-3" />}
                        {item.status === 'IN STOCK' && <CheckCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAdjustModal(item, 'ADD')}
                          className="px-2 py-1 rounded-md bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-600/40 font-extrabold text-[11px] flex items-center gap-1"
                          title="Add Stock"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjustModal(item, 'REMOVE')}
                          className="px-2 py-1 rounded-md bg-rose-950/50 text-rose-300 hover:bg-rose-900/60 border border-rose-600/40 font-extrabold text-[11px] flex items-center gap-1"
                          title="Remove Stock"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                        <button
                          onClick={() => handleOpenAdjustModal(item, 'ADJUST')}
                          className="px-2 py-1 rounded-md bg-red-950/50 text-red-300 hover:bg-red-900/60 border border-red-600/40 font-extrabold text-[11px] flex items-center gap-1"
                          title="Adjust Exact Stock"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Set</span>
                        </button>
                        <button
                          onClick={() => handleViewHistory(item)}
                          className="p-1 text-stone-400 hover:text-white"
                          title="View History Logs"
                        >
                          <History className="w-4 h-4" />
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

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-red-600/30">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-base font-black text-white">Cold Storage Stock Control</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-xl bg-stone-900 border border-stone-800">
              <p className="text-xs font-black text-white">{selectedProduct.name}</p>
              <p className="text-[11px] font-mono text-red-400">SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.currentStock} {selectedProduct.unit}</p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChangeType('ADD')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      changeType === 'ADD'
                        ? 'bg-emerald-700 text-white border-emerald-500'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    + Add Cuts
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangeType('REMOVE')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      changeType === 'REMOVE'
                        ? 'bg-rose-700 text-white border-rose-500'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    - Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangeType('ADJUST')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      changeType === 'ADJUST'
                        ? 'bg-red-700 text-white border-red-500'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    = Set Total
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  {changeType === 'ADJUST' ? 'New Cold Stock Count' : 'Quantity to Adjust'} ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Reason / Batch Ref No.</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Shipment receipt Batch #AAS-881"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Live Quantity Preview */}
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-700/60 space-y-1.5">
                <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Quantity Record Preview</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Current Stock</span>
                  <span className="font-bold text-white font-mono">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">
                    {changeType === 'ADD' ? '+ Adding' : changeType === 'REMOVE' ? '− Removing' : '= Setting to'}
                  </span>
                  <span className={`font-bold font-mono ${changeType === 'ADD' ? 'text-emerald-400' : changeType === 'REMOVE' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {changeType === 'ADD' ? '+' : changeType === 'REMOVE' ? '-' : '='}{quantityValue} {selectedProduct.unit}
                  </span>
                </div>
                <div className="border-t border-stone-700/60 pt-1.5 flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-bold">Stock After Submission</span>
                  <span className="font-black text-amber-300 font-mono text-sm">
                    {changeType === 'ADD'
                      ? selectedProduct.currentStock + quantityValue
                      : changeType === 'REMOVE'
                        ? Math.max(0, selectedProduct.currentStock - quantityValue)
                        : quantityValue} {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-extrabold text-xs"
                >
                  Save Stock Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log Drawer Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-3xl w-full border border-red-600/30 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-base font-black text-white">{historyTargetName}</h2>
                <p className="text-xs text-stone-400">Complete audit trail of all raw meat stock adjustments</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900/90 border-b border-stone-800 text-[10px] font-extrabold text-stone-400 uppercase">
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Meat Cut</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Qty Change</th>
                    <th className="py-2.5 px-3">Prev -&gt; New Stock</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500 font-semibold">No meat stock history recorded yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
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
                            {log.changeType}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${log.quantityChanged > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                        </td>
                        <td className="py-2.5 px-3 text-stone-300">
                          {log.previousStock} &rarr; <span className="font-bold text-white">{log.newStock}</span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-400">
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
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl font-bold text-xs"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
