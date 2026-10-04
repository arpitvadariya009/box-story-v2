import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Loader2,
  RefreshCw,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

function formatCurrency(amount) {
  if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(1);
    return `₹${lakhs.endsWith('.0') ? lakhs.slice(0, -2) : lakhs}L`;
  }
  return `₹${amount?.toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AccountsDashboard() {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/accounts/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts dashboard');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D90B37]" size={36} />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const cashFlow = data?.cashFlow || [];
  const revenueTrend = data?.revenueTrend || [];
  const upcomingInvoices = data?.upcomingDueDates || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of receivables, payables, and cash flow</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Top 4 Stat Cards (Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receivables */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Receivables</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCurrency(metrics.totalReceivables || 0)}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-0.5">
              <ArrowUpRight size={13} className="text-blue-500" /> {metrics.receivablesChange || '0 pending'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Target size={22} />
          </div>
        </div>

        {/* Total Payables */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Payables</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCurrency(metrics.totalPayables || 0)}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-0.5">
              <ArrowDownRight size={13} className="text-[#D90B37]" /> {metrics.payablesChange || '0 pending'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#D90B37] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Target size={22} />
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Revenue This Month</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {formatCurrency(metrics.revenueThisMonth || 0)}
            </p>
            <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {metrics.revenueChange || 'Live month'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Overdue Payments</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {metrics.overdueCount || 0}
            </p>
            <p className="text-xs font-semibold text-red-500 mt-2">
              ₹{((metrics.overdueAmount || 0) / 100000).toFixed(1)}L overdue
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Analytics Section (Cash Flow & Revenue Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cash Flow Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-800">Cash Flow</h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-3 h-3 rounded-sm bg-black inline-block" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-3 h-3 rounded-sm bg-[#D90B37] inline-block" /> Outflow
              </span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-gray-100">
            {cashFlow.map((cf, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div
                    style={{ height: `${(cf.inflow / 80) * 100}%` }}
                    className="w-3.5 bg-black rounded-t-sm transition-all duration-300 hover:opacity-90"
                    title={`Inflow: ₹${cf.inflow}L`}
                  />
                  <div
                    style={{ height: `${(cf.outflow / 80) * 100}%` }}
                    className="w-3.5 bg-[#D90B37] rounded-t-sm transition-all duration-300 hover:opacity-90"
                    title={`Outflow: ₹${cf.outflow}L`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-400">{cf.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-800">Revenue Trend</h2>
            <span className="text-xs text-gray-400 font-medium">Monthly (₹ Lakhs)</span>
          </div>
          <div className="h-48 flex flex-col justify-between pt-2">
            <svg viewBox="0 0 500 140" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D90B37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D90B37" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Area fill */}
              <path
                d="M 0 80 Q 100 60 200 40 T 400 65 L 400 130 L 0 130 Z"
                fill="url(#redGradient)"
              />

              {/* Trend Curve */}
              <path
                d="M 0 80 Q 100 60 200 40 T 400 65"
                fill="none"
                stroke="#D90B37"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-xs font-medium text-gray-400 pt-2 border-t border-gray-100">
              {revenueTrend.map((rt, i) => (
                <span key={i}>{rt.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table: Upcoming Invoice Due Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Upcoming Invoice Due Dates</h2>
          <Calendar size={18} className="text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {upcomingInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-gray-800">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3.5 text-gray-700 font-medium">{inv.clientName}</td>
                  <td className="px-6 py-3.5 font-bold text-gray-900">₹{inv.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{formatDate(inv.dueDate)}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : inv.status === 'Overdue'
                          ? 'bg-red-50 text-red-500 border-red-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
