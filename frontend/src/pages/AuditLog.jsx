import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ShieldAlert, Activity } from 'lucide-react';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const AuditLog = () => {
  const { api } = useAuth();
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [actionFilter, setActionFilter] = useState('All statuses');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [appliedActionFilter, setAppliedActionFilter] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  // Modals Visibility States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedActionFilter, appliedDateFrom, appliedDateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedActionFilter && appliedActionFilter !== 'All' && appliedActionFilter !== 'All statuses') {
        params.action = appliedActionFilter;
      }
      if (appliedDateFrom) params.from = appliedDateFrom;
      if (appliedDateTo) params.to = appliedDateTo;

      const res = await api.get('/users/audit/logs', { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
        setTotalLogs(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        const total = res.data.length;
        setTotalLogs(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setLogs(res.data.slice(start, start + rowsPerPage));
      }
    } catch (error) {
      console.warn('Backend audit logs fetch failed:', error.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedActionFilter(actionFilter);
    setAppliedDateFrom(filterDateFrom);
    setAppliedDateTo(filterDateTo);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setActionFilter('All statuses');
    setFilterDateFrom('');
    setFilterDateTo('');
    setAppliedActionFilter('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportProgress({ percentage: 0, message: 'Starting export queue...' });
    try {
      const exportList = await fetchPaginatedDataQueue({
        fetchPage: async (page, limit) => {
          const params = { page, limit };
          if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
          if (appliedActionFilter && appliedActionFilter !== 'All' && appliedActionFilter !== 'All statuses') {
            params.action = appliedActionFilter;
          }
          if (appliedDateFrom) params.from = appliedDateFrom;
          if (appliedDateTo) params.to = appliedDateTo;

          const res = await api.get('/users/audit/logs', { params });
          const logsData = res.data?.logs || (Array.isArray(res.data) ? res.data : []);
          return {
            items: logsData,
            total: res.data?.total ?? logsData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['User', 'Action', 'Model', 'Description', 'IP Address', 'Timestamp'];
      const rows = exportList.map((log) => [
        log.user?.name || 'System',
        log.action || '—',
        log.model || '—',
        log.description || '—',
        log.ipAddress || '—',
        log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '—',
      ]);

      handleExport(exportFormat, 'System_Audit_Logs_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} audit logs successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export audit logs.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const actionColors = {
    Login: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Logout: 'bg-slate-100 text-slate-600 border border-slate-200',
    Create: 'bg-blue-50 text-blue-600 border border-blue-200',
    Update: 'bg-amber-50 text-amber-600 border border-amber-200',
    Delete: 'bg-rose-50 text-rose-600 border border-rose-200',
    StatusChange: 'bg-sky-50 text-sky-600 border border-sky-200',
    Export: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
  };

  const columns = [
    {
      header: 'USER',
      key: 'user',
      render: (log) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[#0F1729] text-sm">{log.user?.name || 'System'}</span>
          {log.user?.email && <span className="text-xs text-[#878787]">{log.user.email}</span>}
        </div>
      ),
    },
    {
      header: 'ACTION',
      key: 'action',
      render: (log) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            actionColors[log.action] || 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {log.action || 'Other'}
        </span>
      ),
    },
    {
      header: 'MODEL',
      key: 'model',
      render: (log) => (
        <span className="text-sm font-medium text-[#545454]">
          {log.model || 'System'}
        </span>
      ),
    },
    {
      header: 'DESCRIPTION',
      key: 'description',
      render: (log) => (
        <span className="text-sm text-[#0F1729]">
          {log.description || '—'}
        </span>
      ),
    },
    {
      header: 'IP ADDRESS',
      key: 'ipAddress',
      render: (log) => (
        <span className="text-sm text-[#545454] font-mono">
          {log.ipAddress || '—'}
        </span>
      ),
    },
    {
      header: 'TIMESTAMP',
      key: 'createdAt',
      render: (log) => (
        <span className="text-sm text-[#878787] whitespace-nowrap">
          {log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        {/* Header Toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">
              System Audit Logs
            </h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalLogs}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit logs..."
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-[#878787]" size={16} />
            </div>

            {/* Action Buttons (Filter + Export) */}
            <ActionButtons
              compact
              hasActiveFilter={Boolean((appliedActionFilter && appliedActionFilter !== 'All' && appliedActionFilter !== 'All statuses') || appliedDateFrom || appliedDateTo)}
              onFilterClick={() => {
                setActionFilter(appliedActionFilter || 'All statuses');
                setFilterDateFrom(appliedDateFrom);
                setFilterDateTo(appliedDateTo);
                setShowFilterModal(true);
              }}
              onExportClick={() => setShowExportModal(true)}
            />
          </div>
        </div>

        {/* Universal DataTable Component */}
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit records found"
          emptySubMessage="Try adjusting your search query or filters"
          emptyIcon={ShieldAlert}
          itemLabel="logs"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalLogs}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusOptions={['All statuses', 'Login', 'Logout', 'Create', 'Update', 'Delete', 'StatusChange', 'Export']}
        filterStatus={actionFilter}
        setFilterStatus={setActionFilter}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        recordCount={totalLogs}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AuditLog;
