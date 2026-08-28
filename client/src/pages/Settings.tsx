import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Save, 
  Receipt, 
  CheckCircle,
  HelpCircle,
  Beef,
  Flame
} from 'lucide-react';
import { settingsAPI } from '../api';
import { BusinessSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'AAS Foods Wholesale Meats',
    tagline: 'Premium Raw Meat & Cold Chain Logistics Enterprise',
    taxId: 'GSTIN27AABCU9603R1ZM',
    email: 'billing@aasfoods.com',
    phone: '+91 98765 43210',
    address: '101 Cold Chain Storage Park, Central Wholesale Meat Market, HR 122002',
    currencySymbol: '₹',
    defaultTaxRate: 15,
    invoiceFooter: 'Thank you for choosing AAS Foods Premium Cuts! Payment due within 15 days of cold delivery.'
  });

  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsAPI.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load business settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    try {
      const updated = await settingsAPI.updateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update settings.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-red-900/30">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Beef className="w-6 h-6 text-red-500" />
          <span>AAS Foods Business &amp; System Settings</span>
        </h1>
        <p className="text-xs text-stone-400 mt-1">Configure AAS Foods branding, Tax ID / GSTIN, currency defaults, and PDF invoice templates</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>AAS Foods business settings and PDF invoice configurations updated successfully!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-stone-800 space-y-6">
        
        {/* Company Identity */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 border-b border-stone-800 pb-2">
            Company Identity &amp; Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Tax Registration ID (GSTIN / VAT) *</label>
              <input
                type="text"
                required
                value={settings.taxId}
                onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Default System Currency Symbol *</label>
              <input
                type="text"
                required
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                placeholder="₹, $, €, £"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 border-b border-stone-800 pb-2">
            Invoice Contact &amp; Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Official Business Email</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Official Contact Phone</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-300 mb-1">Full Registered Address</label>
              <textarea
                rows={2}
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Invoice Footer Terms */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 border-b border-stone-800 pb-2">
            PDF Invoice Template Settings
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">PDF Invoice Footer Terms &amp; Conditions</label>
            <textarea
              rows={2}
              value={settings.invoiceFooter}
              onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save AAS Foods Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
