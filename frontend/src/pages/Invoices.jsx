import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ModalFooter, FormErrorBanner } from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const STATUS_BADGE_STYLES = {
  Paid: 'bg-[#E2FBE9] text-[#10B77F] border-[#C3F4D3]',
  Pending: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  Unpaid: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  'Partially Paid': 'bg-[#FFF3E0] text-[#FF9900] border-[#FFD8A8]',
  Draft: 'bg-slate-100 text-slate-500 border-slate-200',
  Overdue: 'bg-[#FCE8ED] text-[#E21D48] border-[#F8C4D0]',
  Cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
};

const Invoices = () => {
  const { api } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Server-side Pagination & Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [kpiStats, setKpiStats] = useState({
    totalInvoices: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
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
  const [showEWayBillModal, setShowEWayBillModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // eWay Bill State
  const [eWayInvoiceId, setEWayInvoiceId] = useState('');
  const [eWayError, setEWayError] = useState('');

  // Generate Invoice Form State
  const [formGen, setFormGen] = useState({
    clientId: '',
    orderReference: '',
    amount: '',
    gstRate: '18%',
  });
  const [genInvoiceError, setGenInvoiceError] = useState('');
  const [genFieldErrors, setGenFieldErrors] = useState({});

  const resetGenerateForm = () => {
    setFormGen({
      clientId: clients[0]?._id || '',
      orderReference: '',
      amount: '',
      gstRate: '18%',
    });
    setGenInvoiceError('');
    setGenFieldErrors({});
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    resetGenerateForm();
  };

  const closeEWayBillModal = () => {
    setShowEWayBillModal(false);
    setEWayInvoiceId('');
    setEWayError('');
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

  // Fetch paginated invoices whenever page, limit, search, or filters change
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  // Fetch clients for invoice generation modal
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients?limit=1000');
        const list = Array.isArray(res.data) ? res.data : (res.data?.clients || []);
        setClients(list);
        if (list.length > 0) {
          setFormGen((f) => ({ ...f, clientId: f.clientId || list[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, [api]);

  const fetchInvoices = async () => {
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

      const res = await api.get(`/invoices?${params.toString()}`);
      const data = res.data;

      if (data && typeof data === 'object' && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.invoices.length > 0) {
          setEWayInvoiceId((prev) => prev || data.invoices[0]._id);
        }
        if (data.kpis) {
          setKpiStats({
            totalInvoices: data.kpis.totalInvoices ?? (data.total || 0),
            paid: data.kpis.paid ?? 0,
            pending: data.kpis.pending ?? 0,
            overdue: data.kpis.overdue ?? 0,
          });
        }
      } else if (Array.isArray(data)) {
        setInvoices(data);
        setTotalItems(data.length);
        setTotalPages(1);
        if (data.length > 0) {
          setEWayInvoiceId((prev) => prev || data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showToast(setToast, 'error', error.response?.data?.message || 'Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val) =>
    val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0';

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

          const res = await api.get(`/invoices?${params.toString()}`);
          const invoicesData = res.data?.invoices || (Array.isArray(res.data) ? res.data : []);
          return {
            items: invoicesData,
            total: res.data?.total ?? invoicesData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Invoice #', 'Client', 'Amount', 'GST', 'Total', 'Status', 'Date', 'Due Date'];
      const rows = exportList.map((inv) => {
        const amt = inv.subtotal || inv.amount || (inv.totalAmount ? inv.totalAmount / 1.18 : (inv.amountDue || 0));
        const gst = inv.totalTax || inv.gst || amt * 0.18;
        const total = inv.grandTotal || inv.total || inv.totalAmount || (amt + gst);
        return [
          inv.invoiceNumber || '—',
          inv.clientName || inv.client?.companyName || '—',
          formatINR(amt),
          formatINR(gst),
          formatINR(total),
          inv.status || 'Pending',
          inv.date || (inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-GB') : (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-GB') : '—')),
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : '—',
        ];
      });

      handleExport(exportFormat, 'Invoices_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} invoice records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export invoices.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  // Generate eWay Bill Submit
  const handleGenerateEWayBill = async (e) => {
    e.preventDefault();
    setEWayError('');
    if (!eWayInvoiceId) {
      setEWayError('Please select an invoice.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/eway-bills', {
        invoice: eWayInvoiceId,
        invoiceId: eWayInvoiceId,
      });
      const billNum = res.data?.billNumber || res.data?.ewayBill?.billNumber || '';
      showToast(setToast, 'success', billNum ? `eWay Bill ${billNum} generated successfully!` : 'eWay Bill generated successfully!');
      closeEWayBillModal();
      await fetchInvoices();
    } catch (error) {
      console.error('eWay bill generation error:', error);
      setEWayError(error.response?.data?.message || 'Failed to generate eWay Bill.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate Invoice Submit
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setGenInvoiceError('');
    const fErrors = {};
    if (!formGen.clientId) {
      fErrors.clientId = 'Please select a client';
    }
    if (!formGen.amount || Number(formGen.amount) <= 0) {
      fErrors.amount = 'Please enter a valid amount';
    }
    if (Object.keys(fErrors).length > 0) {
      setGenFieldErrors(fErrors);
      setGenInvoiceError(Object.values(fErrors)[0]);
      return;
    }
    setSubmitting(true);
    try {
      const amtNum = Number(formGen.amount) || 0;
      const parsedGstRate = parseInt(formGen.gstRate, 10) || 18;
      const gstVal = amtNum * (parsedGstRate / 100);
      const totalVal = amtNum + gstVal;

      await api.post('/invoices', {
        clientId: formGen.clientId,
        client: formGen.clientId,
        orderReference: formGen.orderReference.trim(),
        amount: amtNum,
        subtotal: amtNum,
        gstRate: parsedGstRate,
        totalAmount: totalVal,
      });

      closeGenerateModal();
      await fetchInvoices();
      showToast(setToast, 'success', 'Invoice generated successfully!');
    } catch (error) {
      console.error('Invoice generation error:', error);
      setGenInvoiceError(error.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Definition (Original 8 Columns)
  const columns = [
    {
      header: 'INVOICE #',
      key: 'invoiceNumber',
      className: 'whitespace-nowrap font-semibold text-[#D90B37]',
      render: (item) => (
        <span className="cursor-pointer hover:underline">
          {item.invoiceNumber || '—'}
        </span>
      ),
    },
    {
      header: 'CLIENT',
      key: 'client',
      className: 'whitespace-nowrap text-[#0F1729] font-medium',
      render: (item) => (
        item.clientName || item.client?.companyName || '—'
      ),
    },
    {
      header: 'AMOUNT',
      key: 'amount',
      className: 'whitespace-nowrap font-medium text-[#0F1729]',
      render: (item) => {
        const amt = item.subtotal || item.amount || (item.totalAmount ? item.totalAmount / 1.18 : (item.amountDue || 0));
        return formatINR(amt);
      },
    },
    {
      header: 'GST',
      key: 'gst',
      className: 'whitespace-nowrap font-medium text-[#0F1729]',
      render: (item) => {
        const amt = item.subtotal || item.amount || (item.totalAmount ? item.totalAmount / 1.18 : (item.amountDue || 0));
        const gst = item.totalTax || item.gst || amt * 0.18;
        return formatINR(gst);
      },
    },
    {
      header: 'TOTAL',
      key: 'total',
      className: 'whitespace-nowrap font-bold text-[#0F1729]',
      render: (item) => {
        const amt = item.subtotal || item.amount || (item.totalAmount ? item.totalAmount / 1.18 : (item.amountDue || 0));
        const gst = item.totalTax || item.gst || amt * 0.18;
        const total = item.grandTotal || item.total || item.totalAmount || (amt + gst);
        return formatINR(total);
      },
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
            {item.status || 'Pending'}
          </span>
        );
      },
    },
    {
      header: 'DATE',
      key: 'date',
      className: 'whitespace-nowrap text-[#878787] text-xs',
      render: (item) => (
        item.date || (item.issueDate ? new Date(item.issueDate).toLocaleDateString('en-CA') : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-CA') : '—'))
      ),
    },
    {
      header: 'DUE DATE',
      key: 'dueDate',
      className: 'whitespace-nowrap text-[#878787] text-xs',
      render: (item) => (
        item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-CA') : '—'
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col space-y-4 overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Row 1: KPI Stat Cards (4 Equal Cards) */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Invoices */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Total Invoices</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.totalInvoices}</div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 block">All billing records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <FileText size={20} />
          </div>
        </div>

        {/* Card 2: Paid */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Paid</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.paid}</div>
            <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Settled accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E2FBE9] text-[#10B77F] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Pending</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.pending}</div>
            <span className="text-[11px] font-medium text-amber-500 mt-1 block">Awaiting payment</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#FF9900] flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Overdue</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.overdue}</div>
            <span className={`text-[11px] font-medium mt-1 block ${kpiStats.overdue > 0 ? 'text-[#D90B37]' : 'text-emerald-600'}`}>
              {kpiStats.overdue > 0 ? `${kpiStats.overdue} action required` : 'No overdue invoices'}
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
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Invoices</h2>
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
                placeholder="Search invoices..."
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

            {/* eWay Bill Secondary Button */}
            <button
              onClick={() => {
                if (invoices.length > 0 && !eWayInvoiceId) {
                  setEWayInvoiceId(invoices[0]._id);
                }
                setShowEWayBillModal(true);
              }}
              className="h-9 px-4 bg-white border border-[#E3E3E3] hover:bg-[#F6F7FA] text-[#0F1729] text-sm font-semibold rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <span>eWay Bill</span>
            </button>

            {/* + Generate Invoice Primary Crimson Button */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Generate Invoice</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices found"
          emptySubMessage="Generate an invoice using the button above"
          emptyIcon={FileText}
          itemLabel="invoices"
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
        statusOptions={['All statuses', 'Paid', 'Pending', 'Unpaid', 'Partially Paid', 'Overdue']}
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
      {/* FLOW 1: GENERATE eWAY BILL POPUP MODAL */}
      {/* ========================================== */}
      {showEWayBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-['Inter']">
          <div className="bg-white w-full max-w-[440px] rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Generate eWay Bill</h3>
              </div>
              <button
                type="button"
                onClick={closeEWayBillModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#65758B]">
              Generate official eWay bill for goods movement above ₹50,000.
            </p>

            <form onSubmit={handleGenerateEWayBill} className="space-y-4 text-left mt-2">
              <FormErrorBanner error={eWayError} onClose={() => setEWayError('')} />
              <SelectField
                label="Select Invoice"
                required
                value={eWayInvoiceId}
                onChange={(e) => {
                  setEWayInvoiceId(e.target.value);
                  if (eWayError) setEWayError('');
                }}
                placeholder="Select invoice"
              >
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} ({inv.clientName || inv.client?.companyName || 'Client'})
                  </option>
                ))}
              </SelectField>

              <ModalFooter className="justify-center">
                <SecondaryButton onClick={closeEWayBillModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  <Download size={14} className="mr-1 inline-block" />
                  <span>{submitting ? 'Generating…' : 'Generate'}</span>
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FLOW 2: GENERATE INVOICE POPUP MODAL */}
      {/* ========================================== */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-['Inter']">
          <div className="bg-white w-full max-w-[500px] rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Generate Invoice</h3>
              </div>
              <button
                type="button"
                onClick={closeGenerateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4 mt-1">
              <FormErrorBanner error={genInvoiceError} onClose={() => setGenInvoiceError('')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Client"
                  required
                  value={formGen.clientId}
                  error={genFieldErrors.clientId}
                  onChange={(e) => {
                    setFormGen({ ...formGen, clientId: e.target.value });
                    if (genFieldErrors.clientId) setGenFieldErrors({ ...genFieldErrors, clientId: '' });
                  }}
                  placeholder="Select client"
                >
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName}
                    </option>
                  ))}
                </SelectField>

                <InputField
                  label="Order Reference"
                  placeholder="ORD-2026-XXX"
                  value={formGen.orderReference}
                  onChange={(e) => setFormGen({ ...formGen, orderReference: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Amount (₹)"
                  required
                  type="number"
                  min="0"
                  placeholder="Amount before GST"
                  value={formGen.amount}
                  error={genFieldErrors.amount}
                  onChange={(e) => {
                    setFormGen({ ...formGen, amount: e.target.value });
                    if (genFieldErrors.amount) setGenFieldErrors({ ...genFieldErrors, amount: '' });
                  }}
                />

                <InputField
                  label="GST Rate"
                  placeholder="18%"
                  value={formGen.gstRate}
                  onChange={(e) => setFormGen({ ...formGen, gstRate: e.target.value })}
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={closeGenerateModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? 'Generating…' : 'Generate Invoice'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Invoices;
