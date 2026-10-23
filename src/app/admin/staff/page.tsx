'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Mail, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface StaffRole {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  name: string | null;
  created_at: string;
}

export default function AdminStaffPage() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Failed to load staff allow-list');
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to fetch staff roles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Added ${email} as ${role.toUpperCase()}`, 'success');
        setEmail('');
        setName('');
        fetchRoles();
      } else {
        addToast(data.error || 'Failed to save staff role', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error saving staff role', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (id: string, targetEmail: string) => {
    if (!window.confirm(`Are you sure you want to remove ${targetEmail} from system access?`)) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`Removed access for ${targetEmail}`, 'success');
        fetchRoles();
      } else {
        addToast('Failed to remove staff role', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error removing staff role', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-zinc-700" />
            Staff &amp; Admin Roles
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage Gmail allow-lists and role-based access control (Admin vs Staff).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Staff Member Form */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-xs space-y-5 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-zinc-700" />
            Add Staff / Admin Email
          </h3>

          <form onSubmit={handleAddRole} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider block">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-lg text-sm font-sans focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider block">Gmail Address *</label>
              <input
                type="email"
                required
                placeholder="priya@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-lg text-sm font-sans focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider block">Role Level</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                    role === 'staff'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Staff (Catalog)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                    role === 'admin'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Full Admin
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
                {role === 'staff'
                  ? 'Staff can add/edit products & categories, but CANNOT view sales, revenue, orders, discounts, or admin settings.'
                  : 'Full Admin has unrestricted access to all store operations, order totals, and financial data.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Granting Access...' : 'Grant System Access'}
            </button>
          </form>
        </div>

        {/* Existing System Roles Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/60 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-700" />
              Active System Allow-List ({roles.length})
            </h3>
            <button onClick={fetchRoles} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-400 text-xs uppercase font-bold tracking-wider">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No custom staff roles configured in database yet. (Primary admin email fallback active)
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">User</th>
                    <th className="p-4">Gmail Address</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                      <td className="p-4 font-bold text-sm text-zinc-900">{r.name || 'Staff Member'}</td>
                      <td className="p-4 font-mono text-xs text-zinc-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        {r.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            r.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {r.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRole(r.id, r.email)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors rounded border border-zinc-200 hover:border-rose-200 bg-white"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
