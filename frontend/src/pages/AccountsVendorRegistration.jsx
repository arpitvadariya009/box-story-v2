import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

/* ─── Add Vendor Registration Modal ────────────────────────────────────── */
function AddVendorModal({ onClose, onAdded }) {
  const { api } = useAuth();
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    msme: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Vendor Name is required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/accounts/vendor-registration', form);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add Vendor Registration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vendor Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Fabric World Textiles"
              className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">GSTIN</label>
              <input
                type="text"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                placeholder="27AABCT1234F1Z5"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PAN Number</label>
              <input
                type="text"
                name="pan"
                value={form.pan}
                onChange={handleChange}
                placeholder="AABCT1234F"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              placeholder="HDFC Bank"
              className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account No.</label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="XXXX4521"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                value={form.ifsc}
                onChange={handleChange}
                placeholder="HDFC0001234"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="msme"
              name="msme"
              checked={form.msme}
              onChange={handleChange}
              className="w-4 h-4 text-[#D90B37] rounded border-gray-300 focus:ring-[#D90B37]"
            />
            <label htmlFor="msme" className="text-xs font-semibold text-gray-700 cursor-pointer">
              MSME Registered Supplier
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function AccountsVendorRegistration() {
  const { api } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await api.get(`/accounts/vendor-registration?${params}`);
      setVendors(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <>
      {showAddModal && (
        <AddVendorModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchVendors}
        />
      )}

      <div className="space-y-4">
        {/* Header with Add Vendor Button (Image 5) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vendor Registration</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage vendor compliance, GST, PAN & bank verification</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D90B37] text-gray-800"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D90B37]" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5">Vendor</th>
                    <th className="text-left px-6 py-3.5">GST</th>
                    <th className="text-left px-6 py-3.5">PAN</th>
                    <th className="text-left px-6 py-3.5">Bank</th>
                    <th className="text-left px-6 py-3.5">MSME</th>
                    <th className="text-left px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{v.vendorName}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs font-medium">{v.gst}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs font-medium">{v.pan}</td>
                      <td className="px-6 py-3.5 text-gray-600 text-xs font-medium">{v.bank}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-xs font-bold ${
                            v.msme === 'Yes' ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {v.msme}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${
                            v.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : v.status === 'Rejected'
                              ? 'bg-red-50 text-red-500 border-red-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
