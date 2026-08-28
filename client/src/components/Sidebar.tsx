import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingBag, 
  Receipt, 
  Settings, 
  Users, 
  LogOut, 
  Beef, 
  KeyRound,
  ChevronRight,
  Flame
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onQuickSwitchUser: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onQuickSwitchUser
}) => {
  const [showDemoAccounts, setShowDemoAccounts] = React.useState(false);

  const isAdmin = user.role === 'ADMIN';

  const adminNavItems = [
    { id: 'dashboard', label: 'Admin Executive', icon: LayoutDashboard },
    { id: 'products', label: 'Raw Meat Catalog', icon: Beef },
    { id: 'inventory', label: 'Cold Stock Control', icon: Boxes },
    { id: 'accounts', label: 'Manage Partners', icon: Users },
    { id: 'sales', label: 'POS & Wholesale Orders', icon: ShoppingBag },
    { id: 'tax-audit', label: 'Tax & Audit Logs', icon: Receipt },
    { id: 'settings', label: 'Business Settings', icon: Settings }
  ];

  const partnerNavItems = [
    { id: 'partner-dashboard', label: 'Partner Hub', icon: LayoutDashboard },
    { id: 'sales', label: 'Create & View Sales', icon: ShoppingBag },
    { id: 'inventory-view', label: 'Live Stock Catalog', icon: Boxes }
  ];

  const navItems = isAdmin ? adminNavItems : partnerNavItems;

  return (
    <aside className="w-64 glass-panel border-r border-red-900/30 h-screen flex flex-col justify-between p-4 fixed left-0 top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-red-900/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-700/40">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">AAS Foods</h1>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Artisanal Raw Meat Hub</span>
          </div>
        </div>

        {/* Current User Role Badge */}
        <div className="mb-6 px-3 py-2.5 rounded-xl bg-stone-900/90 border border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <p className="text-xs font-bold text-stone-100">{user.name}</p>
              <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wide">
                {user.role} {user.partnerRegion ? `• ${user.partnerRegion}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/40 font-bold border border-red-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-amber-200" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section & Quick Switch Account Overlay */}
      <div className="pt-4 border-t border-red-900/30 space-y-3">
        <button
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-400 bg-stone-900/80 hover:bg-stone-800 rounded-lg border border-red-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch Role Account</span>
          </div>
          <span className="text-[10px] text-red-400 font-bold">{showDemoAccounts ? 'Hide' : 'Show'}</span>
        </button>

        {showDemoAccounts && (
          <div className="p-2 rounded-xl bg-stone-950 border border-red-600/30 space-y-1 animate-fade-in">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">Quick Switch Role:</p>
            <button
              onClick={() => onQuickSwitchUser('ADMIN')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                user.role === 'ADMIN' ? 'bg-red-700/40 text-red-300 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              🥩 Admin (Full Management)
            </button>
            <button
              onClick={() => onQuickSwitchUser('PARTNER')}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                user.role === 'PARTNER' ? 'bg-red-700/40 text-amber-300 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              🤝 Partner Account
            </button>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-800/40 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
