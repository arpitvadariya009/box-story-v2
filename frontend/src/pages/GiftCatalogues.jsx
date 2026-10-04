import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  X,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  FolderKanban,
  ChevronDown
} from 'lucide-react';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ModalFooter, FormErrorBanner } from '../components/FormControls';
import ThemeDatePicker from '../components/ThemeDatePicker';
import EmployeeGiftCatalogue from '../components/EmployeeGiftCatalogue';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const STATUS_BADGE_STYLES = {
  Active: 'bg-[#E2FBE9] text-[#10B77F] border-[#C3F4D3]',
  Approved: 'bg-[#E2FBE9] text-[#10B77F] border-[#C3F4D3]',
  Pending: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Draft: 'bg-slate-100 text-slate-500 border-slate-200',
  Rejected: 'bg-[#FCE8ED] text-[#E21D48] border-[#F8C4D0]',
  Expired: 'bg-slate-100 text-slate-400 border-slate-200',
  Archived: 'bg-slate-100 text-slate-400 border-slate-200',
};

const GiftCatalogues = () => {
  const { user, api } = useAuth();

  if (user?.role === 'Employee') {
    return <EmployeeGiftCatalogue />;
  }

  const [catalogues, setCatalogues] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Server-side Pagination & Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [kpiStats, setKpiStats] = useState({
    totalCatalogues: 0,
    active: 0,
    pending: 0,
    rejected: 0,
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
  const [showExportModal, setShowExportModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    clientId: '',
    budget: 5000,
    employees: 500,
    deadline: '',
  });
  const [createError, setCreateError] = useState('');
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  // Debounce search (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated catalogues whenever page, limit, search, or filters change
  useEffect(() => {
    fetchCatalogues();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  // Fetch clients for dropdown
  useEffect(() => {
    api.get('/clients')
      .then((r) => {
        setClients(r.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch clients:', err);
      });
  }, [api]);

  const fetchCatalogues = async () => {
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

      const res = await api.get(`/products/catalogue/my-catalogues?${params.toString()}`);
      const data = res.data;

      if (data && typeof data === 'object' && Array.isArray(data.catalogues)) {
        setCatalogues(data.catalogues);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.kpis) {
          setKpiStats({
            totalCatalogues: data.kpis.totalCatalogues ?? (data.total || 0),
            active: data.kpis.active ?? 0,
            pending: data.kpis.pending ?? 0,
            rejected: data.kpis.rejected ?? 0,
          });
        }
      } else if (Array.isArray(data)) {
        setCatalogues(data);
        setTotalItems(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Catalogues fetch error:', err);
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to fetch catalogues.');
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

  const formatINR = (v) =>
    v ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v) : '₹0';

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

          const res = await api.get(`/products/catalogue/my-catalogues?${params.toString()}`);
          const catData = res.data?.catalogues || (Array.isArray(res.data) ? res.data : []);
          return {
            items: catData,
            total: res.data?.total ?? catData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Catalogue', 'Client', 'Status', 'Products', 'Budget', 'Employees', 'Deadline'];
      const rows = exportList.map((cat) => [
        cat.name || '—',
        cat.client?.companyName || '—',
        cat.status || 'Active',
        cat.products?.length ?? 0,
        cat.budget ? `${formatINR(cat.budget)}/emp` : '—',
        cat.employees ? cat.employees.toLocaleString('en-IN') : '—',
        cat.activeTo ? new Date(cat.activeTo).toLocaleDateString('en-GB') : '—',
      ]);

      handleExport(exportFormat, 'Gift_Catalogues_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} catalogues successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export catalogues.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      clientId: clients[0]?._id || '',
      budget: 5000,
      employees: 500,
      deadline: '',
    });
    setCreateError('');
    setCreateFieldErrors({});
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleFormChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (createFieldErrors[key]) {
      setCreateFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Catalogue name is required';
    if (!form.clientId) errors.clientId = 'Client is required';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      setCreateError('Catalogue name and client are required.');
      return;
    }
    setCreateError('');
    setCreateFieldErrors({});
    setCreating(true);
    try {
      await api.post('/products/catalogue/curate', {
        name: form.name.trim(),
        client: form.clientId,
        budget: Number(form.budget),
        employees: Number(form.employees),
        products: [],
        activeTo: form.deadline ? new Date(form.deadline).toISOString() : null,
      });
      setShowCreateModal(false);
      setForm({ name: '', clientId: '', budget: 5000, employees: 500, deadline: '' });
      fetchCatalogues();
      showToast(setToast, 'success', `Catalogue "${form.name}" created successfully!`);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create catalogue.');
    } finally {
      setCreating(false);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'CATALOGUE',
      key: 'name',
      className: 'min-w-[200px]',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[#0F1729] text-sm" title={item.name}>
            {item.name}
          </span>
          {item.category && item.category !== 'General' && (
            <span className="text-[11px] text-slate-500 font-medium">
              Category: {item.category}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'CLIENT',
      key: 'client',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[#545454] font-medium text-sm">
          {item.client?.companyName || '—'}
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
            {item.status || 'Active'}
          </span>
        );
      },
    },
    {
      header: 'PRODUCTS',
      key: 'products',
      align: 'center',
      className: 'whitespace-nowrap',
      headerClassName: 'text-center whitespace-nowrap',
      render: (item) => (
        <span className="font-semibold text-[#0F1729] text-sm">
          {item.products?.length ?? 0}
        </span>
      ),
    },
    {
      header: 'BUDGET',
      key: 'budget',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="font-bold text-[#0F1729] text-sm">
          {item.budget ? `${formatINR(item.budget)}/emp` : '—'}
        </span>
      ),
    },
    {
      header: 'EMPLOYEES',
      key: 'employees',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[#545454] font-medium text-sm">
          {item.employees ? item.employees.toLocaleString('en-IN') : '—'}
        </span>
      ),
    },
    {
      header: 'DEADLINE',
      key: 'deadline',
      className: 'whitespace-nowrap',
      render: (item) => (
        <span className="text-[#878787] font-medium text-xs">
          {item.activeTo ? new Date(item.activeTo).toLocaleDateString('en-CA') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col space-y-4 overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Row 1: KPI Stat Cards (4 Equal Cards) */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Catalogues */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Total Catalogues</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.totalCatalogues}</div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">All campaigns</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <Gift size={20} />
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Active</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.active}</div>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Running campaigns</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E2FBE9] text-[#10B77F] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Pending Review</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.pending}</div>
            <span className="text-[11px] font-medium text-amber-500 mt-1 block">Awaiting approval</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#FF9900] flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Rejected</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.rejected}</div>
            <span className="text-[11px] font-medium text-rose-500 mt-1 block">Declined proposals</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E21D48] flex items-center justify-center flex-shrink-0">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Row 2: Main Table Container Card */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        
        {/* Header Action Toolbar (Exact uniform height h-9 & rounded-[10px]) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          
          {/* Left Title & Counter Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Gift Catalogues</h2>
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
                placeholder="Search catalogues..."
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

            {/* + New Catalogue Primary Crimson Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Catalogue</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={catalogues}
          loading={loading}
          emptyMessage="No gift catalogues found"
          emptySubMessage="Create your first gift catalogue using the button above"
          emptyIcon={Gift}
          itemLabel="catalogues"
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
        statusOptions={['All statuses', 'Active', 'Approved', 'Pending', 'Draft', 'Rejected', 'Expired']}
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
      {/* FLOW: CREATE GIFT CATALOGUE POPUP MODAL (Exact Figma Match) */}
      {/* ========================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-['Inter',sans-serif]">
          <div className="bg-white w-full max-w-[490px] rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-5">
            
            {/* Header: Exact match to Figma (Inline Gift Icon + Title, X close button) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F1729] tracking-tight">Create Gift Catalogue</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <FormErrorBanner error={createError} onClose={() => setCreateError('')} />

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Row 1: Catalogue Name & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Catalogue Name <span className="text-[#D90B37]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Select product"
                    className={`w-full h-10 px-3.5 bg-white border ${createFieldErrors.name ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20' : 'border-[#E2E8F0]'} rounded-lg text-sm text-[#0F1729] placeholder-[#94A3B8] focus:outline-none focus:border-[#D90B37] transition-colors`}
                  />
                  {createFieldErrors.name && (
                    <p className="text-[12px] text-[#D90B37] mt-1 font-medium">{createFieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Client <span className="text-[#D90B37]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.clientId}
                      onChange={(e) => handleFormChange('clientId', e.target.value)}
                      className={`w-full h-10 px-3.5 pr-9 bg-white border ${createFieldErrors.clientId ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20' : 'border-[#E2E8F0]'} rounded-lg text-sm text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none cursor-pointer transition-colors`}
                    >
                      <option value="" disabled>Select Client</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                  {createFieldErrors.clientId && (
                    <p className="text-[12px] text-[#D90B37] mt-1 font-medium">{createFieldErrors.clientId}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Budget/Employee, Employees, Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Budget/Employee
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(e) => handleFormChange('budget', e.target.value)}
                    placeholder="₹5,000"
                    className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F1729] placeholder-[#94A3B8] focus:outline-none focus:border-[#D90B37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Employees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.employees}
                    onChange={(e) => handleFormChange('employees', e.target.value)}
                    placeholder="500"
                    className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F1729] placeholder-[#94A3B8] focus:outline-none focus:border-[#D90B37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
                    Deadline
                  </label>
                  <ThemeDatePicker
                    value={form.deadline}
                    onChange={(val) => handleFormChange('deadline', val)}
                    placeholder="mm/dd/yyyy"
                    ariaLabel="Deadline"
                    align="right"
                    inputClassName="rounded-lg h-10 px-3.5 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons: Cancel & Create Catalogue (Right-aligned, exact match to Figma) */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="h-9 px-4 bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-9 px-4 bg-[#D90B37] hover:bg-[#AE032C] text-white font-semibold rounded-lg text-sm transition-colors border-none cursor-pointer shadow-xs"
                >
                  {creating ? 'Creating...' : 'Create Catalogue'}
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

export default GiftCatalogues;
