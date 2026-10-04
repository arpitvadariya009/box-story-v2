import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Box,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  X,
  Calendar,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import { InputField, SelectField, TextareaField, PrimaryButton, SecondaryButton, ModalFooter, FormErrorBanner } from '../components/FormControls';
import ThemeDatePicker from '../components/ThemeDatePicker';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const STATUS_BADGE_STYLES = {
  Dispatched: 'bg-[#EBF5FF] text-[#2E86DE] border-[#BEE3F8]',
  'In Transit': 'bg-[#EBF5FF] text-[#2E86DE] border-[#BEE3F8]',
  Delivered: 'bg-[#E2FBE9] text-[#10B77F] border-[#C3F4D3]',
  Pending: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Cancelled: 'bg-[#FCE8ED] text-[#E21D48] border-[#F8C4D0]',
  Exception: 'bg-[#FCE8ED] text-[#E21D48] border-[#F8C4D0]',
};

const Dispatch = () => {
  const { api, user } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Server-side Pagination & Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [kpiStats, setKpiStats] = useState({
    totalDispatched: 0,
    inTransit: 0,
    delivered: 0,
    exceptions: 0,
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All statuses');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  // Modals Visibility States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form States
  const [formCreate, setFormCreate] = useState({
    orderNumber: '',
    courier: '',
    trackingNumber: '',
    eta: '',
  });

  const [formIssue, setFormIssue] = useState({
    dispatchId: '',
    issueType: '',
    description: '',
  });

  const [createError, setCreateError] = useState('');
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [issueError, setIssueError] = useState('');

  const resetCreateForm = () => {
    setFormCreate({
      orderNumber: '',
      courier: '',
      trackingNumber: '',
      eta: '',
    });
    setCreateError('');
    setCreateFieldErrors({});
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  const resetIssueForm = () => {
    setFormIssue({
      dispatchId: '',
      issueType: '',
      description: '',
    });
    setIssueError('');
  };

  const closeIssueModal = () => {
    setShowIssueModal(false);
    resetIssueForm();
  };

  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounce search (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated dispatches whenever page, limit, search, or filters change
  useEffect(() => {
    fetchDispatches();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });

      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
        params.append('status', appliedFilterStatus);
      }
      if (appliedDateFrom) params.append('dateFrom', appliedDateFrom);
      if (appliedDateTo) params.append('dateTo', appliedDateTo);

      const res = await api.get(`/warehouse/dispatches?${params.toString()}`);
      const data = res.data;

      if (data && typeof data === 'object' && Array.isArray(data.dispatches)) {
        setDispatches(data.dispatches);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.kpis) {
          setKpiStats({
            totalDispatched: data.kpis.totalDispatched ?? (data.total || 0),
            inTransit: data.kpis.inTransit ?? 0,
            delivered: data.kpis.delivered ?? 0,
            exceptions: data.kpis.exceptions ?? 0,
          });
        }
      } else if (Array.isArray(data)) {
        setDispatches(data);
        setTotalItems(data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      showToast(setToast, 'error', error.response?.data?.message || 'Failed to fetch dispatches.');
    } finally {
      setLoading(false);
    }
  };

  // Filter Handlers
  const handleApplyFilters = () => {
    setAppliedFilterStatus(filterStatus);
    setAppliedDateFrom(filterDateFrom);
    setAppliedDateTo(filterDateTo);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilterStatus('All statuses');
    setFilterDateFrom('');
    setFilterDateTo('');
    setAppliedFilterStatus('');
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
          const params = new URLSearchParams({ page: String(page), limit: String(limit) });
          if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
          if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
            params.append('status', appliedFilterStatus);
          }
          if (appliedDateFrom) params.append('dateFrom', appliedDateFrom);
          if (appliedDateTo) params.append('dateTo', appliedDateTo);

          const res = await api.get(`/warehouse/dispatches?${params.toString()}`);
          const dispatchesData = res.data?.dispatches || (Array.isArray(res.data) ? res.data : []);
          return {
            items: dispatchesData,
            total: res.data?.total ?? dispatchesData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Dispatch ID', 'Order', 'Client', 'Courier', 'Tracking #', 'Status', 'Date', 'ETA'];
      const rows = exportList.map((d) => [
        d.dispatchNumber || '—',
        d.orderNumber || d.order?.orderNumber || '—',
        d.clientName || d.client?.companyName || d.order?.client?.companyName || '—',
        d.carrier || '—',
        d.trackingNumber || d.awbNumber || '—',
        d.status || 'Dispatched',
        d.date || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : '—'),
        d.eta || (d.estimatedDelivery ? new Date(d.estimatedDelivery).toLocaleDateString('en-GB') : '—'),
      ]);

      handleExport(exportFormat, 'Dispatch_Logistics_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} dispatch records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export dispatches.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  // Create Dispatch Submit
  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    setCreateError('');
    const fErrors = {};
    if (!formCreate.orderNumber.trim()) {
      fErrors.orderNumber = 'Order ID is required';
    }
    if (!formCreate.courier) {
      fErrors.courier = 'Courier Partner is required';
    }
    if (Object.keys(fErrors).length > 0) {
      setCreateFieldErrors(fErrors);
      setCreateError(Object.values(fErrors)[0]);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/warehouse/dispatches', {
        orderNumber: formCreate.orderNumber.trim(),
        carrier: formCreate.courier,
        trackingNumber: formCreate.trackingNumber.trim(),
        estimatedDelivery: formCreate.eta || null,
      });

      closeCreateModal();
      fetchDispatches();
      showToast(setToast, 'success', 'Dispatch record created successfully!');
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  // Report Issue Submit
  const handleReportIssue = async (e) => {
    e.preventDefault();
    setIssueError('');
    if (!formIssue.dispatchId.trim()) {
      setIssueError('Please select a Dispatch ID.');
      return;
    }
    if (!formIssue.issueType.trim()) {
      setIssueError('Please select an Issue Type.');
      return;
    }
    setSubmitting(true);
    try {
      showToast(setToast, 'success', `Issue "${formIssue.issueType}" logged for ${formIssue.dispatchId}.`);
      closeIssueModal();
      fetchDispatches();
    } catch (error) {
      setIssueError(error.response?.data?.message || 'Failed to report issue.');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Definition (Original 8 Columns)
  const columns = [
    {
      header: 'DISPATCH ID',
      key: 'dispatchNumber',
      className: 'whitespace-nowrap font-semibold text-[#D90B37]',
      render: (item) => (
        <span className="cursor-pointer hover:underline">
          {item.dispatchNumber || '—'}
        </span>
      ),
    },
    {
      header: 'ORDER',
      key: 'orderNumber',
      className: 'whitespace-nowrap font-semibold text-[#D90B37]',
      render: (item) => (
        <span className="cursor-pointer hover:underline">
          {item.orderNumber || item.order?.orderNumber || '—'}
        </span>
      ),
    },
    {
      header: 'CLIENT',
      key: 'client',
      className: 'whitespace-nowrap text-[#0F1729] font-medium',
      render: (item) => (
        item.clientName || item.client?.companyName || item.order?.client?.companyName || '—'
      ),
    },
    {
      header: 'COURIER',
      key: 'carrier',
      className: 'whitespace-nowrap text-[#545454]',
      render: (item) => item.carrier || '—',
    },
    {
      header: 'TRACKING #',
      key: 'trackingNumber',
      className: 'whitespace-nowrap font-mono text-xs text-slate-600',
      render: (item) => (
        <span className="bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
          {item.trackingNumber || item.awbNumber || '—'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      className: 'whitespace-nowrap min-w-[120px]',
      headerClassName: 'text-center whitespace-nowrap',
      render: (item) => {
        const badgeStyle = STATUS_BADGE_STYLES[item.status] || 'bg-slate-100 text-slate-500 border-slate-200';
        return (
          <span className={`inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
            {item.status || 'Dispatched'}
          </span>
        );
      },
    },
    {
      header: 'DATE',
      key: 'date',
      className: 'whitespace-nowrap text-[#878787] text-xs',
      render: (item) => (
        item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-CA') : '—')
      ),
    },
    {
      header: 'ETA',
      key: 'eta',
      className: 'whitespace-nowrap text-[#878787] text-xs',
      render: (item) => (
        item.eta || (item.estimatedDelivery ? new Date(item.estimatedDelivery).toLocaleDateString('en-CA') : '—')
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col space-y-4 overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Row 1: KPI Stat Cards (4 Equal Cards) */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Dispatched */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Total Dispatched</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.totalDispatched}</div>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Live tracking records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <Truck size={20} />
          </div>
        </div>

        {/* Card 2: In Transit */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">In Transit</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.inTransit}</div>
            <span className="text-[11px] font-medium text-blue-600 mt-1 block">Active shipments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EBF5FF] text-[#2E86DE] flex items-center justify-center flex-shrink-0">
            <Box size={20} />
          </div>
        </div>

        {/* Card 3: Delivered */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Delivered</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.delivered}</div>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">
              {kpiStats.totalDispatched > 0 ? `${Math.round((kpiStats.delivered / kpiStats.totalDispatched) * 100)}% completed` : '100% completed'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E2FBE9] text-[#10B77F] flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Card 4: Exceptions */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Exceptions</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.exceptions}</div>
            <span className={`text-[11px] font-medium mt-1 block ${kpiStats.exceptions > 0 ? 'text-[#D90B37]' : 'text-emerald-600'}`}>
              {kpiStats.exceptions > 0 ? `${kpiStats.exceptions} require review` : 'Zero exceptions'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E21D48] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Row 2: Main Table Container Card */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        
        {/* Header Action Toolbar (Exact uniform height h-9 & rounded-[10px]) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          
          {/* Left Title & Counter Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">Dispatch Records</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalItems}
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search dispatches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-[#878787]" size={16} />
            </div>

            <ActionButtons 
              compact
              hasActiveFilter={Boolean((appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') || appliedDateFrom || appliedDateTo)}
              onFilterClick={() => {
                setFilterStatus(appliedFilterStatus || 'All statuses');
                setFilterDateFrom(appliedDateFrom);
                setFilterDateTo(appliedDateTo);
                setShowFilterModal(true);
              }}
              onExportClick={() => setShowExportModal(true)}
            />

            {/* Report Issue Secondary Button */}
            <button
              onClick={() => {
                setFormIssue({ dispatchId: '', issueType: '', description: '' });
                setShowIssueModal(true);
              }}
              className="h-9 px-4 bg-white border border-[#E3E3E3] hover:bg-[#F6F7FA] text-[#0F1729] text-sm font-semibold rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <span>Report Issue</span>
            </button>

            {/* + New Dispatch Primary Crimson Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Dispatch</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={dispatches}
          loading={loading}
          emptyMessage="No dispatch records found"
          emptySubMessage="Create a new dispatch record using the button above"
          emptyIcon={Truck}
          itemLabel="dispatches"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filter Records Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusOptions={['All statuses', 'Dispatched', 'In Transit', 'Delivered', 'Pending', 'Cancelled', 'Exception']}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Export Records Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        recordCount={totalItems}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />

      {/* ========================================== */}
      {/* FLOW 1: CREATE DISPATCH POPUP MODAL */}
      {/* ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-[500px] rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Create Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 mt-1">
              <FormErrorBanner error={createError} onClose={() => setCreateError('')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Order ID / Number"
                  required
                  placeholder="e.g. ORD-1001"
                  value={formCreate.orderNumber}
                  error={createFieldErrors.orderNumber}
                  onChange={(e) => {
                    setFormCreate({ ...formCreate, orderNumber: e.target.value });
                    if (createFieldErrors.orderNumber) setCreateFieldErrors({ ...createFieldErrors, orderNumber: '' });
                  }}
                />
                <SelectField
                  label="Courier Partner"
                  required
                  value={formCreate.courier}
                  error={createFieldErrors.courier}
                  onChange={(e) => {
                    setFormCreate({ ...formCreate, courier: e.target.value });
                    if (createFieldErrors.courier) setCreateFieldErrors({ ...createFieldErrors, courier: '' });
                  }}
                  placeholder="Select Courier"
                >
                  <option value="BlueDart">BlueDart</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="Shadowfax">Shadowfax</option>
                </SelectField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Tracking Number"
                  placeholder="e.g. TRK-849202"
                  value={formCreate.trackingNumber}
                  onChange={(e) => setFormCreate({ ...formCreate, trackingNumber: e.target.value })}
                />
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Estimated Delivery (ETA)
                  </label>
                  <ThemeDatePicker
                    value={formCreate.eta}
                    onChange={(val) => setFormCreate({ ...formCreate, eta: val })}
                    placeholder="dd-mm-yyyy"
                    ariaLabel="Estimated Delivery (ETA)"
                    align="right"
                  />
                </div>
              </div>

              <ModalFooter>
                <SecondaryButton onClick={closeCreateModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Dispatch Shipment'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FLOW 2: REPORT DISPATCH ISSUE POPUP MODAL (Exact match to provided design) */}
      {/* ========================================== */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-['Inter']">
          <div className="bg-white w-full max-w-[520px] rounded-3xl p-8 relative shadow-2xl flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Report Dispatch Issue</h3>
              </div>
              <button
                type="button"
                onClick={closeIssueModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReportIssue} className="space-y-5">
              <FormErrorBanner error={issueError} onClose={() => setIssueError('')} />
              
              {/* Field 1: Dispatch ID */}
              <div>
                <label className="block text-sm font-semibold text-[#0F1729] mb-2">
                  Dispatch ID *
                </label>
                <div className="relative">
                  <select
                    value={formIssue.dispatchId}
                    onChange={(e) => setFormIssue({ ...formIssue, dispatchId: e.target.value })}
                    className="w-full h-12 px-4 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none cursor-pointer transition-colors"
                  >
                    <option value="" disabled>Select dispatch</option>
                    {dispatches.length > 0 ? (
                       dispatches.map((d) => (
                        <option key={d._id} value={d.dispatchNumber || d._id}>
                          {d.dispatchNumber} {d.order?.orderNumber ? `(${d.order.orderNumber})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="DSP-001">DSP-001 (Sample Dispatch)</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Field 2: Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0F1729] mb-2">
                  Issue Type *
                </label>
                <div className="relative">
                  <select
                    value={formIssue.issueType}
                    onChange={(e) => setFormIssue({ ...formIssue, issueType: e.target.value })}
                    className="w-full h-12 px-4 pr-10 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none cursor-pointer transition-colors"
                  >
                    <option value="" disabled>Select issue type</option>
                    <option value="Damaged in Transit">Damaged in Transit</option>
                    <option value="Delayed Delivery">Delayed Delivery</option>
                    <option value="Wrong Address">Wrong Address</option>
                    <option value="Lost Package">Lost Package</option>
                    <option value="Return to Origin (RTO)">Return to Origin (RTO)</option>
                    <option value="Other">Other Exception</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Field 3: Description */}
              <div>
                <label className="block text-sm font-semibold text-[#0F1729] mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formIssue.description}
                  onChange={(e) => setFormIssue({ ...formIssue, description: e.target.value })}
                  placeholder="Description the issue"
                  className="w-full p-4 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F1729] placeholder-[#94A3B8] focus:outline-none focus:border-[#D90B37] resize-none transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeIssueModal}
                  className="h-11 px-6 bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 px-6 bg-[#D90B37] hover:bg-[#AE032C] text-white font-semibold rounded-xl text-sm transition-colors border-none cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Dispatch;
