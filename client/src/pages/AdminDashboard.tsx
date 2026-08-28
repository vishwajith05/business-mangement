import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Beef, 
  Boxes, 
  AlertTriangle, 
  XCircle, 
  Receipt, 
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  Flame,
  Snowflake
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { analyticsAPI, reportsAPI } from '../api';
import { AnalyticsResponse } from '../types';

export const AdminDashboard: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'last6months' | 'year' | 'custom'>('month');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await analyticsAPI.getDashboard(dateFilter);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-stone-400">Loading AAS Foods Executive Analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, charts } = data;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header & Date Range Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500" />
              <span>AAS Foods Executive Dashboard</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-600/40">
              Live Meat Ledger
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">Real-time oversight of Raw Meat Sales, Gross Profit, Cold Storage Stock &amp; Partner Network</p>
        </div>

        {/* Date Filter & Export Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs">
            {(['today', 'week', 'month', 'last6months', 'year'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setDateFilter(preset)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dateFilter === preset
                    ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {preset === 'today' ? 'Today' : preset === 'week' ? 'This Week' : preset === 'month' ? 'This Month' : preset === 'last6months' ? 'Last 6M' : 'This Year'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 rounded-xl glass-panel text-stone-400 hover:text-white border border-stone-800 hover:border-stone-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => reportsAPI.downloadSalesExcel()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-amber-900/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Wholesale Sales"
          value={`₹${kpis.totalSales.value.toLocaleString()}`}
          trend={kpis.totalSales.trend}
          isUp={kpis.totalSales.isUp}
          icon={DollarSign}
          accentColor="rose"
        />
        <KPICard
          title="Total Gross Profit"
          value={`₹${kpis.totalProfit.value.toLocaleString()}`}
          trend={kpis.totalProfit.trend}
          isUp={kpis.totalProfit.isUp}
          icon={TrendingUp}
          accentColor="emerald"
        />
        <KPICard
          title="Wholesale Orders"
          value={kpis.totalOrders.value}
          trend={kpis.totalOrders.trend}
          isUp={kpis.totalOrders.isUp}
          icon={ShoppingBag}
          accentColor="amber"
        />
        <KPICard
          title="Raw Meat SKUs"
          value={kpis.totalProducts.value}
          suffix="Cuts"
          icon={Beef}
          accentColor="rose"
        />
        <KPICard
          title="Cold Stock Inventory"
          value={kpis.currentStock.value}
          suffix="kg/units"
          trend={kpis.currentStock.trend}
          isUp={kpis.currentStock.isUp}
          icon={Boxes}
          accentColor="blue"
        />
        <KPICard
          title="Low Stock Cuts"
          value={kpis.lowStockItems.value}
          suffix="SKUs"
          statusText={kpis.lowStockItems.value > 0 ? `${kpis.lowStockItems.value} Reorder Alert` : 'Optimal'}
          statusType={kpis.lowStockItems.value > 0 ? 'warning' : 'ok'}
          icon={AlertTriangle}
          accentColor="amber"
        />
        <KPICard
          title="Out of Stock Cuts"
          value={kpis.outOfStockItems.value}
          suffix="SKUs"
          statusText={kpis.outOfStockItems.value > 0 ? `${kpis.outOfStockItems.value} Restock Needed` : 'None'}
          statusType={kpis.outOfStockItems.value > 0 ? 'danger' : 'ok'}
          icon={XCircle}
          accentColor="rose"
        />
        <KPICard
          title="Meat Tax Collected"
          value={`₹${kpis.taxCollected.value.toLocaleString()}`}
          trend={kpis.taxCollected.trend}
          isUp={kpis.taxCollected.isUp}
          icon={Receipt}
          accentColor="emerald"
        />
      </div>

      {/* Recharts Analytics Section 1: Sales & Profit Trend + Stock Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Sales & Profit Trend (Area Chart) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Revenue &amp; Gross Profit Timeline</span>
                <span className="text-[10px] text-red-400 font-mono bg-red-950/60 border border-red-600/30 px-2 py-0.5 rounded-full">
                  Cold Chain Analytics
                </span>
              </h2>
              <p className="text-xs text-stone-400">Financial performance of wholesale meat shipments</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesAndProfitTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="date" stroke="#78716C" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716C" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Sales" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
                <Area type="monotone" dataKey="Cost" stroke="#A8A29E" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Stock Status Donut */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white mb-1">Meat Cut Inventory Health</h2>
            <p className="text-xs text-stone-400 mb-4">Stock distribution by status</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.stockStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.stockStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1C1917" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-2xl font-black text-white">{data.kpis.totalProducts.value}</span>
              <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Meat SKUs</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-stone-800 text-xs">
            {charts.stockStatus.map((st) => (
              <div key={st.name} className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="block font-extrabold text-white text-sm">{st.value}</span>
                <span className="text-[10px] font-bold" style={{ color: st.color }}>{st.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section 2: Sales by Partner & Sales by Product */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Sales by Partner */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-stone-800">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Wholesale Partner Performance</span>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-full">
                Partner Outlets
              </span>
            </h2>
            <p className="text-xs text-stone-400">Comparing regional wholesale partner outlets</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.salesByPartner} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="partner" stroke="#78716C" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716C" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Total Revenue" fill="#D97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sales by Product */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-stone-800">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-white">Top Selling Meat Cuts</h2>
            <p className="text-xs text-stone-400">Revenue generated by raw meat cut selection</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.salesByProduct} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                <XAxis type="number" stroke="#78716C" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#78716C" fontSize={10} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1917', borderColor: '#44403C', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 5: Profit Analysis Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AAS Foods Profit &amp; Tax Financial Ledger</span>
            </h2>
            <p className="text-xs text-stone-400">Financial breakdown of Gross Revenue, Meat Cost, Profit &amp; Tax</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {charts.profitAnalysis.map((item) => (
            <div key={item.category} className="p-4 rounded-xl glass-card border border-stone-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{item.category}</span>
              <div className="my-2">
                <span className="text-xl font-black text-white">₹{item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ backgroundColor: item.color, width: '85%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
