import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Lock, 
  CheckCircle2, 
  Trash2, 
  X, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Phone,
  Flame,
  Edit2
} from 'lucide-react';
import { usersAPI } from '../api';
import { User, UserRole } from '../types';

export const AccountManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'partner123',
    role: 'PARTNER' as UserRole,
    partnerRegion: 'North Zone',
    phone: '+91 98765 00000',
    canEditStock: false
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await usersAPI.getAll();
      setUsers(list);
    } catch (err) {
      console.error('Failed to fetch partner accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: 'partner123',
      role: 'PARTNER',
      partnerRegion: 'North Zone',
      phone: '+91 98765 00000',
      canEditStock: false
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      partnerRegion: u.partnerRegion || 'General',
      phone: u.phone || '',
      canEditStock: u.canEditStock
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleTogglePermission = async (user: User) => {
    try {
      await usersAPI.updatePermissions(user.id, !user.canEditStock);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update partner permission:', err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingUser) {
        // Update user endpoint
        await usersAPI.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          partnerRegion: formData.partnerRegion,
          phone: formData.phone,
          canEditStock: formData.canEditStock,
          ...(formData.password ? { password: formData.password } : {})
        });
      } else {
        // Create user
        await usersAPI.createPartner(formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to save account details.');
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteCandidate) return;
    try {
      await usersAPI.deletePartner(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete partner account.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-red-900/30">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <span>Partner &amp; Account Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">Admin control center: add wholesale distribution partners, manage regional access &amp; stock permissions</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Partner</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900/90 border-b border-stone-800 text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Partner Outlet</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Region / Zone</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Stock Edit Permission</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-semibold">Loading partner accounts...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-900/40 to-amber-900/40 text-amber-300 border border-red-800/40 flex items-center justify-center font-black text-xs shadow-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-100">{u.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{u.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      <p className="font-mono text-xs text-amber-200">{u.email}</p>
                      {u.phone && <p className="text-[10px] text-stone-400 flex items-center gap-1"><Phone className="w-3 h-3 text-stone-500" /> {u.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-900 text-amber-300 border border-stone-700">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {u.partnerRegion || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-red-950/60 text-red-300 border border-red-600/40' : 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'ADMIN' ? (
                        <span className="text-[11px] font-extrabold text-red-400">Master Owner Access</span>
                      ) : (
                        <button
                          onClick={() => handleTogglePermission(u)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                            u.canEditStock
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900/60'
                              : 'bg-stone-900 text-stone-400 border border-stone-800 hover:bg-stone-800'
                          }`}
                        >
                          {u.canEditStock ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{u.canEditStock ? 'Can Edit Stock' : 'Read-Only Catalog'}</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
                            title="Edit Partner Account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40"
                            title="Delete Partner Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-red-600/30">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-base font-black text-white">
                {editingUser ? 'Edit Partner Account' : 'Add Wholesale Partner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-600/40 text-rose-300 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Partner Outlet Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="North Coast Meats"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partner@aasfoods.com"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Region / Zone</label>
                  <input
                    type="text"
                    value={formData.partnerRegion}
                    onChange={(e) => setFormData({ ...formData, partnerRegion: e.target.value })}
                    placeholder="North Zone"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    {editingUser ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep' : '••••••••'}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="canEditStock"
                  checked={formData.canEditStock}
                  onChange={(e) => setFormData({ ...formData, canEditStock: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-red-600"
                />
                <label htmlFor="canEditStock" className="text-xs text-stone-300 cursor-pointer font-bold">
                  Grant Cold Stock Edit Access (Unchecked = Read-Only)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-900/40"
                >
                  {editingUser ? 'Save Changes' : 'Create Partner Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-rose-600/40 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Partner Account?</h3>
            <p className="text-xs text-stone-300 my-2">
              Are you sure you want to delete <span className="font-bold text-white">{deleteCandidate.name}</span> ({deleteCandidate.email})?
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePartner}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
