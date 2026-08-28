import React, { useState } from 'react';
import { 
  Flame, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Beef
} from 'lucide-react';
import { authAPI } from '../api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@business.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'PARTNER' | 'ADMIN'>('PARTNER');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('aas_auth_token', data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string, demoPass: string, mode: 'PARTNER' | 'ADMIN') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoginMode(mode);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: Brand Showcase & Role Account Selector */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-red-900/40 flex flex-col justify-between bg-gradient-to-b from-red-950/40 via-stone-900/90 to-stone-950/95">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-700/40">
                <Flame className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">AAS Foods</h1>
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Artisanal Raw Meat Hub</p>
              </div>
            </div>

            <div className="mb-5 rounded-2xl overflow-hidden border border-red-900/30 relative group">
              <img 
                src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80" 
                alt="Raw Wagyu Steak" 
                className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex items-end p-3">
                <span className="text-[11px] font-extrabold text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                  <Beef className="w-3.5 h-3.5" /> Premium Fresh Cut Meats &amp; Cold Storage
                </span>
              </div>
            </div>

            {/* Quick Test Login Accounts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Select Role Portal
                </span>
                <span className="text-[10px] text-stone-400 font-mono">1-Click Login</span>
              </div>

              {/* Partner Account Option */}
              <button
                type="button"
                onClick={() => handleQuickSelect('partner1@business.com', 'partner123', 'PARTNER')}
                className={`w-full p-2.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between ${
                  email === 'partner1@business.com'
                    ? 'bg-amber-950/50 border-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🤝
                  </div>
                  <div>
                    <p className="text-xs font-bold">Partner Login (Wholesale Portal)</p>
                    <p className="text-[10px] text-stone-400 font-mono">partner1@business.com / partner123</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-amber-400" />
              </button>

              {/* Partner 2 Account Option */}
              <button
                type="button"
                onClick={() => handleQuickSelect('partner2@business.com', 'partner223', 'PARTNER')}
                className={`w-full p-2.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between ${
                  email === 'partner2@business.com'
                    ? 'bg-amber-950/50 border-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🥩
                  </div>
                  <div>
                    <p className="text-xs font-bold">Partner 2 (West Coast Meats)</p>
                    <p className="text-[10px] text-stone-400 font-mono">partner2@business.com / partner223</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-amber-400" />
              </button>

              {/* Admin Account Option */}
              <button
                type="button"
                onClick={() => handleQuickSelect('admin@business.com', 'admin123', 'ADMIN')}
                className={`w-full p-2.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between ${
                  email === 'admin@business.com'
                    ? 'bg-red-950/50 border-red-600 text-white shadow-md shadow-red-900/30'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                    👑
                  </div>
                  <div>
                    <p className="text-xs font-bold">Admin Portal (System Management)</p>
                    <p className="text-[10px] text-stone-400 font-mono">admin@business.com / admin123</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-red-900/30 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> AAS Auth Protection
            </span>
            <span>Cold Chain Ledger</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 glass-panel p-8 rounded-3xl border border-stone-800 flex flex-col justify-center">
          
          {/* Mode Switcher Header Tabs */}
          <div className="flex rounded-2xl bg-stone-900/90 p-1 border border-stone-800 mb-6">
            <button
              type="button"
              onClick={() => setLoginMode('PARTNER')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginMode === 'PARTNER'
                  ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🤝 Partner Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('ADMIN')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginMode === 'ADMIN'
                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              👑 Admin Management
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {loginMode === 'PARTNER' ? 'Wholesale Partner Portal' : 'Admin Operations Control'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {loginMode === 'PARTNER' 
                ? 'Sign in to access your wholesale orders, inventory, and invoices' 
                : 'Sign in with administrator credentials for master system controls'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View Test Passwords
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-stone-300 font-medium">Keep session active</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In &amp; Open Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Test Credentials Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-red-600/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AAS Foods Credentials</h3>
                <p className="text-xs text-stone-400">Pre-configured Role Credentials</p>
              </div>
            </div>
            <div className="text-xs text-stone-300 mb-4 space-y-2 bg-stone-900/80 p-3 rounded-xl border border-stone-800">
              <p>👑 <strong>Admin Account:</strong> <code className="text-red-400 font-bold">admin@business.com / admin123</code></p>
              <p>🤝 <strong>Partner 1 (North):</strong> <code className="text-amber-400 font-bold">partner1@business.com / partner123</code></p>
              <p>🤝 <strong>Partner 2 (West):</strong> <code className="text-amber-400 font-bold">partner2@business.com / partner223</code></p>
              <p>🤝 <strong>Partner 3 (South):</strong> <code className="text-amber-400 font-bold">partner3@business.com / partner323</code></p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-700 text-white font-bold text-xs hover:bg-red-600 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
