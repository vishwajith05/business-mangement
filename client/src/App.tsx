import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductManagement } from './pages/ProductManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { SalesAndInvoices } from './pages/SalesAndInvoices';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { AccountManagement } from './pages/AccountManagement';
import { TaxAndAuditLogs } from './pages/TaxAndAuditLogs';
import { Settings } from './pages/Settings';
import { authAPI } from './api';
import { User, UserRole } from './types';
import { Beef, Flame } from 'lucide-react';
import { NotificationToast } from './components/NotificationToast';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('aas_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await authAPI.getMe();
        setUser(u);
        setActiveTab(u.role === 'ADMIN' ? 'dashboard' : 'partner-dashboard');
      } catch (err) {
        localStorage.removeItem('aas_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    setActiveTab(loggedInUser.role === 'ADMIN' ? 'dashboard' : 'partner-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('aas_auth_token');
    setUser(null);
  };

  const handleQuickSwitchUser = async (targetRole: UserRole) => {
    let email = 'admin@business.com';
    let pass = 'admin123';

    if (targetRole === 'PARTNER') {
      email = 'partner1@business.com';
      pass = 'partner123';
    }

    try {
      const data = await authAPI.login(email, pass);
      localStorage.setItem('aas_auth_token', data.token);
      setUser(data.user);
      setActiveTab(data.user.role === 'ADMIN' ? 'dashboard' : 'partner-dashboard');
    } catch (err) {
      console.error('Quick switch user failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-900/30 text-red-400 border border-red-800/50 flex items-center justify-center animate-pulse">
            <Beef className="w-9 h-9" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white tracking-tight">AAS Foods</p>
            <p className="text-xs font-mono text-red-400/70 mt-1">Initializing Wholesale Management Platform...</p>
          </div>
          <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'ADMIN';

  // Role Routing Guard
  let activeContentTab = activeTab;
  if (!isAdmin && ['dashboard', 'products', 'accounts', 'tax-audit', 'settings'].includes(activeTab)) {
    activeContentTab = 'partner-dashboard';
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex">
      <NotificationToast user={user} />
      <Sidebar
        user={user}
        activeTab={activeContentTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <header className="mb-6 flex items-center justify-between pb-4 border-b border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-800/50 flex items-center justify-center">
              <Beef className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 font-mono">AAS Foods / {activeContentTab.replace(/-/g, ' ')}</span>
              <h2 className="text-base font-bold text-white tracking-tight">AAS Foods — Wholesale Management</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2 text-xs">
              <span className="text-stone-500">Signed in as:</span>
              <span className="font-bold text-white">{user.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isAdmin ? 'bg-red-900/40 text-red-300 border border-red-800/50' : 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* View Router */}
        {activeContentTab === 'dashboard' && <AdminDashboard />}
        {activeContentTab === 'products' && <ProductManagement />}
        {activeContentTab === 'inventory' && <InventoryManagement />}
        {activeContentTab === 'inventory-view' && <InventoryManagement />}
        {activeContentTab === 'accounts' && <AccountManagement />}
        {activeContentTab === 'sales' && <SalesAndInvoices currentUser={user} />}
        {activeContentTab === 'partner-dashboard' && (
          <PartnerDashboard
            currentUser={user}
            onOpenNewSale={() => setActiveTab('sales')}
          />
        )}
        {activeContentTab === 'tax-audit' && <TaxAndAuditLogs />}
        {activeContentTab === 'settings' && <Settings />}
      </main>
    </div>
  );
};

export default App;
