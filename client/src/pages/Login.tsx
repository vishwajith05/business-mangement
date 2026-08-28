import React, { useState } from 'react';
import { 
  Flame, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle
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
  const [loginMode, setLoginMode] = useState<'PARTNER' | 'ADMIN'>('ADMIN');

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

  const handleModeSwitch = (mode: 'PARTNER' | 'ADMIN') => {
    setLoginMode(mode);
    setError(null);
    if (mode === 'PARTNER') {
      setEmail('partner1@business.com');
      setPassword('partner123');
    } else {
      setEmail('admin@business.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Centered Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-stone-950">
          
          {/* AAS Foods Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-700/40 mb-3">
              <Flame className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AAS Foods</h1>
            <p className="text-xs text-red-400 font-extrabold uppercase tracking-wider mt-0.5">Artisanal Raw Meat Hub</p>
          </div>

          {/* Role Portal Switcher Tabs */}
          <div className="flex rounded-2xl bg-stone-900/90 p-1 border border-stone-800 mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch('PARTNER')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginMode === 'PARTNER'
                  ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md shadow-amber-900/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🤝 Partner Login
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('ADMIN')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                loginMode === 'ADMIN'
                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md shadow-red-900/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              👑 Admin Portal
            </button>
          </div>

          <div className="mb-5 text-center">
            <p className="text-xs text-stone-400 font-medium">
              {loginMode === 'PARTNER' 
                ? 'Sign in to access wholesale orders, inventory & invoices' 
                : 'Sign in with administrator credentials for master control'}
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
                  View Credentials
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
                  <span>Sign In to AAS Foods</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span className="flex items-center gap-1 text-red-400/80 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Protected Portal
            </span>
            <span>AAS Foods © 2026</span>
          </div>
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
                <h3 className="text-base font-bold text-white">AAS Foods Accounts</h3>
                <p className="text-xs text-stone-400">Default Role Accounts</p>
              </div>
            </div>
            <div className="text-xs text-stone-300 mb-4 space-y-2 bg-stone-900/80 p-3 rounded-xl border border-stone-800 font-mono">
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
