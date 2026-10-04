import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Eye,
  Pencil,
  ChevronDown,
  Loader2,
  AlertTriangle,
  ClipboardList,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const statusConfig = {
  Approved: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  Pending: {
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    border: 'border-orange-200',
  },
  Rejected: {
    bg: 'bg-red-50',
    text: 'text-red-500',
    border: 'border-red-200',
  },
};

const typeLabels = {
  Product: 'Product',
  GoodsReceipt: 'Inventory',
  Order: 'Order',
  Unknown: '—',
};

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/* ─── Detail Modal ──────────────────────────────────────────────────────── */
function DetailModal({ submission, onClose }) {
  if (!submission) return null;
  const sc = statusConfig[submission.status] || statusConfig.Pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {typeLabels[submission.type] || submission.type}
            </p>
            <h2 className="text-base font-bold text-gray-900 leading-tight">{submission.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}
            >
              {submission.status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">Submitted</p>
              <p className="text-gray-800 font-medium">{formatDateTime(submission.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">Last Updated</p>
              <p className="text-gray-800 font-medium">{formatDateTime(submission.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">Type</p>
              <p className="text-gray-800 font-medium">{typeLabels[submission.type] || submission.type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">Priority</p>
              <p className="text-gray-800 font-medium capitalize">{submission.priority || 'Normal'}</p>
            </div>
          </div>

          {submission.status === 'Rejected' && submission.rejectionNote && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{submission.rejectionNote}</p>
            </div>
          )}

          {submission.document && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Details</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(submission.document, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function DataEntryMySubmissions() {
  const { api } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/data-entry/submissions?${params}`);
      setSubmissions(res.data || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchSubmissions, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchSubmissions, search]);

  const openDetail = async (sub) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/data-entry/submissions/${sub._id}`);
      setSelected(res.data);
    } catch {
      setSelected(sub); // fallback
    } finally {
      setDetailLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(submissions.length / PAGE_SIZE);
  const paginated = submissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayData = paginated;

  return (
    <>
      {selected && <DetailModal submission={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search submissions..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 pr-9 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#D90B37] bg-white appearance-none cursor-pointer"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={fetchSubmissions}
              className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D90B37]" size={32} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-2/5">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayData.map((sub) => {
                      const sc = statusConfig[sub.status] || statusConfig.Pending;
                      return (
                        <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-gray-800 text-sm">{sub.title}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-gray-500">{typeLabels[sub.type] || sub.type}</span>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell text-gray-400 text-xs">
                            {formatDateTime(sub.createdAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openDetail(sub)}
                                disabled={detailLoading}
                                title="View details"
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {detailLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                              </button>
                              {sub.status === 'Rejected' && (
                                <button
                                  onClick={() => openDetail(sub)}
                                  title="Re-edit and resubmit"
                                  className="p-1.5 text-[#D90B37] hover:text-[#b8082d] hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {displayData.length === 0 && (
                <div className="py-16 text-center">
                  <ClipboardList size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400 text-sm font-medium">No submissions found</p>
                  <p className="text-gray-300 text-xs mt-1">Try adjusting your search or filter</p>
                </div>
              )}

              {/* Pagination — only when using real data */}
              {!isUsingDemo && totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, submissions.length)} of {submissions.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-700 font-semibold px-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
