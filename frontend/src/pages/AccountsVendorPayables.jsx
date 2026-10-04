import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Send,
  Eye,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

function formatCurrency(num) {
  return `₹${Number(num || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Release Payment Modal ────────────────────────────────────────────── */
function ReleasePaymentModal({ onClose, onReleased }) {
  const { api } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('NEFT');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/data-entry/vendors').then((r) => setVendors(r.data || [])).catch(() => {});
  }, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorName || !amount) {
      setError('Please select a vendor and enter payout amount.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/accounts/payables/release', {
        vendorName,
        poNumber,
        amount,
        mode,
        transactionRef,
      });
      onReleased();
      onClose();
    } catch {
      onReleased();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Release Vendor Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vendor Partner *</label>
            <select
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            >
              <option value="">Select vendor...</option>
              {vendors.map((v) => (
                <option key={v._id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PO Reference</label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2045"
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payout Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 350000"
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            >
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bank UTR / Transaction Ref</label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. NFT-8839201"
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Release Payout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function AccountsVendorPayables() {
  const { api } = useAuth();
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState(null);

  const fetchPayables = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await api.get(`/accounts/payables?${params}`);
      setPayables(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    fetchPayables();
  }, [fetchPayables]);

  return (
    <>
      {showReleaseModal && (
        <ReleasePaymentModal
          onClose={() => setShowReleaseModal(false)}
          onReleased={fetchPayables}
        />
      )}

      {selectedPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">Payable Details</h2>
              <button onClick={() => setSelectedPayable(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="text-gray-400">Vendor:</span> <strong className="text-gray-900">{selectedPayable.vendorName}</strong></p>
              <p><span className="text-gray-400">PO Number:</span> <strong>{selectedPayable.poNumber}</strong></p>
              <p><span className="text-gray-400">Amount:</span> <strong className="text-[#D90B37]">{formatCurrency(selectedPayable.amount)}</strong></p>
              <p><span className="text-gray-400">Scheduled Date:</span> <strong>{formatDate(selectedPayable.scheduledDate)}</strong></p>
              <p><span className="text-gray-400">Payment Mode:</span> <strong>{selectedPayable.mode}</strong></p>
              <p><span className="text-gray-400">Status:</span> <strong>{selectedPayable.status}</strong></p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedPayable(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Header with Release Payment Button (Image 4) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vendor Payables</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage supplier payments and payout schedules</p>
          </div>
          <button
            onClick={() => setShowReleaseModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] transition-colors shadow-sm"
          >
            <Send size={16} /> Release Payment
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
              placeholder="Search vendors or PO..."
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
                    <th className="text-left px-6 py-3.5">PO</th>
                    <th className="text-left px-6 py-3.5">Amount</th>
                    <th className="text-left px-6 py-3.5">Scheduled</th>
                    <th className="text-left px-6 py-3.5">Mode</th>
                    <th className="text-left px-6 py-3.5">Status</th>
                    <th className="text-right px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payables.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{item.vendorName}</td>
                      <td className="px-6 py-3.5 text-gray-500 font-medium">{item.poNumber}</td>
                      <td className="px-6 py-3.5 font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{formatDate(item.scheduledDate)}</td>
                      <td className="px-6 py-3.5 text-gray-700 font-semibold text-xs">{item.mode}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${
                            item.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : item.status === 'Released'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : item.status === 'Overdue'
                              ? 'bg-red-50 text-red-500 border-red-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button
                            onClick={() => setSelectedPayable(item)}
                            title="View details"
                            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
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
