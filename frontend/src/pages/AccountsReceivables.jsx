import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';

function formatCurrency(num) {
  return `₹${Number(num || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === '-') return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Record Payment Modal ─────────────────────────────────────────────── */
function RecordPaymentModal({ onClose, onRecorded }) {
  const { api } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/data-entry/clients').then((r) => setClients(r.data || [])).catch(() => {});
  }, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/accounts/invoices/record-payment-standalone', {
        clientId,
        amount,
        paymentMethod,
        transactionId,
      });
      onRecorded();
      onClose();
    } catch {
      onRecorded(); // fallback
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Record Receivable Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Corporate Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Amount Collected (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 289100"
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Transaction Ref / UTR</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. UTR-99881122"
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function AccountsReceivables() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchReceivables = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await api.get(`/accounts/receivables?${params}`);
      setData(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  const summary = data?.summary || {};
  const agingReport = data?.agingReport || [];

  return (
    <>
      {showPaymentModal && (
        <RecordPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onRecorded={fetchReceivables}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Receivables</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track customer outstanding balances and aging ledger</p>
          </div>
          <button
            onClick={fetchReceivables}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Outstanding */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {formatCurrency(summary.totalOutstanding || 0)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#D90B37] text-white flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-lg">
              ₹
            </div>
          </div>

          {/* Current */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {formatCurrency(summary.current || 0)}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-1">{summary.currentCount || 0} invoice(s)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Clock size={22} />
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {formatCurrency(summary.overdue || 0)}
              </p>
              <p className="text-xs font-semibold text-red-500 mt-1">{summary.overdueCount || 0} invoice(s)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle size={22} />
            </div>
          </div>

          {/* Collected This Month */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Collected This Month</p>
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                {formatCurrency(summary.collectedThisMonth || 0)}
              </p>
              <p className="text-xs font-semibold text-green-600 mt-1">{summary.collectedCount || 0} invoice(s)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Receivables Aging Report Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-gray-100 gap-3">
            <h2 className="text-sm font-bold text-gray-800">Receivables Aging Report</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D90B37]"
                />
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] transition-colors flex-shrink-0"
              >
                <Plus size={14} /> Record Payment
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D90B37]" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5">Client</th>
                    <th className="text-left px-5 py-3.5">Invoice</th>
                    <th className="text-left px-5 py-3.5">Total</th>
                    <th className="text-left px-5 py-3.5">Paid</th>
                    <th className="text-left px-5 py-3.5">Balance</th>
                    <th className="text-left px-5 py-3.5">Due</th>
                    <th className="text-left px-5 py-3.5">Aging</th>
                    <th className="text-left px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agingReport.map((row) => (
                    <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900">{row.clientName}</td>
                      <td className="px-5 py-3.5 text-gray-500 font-medium">{row.invoiceNumber}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{formatCurrency(row.total)}</td>
                      <td className="px-5 py-3.5 text-gray-500">{formatCurrency(row.paid)}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">{formatCurrency(row.balance)}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{formatDate(row.dueDate)}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">{row.aging}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${
                            row.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : row.status === 'Overdue'
                              ? 'bg-red-50 text-red-500 border-red-200'
                              : row.status === 'Partial'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                        >
                          {row.status}
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
