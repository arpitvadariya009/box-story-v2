import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Warehouse,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const priorityConfig = {
  High: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'High' },
  Medium: { bg: 'bg-orange-50', text: 'text-orange-500', dot: 'bg-orange-400', label: 'Medium' },
  Low: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', label: 'Low' },
};

const statusConfig = {
  Approved: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  Pending: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
};

const typeIconMap = {
  Product: <Package size={14} className="text-blue-500" />,
  GoodsReceipt: <Warehouse size={14} className="text-purple-500" />,
  Order: <ShoppingCart size={14} className="text-orange-500" />,
  Unknown: <ClipboardList size={14} className="text-gray-400" />,
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Metric Card ──────────────────────────────────────────────────────── */
function MetricCard({ label, value, icon: Icon, iconBg, iconColor, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function DataEntryDashboard() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/data-entry/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertTriangle size={36} className="text-orange-400" />
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-[#D90B37] text-white rounded-xl text-sm font-semibold hover:bg-[#b8082d] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const pendingTasks = data?.pendingTasks || [];
  const todaySubmissions = data?.todaySubmissions || [];
  const rejectionAlerts = data?.rejectionAlerts || [];

  const tasksToShow = pendingTasks;
  const todayToShow = todaySubmissions;
  const alertsToShow = rejectionAlerts;

  const typeRoutes = {
    Product: '/data-entry/products',
    GoodsReceipt: '/data-entry/inventory',
    Order: '/data-entry/orders',
  };
  const typeLabels = {
    Product: 'Product',
    GoodsReceipt: 'Inventory',
    Order: 'Order',
    Unknown: 'Task',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Entry Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track all your data entries</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Pending Tasks"
          value={metrics.pendingReviewCount ?? pendingTasks.length}
          icon={ClipboardList}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          trend="Awaiting review"
        />
        <MetricCard
          label="Submitted Today"
          value={metrics.mySubmissionsToday ?? todaySubmissions.length}
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          trend="Today's submissions"
        />
        <MetricCard
          label="This Week"
          value={metrics.mySubmissionsThisWeek ?? 0}
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          trend="7-day activity"
        />
        <MetricCard
          label="Total Entries"
          value={metrics.totalEntries ?? 0}
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          trend="Catalogue records"
        />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Tasks Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-800">Pending Data Entry Tasks</h2>
            <button
              onClick={() => navigate('/data-entry/products')}
              className="text-xs text-[#D90B37] font-semibold hover:underline flex items-center gap-1"
            >
              Start Entry <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {tasksToShow.map((task) => {
              const pc = priorityConfig[task.priority] || priorityConfig.Medium;
              return (
                <div
                  key={task._id}
                  className="flex items-start justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(typeRoutes[task.type] || '/data-entry/products')}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{typeIconMap[task.type] || typeIconMap.Unknown}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{typeLabels[task.type] || 'Task'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${pc.bg} ${pc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                      {pc.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(task.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            {tasksToShow.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-300" />
                All caught up! No pending tasks.
              </div>
            )}
          </div>
        </div>

        {/* Records Submitted Today */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-800">Records Submitted Today</h2>
            <button
              onClick={() => navigate('/data-entry/submissions')}
              className="text-xs text-[#D90B37] font-semibold hover:underline flex items-center gap-1"
            >
              All Submissions <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {todayToShow.map((sub) => {
              const sc = statusConfig[sub.status] || statusConfig.Pending;
              return (
                <div
                  key={sub._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/data-entry/submissions')}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{sub.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sub.createdAt
                        ? `Today, ${formatTime(sub.createdAt)}`
                        : 'Recently'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    {sub.status}
                  </span>
                </div>
              );
            })}
            {todayToShow.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                <ClipboardList size={32} className="mx-auto mb-2 text-gray-200" />
                No submissions yet today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Alerts */}
      {alertsToShow.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-bold text-red-600">Rejection Alerts</h2>
          </div>
          <div className="space-y-2">
            {alertsToShow.map((alert) => (
              <div key={alert._id} className="flex items-center justify-between">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">{alert.title}</span>
                  <span className="text-red-400 mx-1">—</span>
                  <span>{alert.reason}</span>
                </p>
                <button
                  onClick={() => navigate('/data-entry/submissions')}
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline flex-shrink-0 ml-4"
                >
                  Re-edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
