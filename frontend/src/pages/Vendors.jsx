import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Search, Plus, AlertCircle, X } from 'lucide-react';
import { ViewIcon, EditIcon, DeleteIcon } from '../components/ActionIcons';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  InputField,
  SelectField,
  PrimaryButton,
  SecondaryButton,
  ModalFooter,
  FormErrorBanner,
  validateEmail,
  validatePhone
} from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const Vendors = () => {
  const { api } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All statuses');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  // View Vendor State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingVendor, setViewingVendor] = useState(null);

  // Edit Vendor State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editProductsCount, setEditProductsCount] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editVendorError, setEditVendorError] = useState('');
  const [editVendorFieldErrors, setEditVendorFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Vendor State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // New Vendor Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [productsCount, setProductsCount] = useState('');
  const [vendorError, setVendorError] = useState('');
  const [vendorFieldErrors, setVendorFieldErrors] = useState({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  const fetchVendors = async () => {
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

      const res = await api.get('/vendors', { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.vendors)) {
        setVendors(res.data.vendors);
        setTotalVendors(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        const total = res.data.length;
        setTotalVendors(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setVendors(res.data.slice(start, start + rowsPerPage));
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const resetVendorForm = () => {
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setPaymentTerms('');
    setProductsCount('');
    setVendorError('');
    setVendorFieldErrors({});
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetVendorForm();
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setVendorError('');
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Vendor name is required';
    }
    if (!contactPerson.trim()) {
      errs.contactPerson = 'Contact person is required';
    }
    if (email.trim()) {
      const emailErr = validateEmail(email);
      if (emailErr) errs.email = emailErr;
    }
    if (phone.trim()) {
      const phoneErr = validatePhone(phone);
      if (phoneErr) errs.phone = phoneErr;
    }

    if (Object.keys(errs).length > 0) {
      setVendorFieldErrors(errs);
      setVendorError(Object.values(errs)[0]);
      return;
    }

    const newVendorData = {
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      paymentTerms: paymentTerms.trim() || 'Net 30',
      productsCount: Number(productsCount) || 0,
      rating: 4.5,
      status: 'Active',
    };

    try {
      await api.post('/vendors', newVendorData);
      showToast(setToast, 'success', `Vendor "${name}" registered successfully!`);
      setShowCreateModal(false);
      resetVendorForm();
      fetchVendors();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to register vendor.';
      setVendorError(msg);
      // No toast on error
    }
  };

  const handleOpenView = (vendor) => {
    setViewingVendor(vendor);
    setShowViewModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name || '');
    setEditContactPerson(vendor.contactPerson || '');
    setEditEmail(vendor.email || '');
    setEditPhone(vendor.phone || '');
    setEditPaymentTerms(vendor.paymentTerms || 'Net 30');
    setEditProductsCount(vendor.productsCount !== undefined ? vendor.productsCount : vendor.suppliedProducts?.length || 0);
    setEditStatus(vendor.status || 'Active');
    setEditVendorError('');
    setEditVendorFieldErrors({});
    setShowEditModal(true);
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    setEditVendorError('');
    const errs = {};
    if (!editName.trim()) {
      errs.name = 'Vendor name is required';
    }
    if (!editContactPerson.trim()) {
      errs.contactPerson = 'Contact person is required';
    }
    if (editEmail.trim()) {
      const emailErr = validateEmail(editEmail);
      if (emailErr) errs.email = emailErr;
    }
    if (editPhone.trim()) {
      const phoneErr = validatePhone(editPhone);
      if (phoneErr) errs.phone = phoneErr;
    }

    if (Object.keys(errs).length > 0) {
      setEditVendorFieldErrors(errs);
      setEditVendorError(Object.values(errs)[0]);
      return;
    }

    setEditLoading(true);
    try {
      await api.put(`/vendors/${editingVendor._id}`, {
        name: editName.trim(),
        contactPerson: editContactPerson.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        paymentTerms: editPaymentTerms.trim() || 'Net 30',
        productsCount: Number(editProductsCount) || 0,
        status: editStatus,
      });
      showToast(setToast, 'success', `Vendor "${editName}" updated successfully!`);
      setShowEditModal(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (error) {
      setEditVendorError(error.response?.data?.message || 'Failed to update vendor.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (vendor) => {
    setDeletingVendor(vendor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVendor) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/vendors/${deletingVendor._id}`);
      showToast(setToast, 'success', `Vendor "${deletingVendor.name}" deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingVendor(null);
      fetchVendors();
    } catch (error) {
      showToast(setToast, 'error', error.response?.data?.message || 'Failed to delete vendor.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (vendor) => {
    try {
      const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/vendors/${vendor._id}`, { status: newStatus });
      fetchVendors();
      showToast(setToast, 'success', `Status updated to ${newStatus}.`);
    } catch (error) {
      showToast(setToast, 'error', 'Failed to update vendor status.');
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

          const res = await api.get('/vendors', { params });
          const vendorsData = res.data?.vendors || (Array.isArray(res.data) ? res.data : []);
          return {
            items: vendorsData,
            total: res.data?.total ?? vendorsData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Vendor Name', 'Contact Person', 'Phone', 'Products', 'Payment Terms', 'Rating', 'Status'];
      const rows = exportList.map((v) => [
        v.name || '—',
        v.contactPerson || '—',
        v.phone || '—',
        v.productsCount !== undefined ? v.productsCount : v.suppliedProducts?.length || 0,
        v.paymentTerms || 'Net 30',
        v.rating ? `${v.rating}/5` : '4.5/5',
        v.status || 'Active',
      ]);

      handleExport(exportFormat, 'Vendors_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} vendor records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export vendors.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const columns = [
    {
      header: 'VENDOR NAME',
      key: 'name',
      render: (vendor) => (
        <span 
          className="font-semibold text-[#0F1729] text-sm hover:text-[#D90B37] cursor-pointer transition-colors"
          onClick={() => handleOpenView(vendor)}
        >
          {vendor.name || '—'}
        </span>
      ),
    },
    {
      header: 'CONTACT PERSON',
      key: 'contactPerson',
      render: (vendor) => (
        <div>
          <div className="text-sm text-[#0F1729]">{vendor.contactPerson || '—'}</div>
          {vendor.email && <div className="text-xs text-[#878787]">{vendor.email}</div>}
        </div>
      ),
    },
    {
      header: 'PHONE',
      key: 'phone',
      render: (vendor) => (
        <span className="text-sm text-[#545454]">{vendor.phone || '—'}</span>
      ),
    },
    {
      header: 'PRODUCTS',
      key: 'productsCount',
      render: (vendor) => (
        <span className="text-sm text-[#0F1729] font-medium">
          {vendor.productsCount !== undefined ? vendor.productsCount : vendor.suppliedProducts?.length || 0}
        </span>
      ),
    },
    {
      header: 'PAYMENT TERMS',
      key: 'paymentTerms',
      render: (vendor) => (
        <span className="text-sm text-[#545454]">{vendor.paymentTerms || 'Net 30'}</span>
      ),
    },
    {
      header: 'RATING',
      key: 'rating',
      render: (vendor) => (
        <span className="text-sm font-bold text-[#FA9E14]">
          {vendor.rating ? `${vendor.rating}/5` : '4.5/5'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      key: 'status',
      render: (vendor) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(vendor);
          }}
          className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
            (vendor.status || 'Active') === 'Active'
              ? 'bg-[#E6F4EA] text-[#0D894F] border-[#0D894F]/20 hover:bg-[#E6F4EA]/80'
              : 'bg-[#F1F5F9] text-[#64748B] border-slate-200 hover:bg-slate-200'
          }`}
          title="Click to toggle status"
        >
          {vendor.status || 'Active'}
        </button>
      ),
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      render: (vendor) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenView(vendor)}
            title="View Vendor Details"
            className="p-1.5 text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <ViewIcon size={16} />
          </button>
          <button
            onClick={() => handleOpenEdit(vendor)}
            title="Edit Vendor"
            className="p-1.5 text-slate-500 hover:text-[#D97706] hover:bg-amber-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={() => handleOpenDelete(vendor)}
            title="Delete Vendor"
            className="p-1.5 text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Main Table Container Card */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        {/* Header Toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          {/* Title & Count Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Vendors</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalVendors}
            </span>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-[#878787]" size={16} />
            </div>

            {/* Action Buttons (Filter + Export) */}
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

            {/* Add Vendor Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Universal DataTable Component */}
        <DataTable
          columns={columns}
          data={vendors}
          loading={loading}
          emptyMessage="No vendors found"
          emptySubMessage="Try adjusting your search or filters"
          emptyIcon={Store}
          itemLabel="vendors"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalVendors}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Register New Vendor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white max-w-[540px] w-full rounded-2xl shadow-2xl overflow-hidden border border-[#E1E7EF] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Register New Vendor</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <FormErrorBanner error={vendorError} onClose={() => setVendorError('')} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Vendor Name"
                    required
                    value={name}
                    error={vendorFieldErrors.name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (vendorFieldErrors.name) setVendorFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Company name"
                  />
                  <InputField
                    label="Contact Person"
                    required
                    value={contactPerson}
                    error={vendorFieldErrors.contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (vendorFieldErrors.contactPerson) setVendorFieldErrors(prev => ({ ...prev, contactPerson: '' }));
                    }}
                    placeholder="Name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    error={vendorFieldErrors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (vendorFieldErrors.email) setVendorFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="email@vendor.com"
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    isPhone={true}
                    value={phone}
                    error={vendorFieldErrors.phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (vendorFieldErrors.phone) setVendorFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Payment Terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. Net 30"
                  />
                  <InputField
                    label="Products Count"
                    type="number"
                    min="0"
                    value={productsCount}
                    onChange={(e) => setProductsCount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] rounded-b-2xl flex items-center justify-end gap-3 flex-shrink-0">
                <SecondaryButton onClick={closeCreateModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Register Vendor
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vendor Details Modal */}
      {showViewModal && viewingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[520px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#D90B37] flex items-center justify-center font-bold">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">{viewingVendor.name || 'Vendor Details'}</h3>
                  <p className="text-xs text-[#878787]">{viewingVendor.contactPerson} • {viewingVendor.email || 'No email'}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingVendor(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Products</div>
                  <div className="text-lg font-bold text-[#0F1729] mt-0.5">
                    {viewingVendor.productsCount !== undefined ? viewingVendor.productsCount : viewingVendor.suppliedProducts?.length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rating</div>
                  <div className="text-lg font-bold text-[#FA9E14] mt-0.5">
                    {viewingVendor.rating ? `${viewingVendor.rating}/5` : '4.5/5'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                  <div className="mt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      (viewingVendor.status || 'Active') === 'Active' ? 'bg-[#E6F4EA] text-[#0D894F]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {viewingVendor.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Phone</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingVendor.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Payment Terms</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingVendor.paymentTerms || 'Net 30'}</div>
                </div>
              </div>

              {viewingVendor.gstin && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">GSTIN</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingVendor.gstin}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingVendor(null); }}>
                Close
              </SecondaryButton>
              <button
                type="button"
                onClick={() => {
                  const v = viewingVendor;
                  setShowViewModal(false);
                  handleOpenEdit(v);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[540px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF]">
            {/* Edit Vendor Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2.5 text-[#D90B37]">
                <Store size={22} />
                <h3 className="text-[18px] font-bold text-[#0F1729]">Edit Vendor</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <FormErrorBanner error={editVendorError} onClose={() => setEditVendorError('')} />

            <form onSubmit={handleUpdateVendor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Vendor Name"
                  required
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (editVendorFieldErrors.name) setEditVendorFieldErrors((p) => ({ ...p, name: '' }));
                  }}
                  error={editVendorFieldErrors.name}
                  placeholder="Company name"
                />
                <InputField
                  label="Contact Person"
                  required
                  value={editContactPerson}
                  onChange={(e) => {
                    setEditContactPerson(e.target.value);
                    if (editVendorFieldErrors.contactPerson) setEditVendorFieldErrors((p) => ({ ...p, contactPerson: '' }));
                  }}
                  error={editVendorFieldErrors.contactPerson}
                  placeholder="Name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (editVendorFieldErrors.email) setEditVendorFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  error={editVendorFieldErrors.email}
                  placeholder="email@vendor.com"
                />
                <InputField
                  label="Phone"
                  type="tel"
                  isPhone
                  value={editPhone}
                  onChange={(e) => {
                    setEditPhone(e.target.value);
                    if (editVendorFieldErrors.phone) setEditVendorFieldErrors((p) => ({ ...p, phone: '' }));
                  }}
                  error={editVendorFieldErrors.phone}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Payment Terms"
                  value={editPaymentTerms}
                  onChange={(e) => setEditPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 30"
                />
                <InputField
                  label="Products Count"
                  type="number"
                  min="0"
                  value={editProductsCount}
                  onChange={(e) => setEditProductsCount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <SelectField
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={() => setShowEditModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingVendor(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone and will permanently remove the supplier from your records."
        itemName={deletingVendor?.name}
        loading={deleteLoading}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusOptions={['All statuses', 'Active', 'Inactive']}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
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
        recordCount={totalVendors}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Vendors;
