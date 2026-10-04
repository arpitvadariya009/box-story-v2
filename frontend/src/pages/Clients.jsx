import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, Plus, AlertCircle, Building, X } from 'lucide-react';
import { ViewIcon, EditIcon, DeleteIcon } from '../components/ActionIcons';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import {
  InputField,
  SelectField,
  TextareaField,
  PrimaryButton,
  SecondaryButton,
  ModalFooter,
  FormErrorBanner,
  validateEmail,
  validatePhone,
  validateGstin
} from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

const Clients = () => {
  const { api } = useAuth();
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState(null);

  // View Client States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // New Client Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditTerms, setCreditTerms] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [clientFormError, setClientFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Edit Client Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [editCreditTerms, setEditCreditTerms] = useState('');
  const [editBillingAddress, setEditBillingAddress] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editClientFormError, setEditClientFormError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Client States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter Modal States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All statuses');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
        params.status = appliedFilterStatus;
      }
      if (appliedDateFrom) params.from = appliedDateFrom;
      if (appliedDateTo) params.to = appliedDateTo;

      const res = await api.get('/clients', { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.clients)) {
        setClients(res.data.clients);
        setTotalClients(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        const total = res.data.length;
        setTotalClients(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setClients(res.data.slice(start, start + rowsPerPage));
      }
    } catch (error) {
      console.error('Error fetching clients', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const resetClientForm = () => {
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setGstin('');
    setCreditTerms('');
    setBillingAddress('');
    setClientFormError('');
    setFieldErrors({});
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetClientForm();
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setClientFormError('');
    const errs = {};

    if (!companyName.trim()) {
      errs.companyName = 'Company name is required';
    }
    if (!contactPerson.trim()) {
      errs.contactPerson = 'Contact person is required';
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      errs.email = emailErr;
    }
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      errs.phone = phoneErr;
    }
    if (gstin.trim()) {
      const gstinErr = validateGstin(gstin);
      if (gstinErr) {
        errs.gstin = gstinErr;
      }
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setClientFormError(Object.values(errs)[0]);
      return;
    }

    try {
      await api.post('/clients', {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gstin: gstin.trim().toUpperCase(),
        paymentTerms: creditTerms.trim() || 'Net 30',
        billingAddress: { street: billingAddress.trim() },
      });
      setShowCreateModal(false);
      fetchClients();
      showToast(setToast, 'success', `Client "${companyName}" onboarded successfully!`);
      resetClientForm();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register client.';
      setClientFormError(msg);
      // Inline banner inside modal; never display top-right toast
    }
  };

  const handleToggleStatus = async (client) => {
    try {
      const newStatus = client.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/clients/${client._id}`, { status: newStatus });
      fetchClients();
      showToast(setToast, 'success', `Status updated to ${newStatus}.`);
    } catch (error) {
      showToast(setToast, 'error', 'Failed to update status.');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this corporate client?')) return;
    try {
      await api.delete(`/clients/${clientId}`);
      fetchClients();
      showToast(setToast, 'success', 'Client deleted successfully.');
    } catch (error) {
      showToast(setToast, 'error', 'Failed to delete client.');
    }
  };

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
          const params = { page, limit };
          if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
          if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
            params.status = appliedFilterStatus;
          }
          if (appliedDateFrom) params.from = appliedDateFrom;
          if (appliedDateTo) params.to = appliedDateTo;

          const res = await api.get('/clients', { params });
          const clientsData = res.data?.clients || (Array.isArray(res.data) ? res.data : []);
          return {
            items: clientsData,
            total: res.data?.total ?? clientsData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Company', 'Contact Person', 'Status', 'Campaigns', 'Orders', 'Total Value'];
      const rows = exportList.map((c) => [
        c.companyName || '—',
        c.contactPerson || '—',
        c.status || 'Active',
        c.campaignsCount ?? 0,
        c.ordersCount ?? 0,
        formatINR(c.totalSpend || 0),
      ]);

      handleExport(exportFormat, 'Corporate_Clients_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} client records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export clients.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const handleOpenView = (client) => {
    setViewingClient(client);
    setShowViewModal(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setEditCompanyName(client.companyName || '');
    setEditContactPerson(client.contactPerson || '');
    setEditEmail(client.email || '');
    setEditPhone(client.phone || '');
    setEditGstin(client.gstin || '');
    setEditCreditTerms(client.creditTerms || '');
    setEditBillingAddress(client.billingAddress || '');
    setEditStatus(client.status || 'Active');
    setEditClientFormError('');
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!editingClient) return;
    setEditClientFormError('');
    const errs = {};

    if (!editCompanyName.trim()) {
      errs.companyName = 'Company name is required';
    }
    if (!editContactPerson.trim()) {
      errs.contactPerson = 'Contact person is required';
    }
    const emailErr = validateEmail(editEmail);
    if (emailErr) {
      errs.email = emailErr;
    }
    const phoneErr = validatePhone(editPhone);
    if (phoneErr) {
      errs.phone = phoneErr;
    }
    const gstinErr = validateGstin(editGstin);
    if (gstinErr) {
      errs.gstin = gstinErr;
    }

    if (Object.keys(errs).length > 0) {
      setEditFieldErrors(errs);
      setEditClientFormError(Object.values(errs)[0]);
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        companyName: editCompanyName.trim(),
        contactPerson: editContactPerson.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        gstin: editGstin.trim().toUpperCase(),
        creditTerms: editCreditTerms.trim(),
        billingAddress: editBillingAddress.trim(),
        status: editStatus,
      };
      await api.put(`/clients/${editingClient._id}`, payload);
      showToast(setToast, 'success', `Client "${editCompanyName}" updated successfully.`);
      setShowEditModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      setEditClientFormError(err.response?.data?.message || 'Failed to update client.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (client) => {
    setDeletingClient(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/clients/${deletingClient._id}`);
      showToast(setToast, 'success', `Client "${deletingClient.companyName}" deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingClient(null);
      fetchClients();
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to delete client.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Company',
      key: 'companyName',
      render: (client) => (
        <span className="text-sm font-semibold text-[#0F1729]">{client.companyName || '—'}</span>
      ),
    },
    {
      header: 'Contact Person',
      key: 'contactPerson',
      render: (client) => (
        <div>
          <div className="text-sm text-[#0F1729]">{client.contactPerson || '—'}</div>
          {client.email && <div className="text-xs text-[#878787]">{client.email}</div>}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (client) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(client);
          }}
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
            (client.status || 'Active') === 'Active'
              ? 'bg-[#2ECC70]/10 text-[#2ECC70] border-[#2ECC70]/20 hover:bg-[#2ECC70]/20'
              : 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20 hover:bg-[#FF9900]/20'
          }`}
          title="Click to toggle status"
        >
          {client.status || 'Active'}
        </button>
      ),
    },
    {
      header: 'Campaigns',
      key: 'campaignsCount',
      render: (client) => (
        <span className="text-sm text-[#0F1729]">{client.campaignsCount ?? 0}</span>
      ),
    },
    {
      header: 'Orders',
      key: 'ordersCount',
      render: (client) => (
        <span className="text-sm text-[#0F1729]">{client.ordersCount ?? 0}</span>
      ),
    },
    {
      header: 'Total Value',
      key: 'totalSpend',
      render: (client) => (
        <span className="text-sm font-medium text-[#0F1729]">{formatINR(client.totalSpend || 0)}</span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'center',
      headerClassName: 'text-center whitespace-nowrap',
      render: (client) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenView(client)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
            title="View Client Details"
          >
            <ViewIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(client)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#D97706] hover:bg-amber-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Edit Client"
          >
            <EditIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(client)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Delete Client"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        
        {/* Header toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          
          {/* Left Title & Counter Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Clients</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalClients}
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-[#878787]" size={16} />
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

            {/* Add Client Primary Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage="No corporate clients found"
          emptySubMessage="Try adjusting your search or filters"
          emptyIcon={Building}
          itemLabel="clients"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalClients}
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
        statusOptions={['All statuses', 'Active', 'Pending', 'Inactive']}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Export Data Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        recordCount={totalClients}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />

      {/* Add/Onboard Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[620px] rounded-2xl shadow-2xl overflow-hidden border border-[#E1E7EF] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Onboard New Client</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateClient} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Inline modal error banner ("pati") */}
                <FormErrorBanner error={clientFormError} onClose={() => setClientFormError('')} />

                {/* Row 1: Company Name + HR Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Company Name"
                    required
                    value={companyName}
                    error={fieldErrors.companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: '' }));
                    }}
                    placeholder="Company Name"
                  />
                  <InputField
                    label="HR Contact"
                    required
                    value={contactPerson}
                    error={fieldErrors.contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (fieldErrors.contactPerson) setFieldErrors(prev => ({ ...prev, contactPerson: '' }));
                    }}
                    placeholder="Contact person name"
                  />
                </div>

                {/* Row 2: Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    required
                    value={email}
                    error={fieldErrors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="hr@company.com"
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    isPhone={true}
                    required
                    value={phone}
                    error={fieldErrors.phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* Row 3: GSTIN + Credit Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="GSTIN"
                    isGstin={true}
                    value={gstin}
                    error={fieldErrors.gstin}
                    onChange={(e) => {
                      setGstin(e.target.value);
                      if (fieldErrors.gstin) setFieldErrors(prev => ({ ...prev, gstin: '' }));
                    }}
                    placeholder="15-digit GSTIN (e.g. 24AAAAA0000A1Z5)"
                  />
                  <InputField
                    label="Credit Terms"
                    value={creditTerms}
                    onChange={(e) => setCreditTerms(e.target.value)}
                    placeholder="e.g. Net 30"
                  />
                </div>

                {/* Billing Address */}
                <TextareaField
                  label="Billing Address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Full address"
                  rows={3}
                />
              </div>

              {/* Clean styled footer */}
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] rounded-b-2xl flex items-center justify-end gap-3 flex-shrink-0">
                <SecondaryButton onClick={closeCreateModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Onboard Client
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[626px] rounded-2xl shadow-2xl relative p-8 border border-[#E1E7EF]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#D90B37]">
                <Building2 size={24} />
                <h3 className="text-[20px] font-bold text-[#0F1729]">Edit Client</h3>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingClient(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
                <span className="text-xl">✕</span>
              </button>
            </div>

            <FormErrorBanner error={editClientFormError} onClose={() => setEditClientFormError('')} />

            {/* Body */}
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Company Name"
                  required
                  value={editCompanyName}
                  onChange={(e) => {
                    setEditCompanyName(e.target.value);
                    if (editFieldErrors.companyName) setEditFieldErrors((p) => ({ ...p, companyName: '' }));
                  }}
                  error={editFieldErrors.companyName}
                  placeholder="Company Name"
                />
                <InputField
                  label="HR / Contact Person"
                  required
                  value={editContactPerson}
                  onChange={(e) => {
                    setEditContactPerson(e.target.value);
                    if (editFieldErrors.contactPerson) setEditFieldErrors((p) => ({ ...p, contactPerson: '' }));
                  }}
                  error={editFieldErrors.contactPerson}
                  placeholder="Contact person name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (editFieldErrors.email) setEditFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  error={editFieldErrors.email}
                  placeholder="hr@company.com"
                />
                <InputField
                  label="Phone"
                  type="tel"
                  isPhone
                  required
                  value={editPhone}
                  onChange={(e) => {
                    setEditPhone(e.target.value);
                    if (editFieldErrors.phone) setEditFieldErrors((p) => ({ ...p, phone: '' }));
                  }}
                  error={editFieldErrors.phone}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="GSTIN"
                  isGstin
                  value={editGstin}
                  onChange={(e) => {
                    setEditGstin(e.target.value);
                    if (editFieldErrors.gstin) setEditFieldErrors((p) => ({ ...p, gstin: '' }));
                  }}
                  error={editFieldErrors.gstin}
                  placeholder="GSTIN number"
                />
                <InputField
                  label="Credit Terms"
                  value={editCreditTerms}
                  onChange={(e) => setEditCreditTerms(e.target.value)}
                  placeholder="e.g. Net 30"
                />
                <SelectField
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </SelectField>
              </div>

              <TextareaField
                label="Billing Address"
                value={editBillingAddress}
                onChange={(e) => setEditBillingAddress(e.target.value)}
                placeholder="Full address"
                rows={3}
              />

              <ModalFooter>
                <SecondaryButton onClick={() => { setShowEditModal(false); setEditingClient(null); }}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={editLoading}>
                  Save Changes
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* View Client Details Modal */}
      {showViewModal && viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[520px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2E86DE] flex items-center justify-center font-bold text-base">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">{viewingClient.companyName || 'Client Details'}</h3>
                  <p className="text-xs text-[#878787]">{viewingClient.contactPerson} • {viewingClient.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingClient(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Campaigns</div>
                  <div className="text-base font-bold text-[#0F1729] mt-0.5">{viewingClient.campaignsCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Orders</div>
                  <div className="text-base font-bold text-[#0F1729] mt-0.5">{viewingClient.ordersCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Value</div>
                  <div className="text-base font-bold text-[#D90B37] mt-0.5">{formatINR(viewingClient.totalSpend || 0)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Phone</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingClient.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">GSTIN</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingClient.gstin || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Credit Terms</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingClient.creditTerms || 'Net 30'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Status</div>
                  <div className="mt-0.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      (viewingClient.status || 'Active') === 'Active' ? 'bg-[#2ECC70]/15 text-[#2ECC70]' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {viewingClient.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {viewingClient.billingAddress && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">Billing Address</div>
                  <div className="text-[13px] text-[#545454] mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {typeof viewingClient.billingAddress === 'object' 
                      ? `${viewingClient.billingAddress.street || ''}, ${viewingClient.billingAddress.city || ''}, ${viewingClient.billingAddress.state || ''} ${viewingClient.billingAddress.zipCode || ''}` 
                      : viewingClient.billingAddress}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingClient(null); }}>
                Close
              </SecondaryButton>
              <button
                type="button"
                onClick={() => {
                  const c = viewingClient;
                  setShowViewModal(false);
                  handleOpenEdit(c);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Client Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingClient(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this corporate client? All associated records may be impacted."
        itemName={deletingClient ? `${deletingClient.companyName} (${deletingClient.contactPerson})` : ''}
        loading={deleteLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Clients;
