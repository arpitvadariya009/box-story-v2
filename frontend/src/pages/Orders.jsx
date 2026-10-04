import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, Search, Download, X, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { ViewIcon, EditIcon, DeleteIcon } from '../components/ActionIcons';
import Toast, { showToast } from '../components/Toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

/* ── Status colours matching image 27 ── */
import EmployeeOrderTracking from '../components/EmployeeOrderTracking';
import DataTable from '../components/DataTable';
import ExportModal from '../components/ExportModal';
import ActionButtons from '../components/ActionButtons';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';
import ThemeDatePicker from '../components/ThemeDatePicker';
import { InputField, SelectField, PrimaryButton, SecondaryButton, FormErrorBanner } from '../components/FormControls';

const STATUS_COLORS = {
  Dispatched:        'bg-[#EBF5FF] text-[#2E86DE]',
  Processing:        'bg-[#FFF3E0] text-[#FF9900]',
  Delivered:         'bg-[#E2FBE9] text-[#10B77F]',
  Confirmed:         'bg-[#EBF5FF] text-[#4A90D9]',
  Pending:           'bg-[#FEF3C7] text-[#D97706]',
  'Pending Approval':'bg-[#FEF3C7] text-[#D97706]',
  Cancelled:         'bg-[#FCE8ED] text-[#E21D48]',
  'Ready to Ship':   'bg-[#FFF3E0] text-[#FF9900]',
};

const ALL_STATUSES = ['All', 'Pending Approval', 'Processing', 'Ready to Ship', 'Dispatched', 'Delivered', 'Cancelled'];

const Orders = () => {
  const { api, user } = useAuth();


  const [orders,      setOrders]      = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients,     setClients]     = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [catalogue,   setCatalogue]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  /* ── toolbar ── */
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState(null);

  /* ── debounce search input ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ── modals ── */
  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  /* ── view order ── */
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  /* ── edit order ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editAddress, setEditAddress] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  /* ── delete order ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── filter (draft → applied) ── */
  const [appliedStatus, setAppliedStatus] = useState('All');
  const [appliedFrom,   setAppliedFrom]   = useState('');
  const [appliedTo,     setAppliedTo]     = useState('');
  const [draftStatus,   setDraftStatus]   = useState('All');
  const [draftFrom,     setDraftFrom]     = useState('');
  const [draftTo,       setDraftTo]       = useState('');

  /* ── create-order form ── */
  const [form, setForm] = useState({
    clientId: '', productId: '', quantity: 100, amount: 0,
    contactPerson: '', deliveryAddress: '',
  });
  const [creating, setCreating] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderFieldErrors, setOrderFieldErrors] = useState({});

  /* ── update status ── */
  const [updatingOrderId,  setUpdatingOrderId]  = useState(null);
  const [updateStatusVal,  setUpdateStatusVal]  = useState('');
  const [carrier,          setCarrier]          = useState('');
  const [trackingNumber,   setTrackingNumber]   = useState('');

  /* ── fetch clients & products ── */
  useEffect(() => {
    fetchClientsAndProducts();
    api.get('/products/catalogue/client')
      .then(r => setCatalogue(r.data.products || []))
      .catch(() => {});
  }, []);

  /* ── fetch orders with server-side pagination & filters ── */
  useEffect(() => {
    fetchOrders();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedStatus, appliedFrom, appliedTo]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedStatus && appliedStatus !== 'All') params.status = appliedStatus;
      if (appliedFrom) params.from = appliedFrom;
      if (appliedTo) params.to = appliedTo;

      const res = await api.get('/orders', { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        setTotalOrders(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        // Fallback: If backend returned full array, slice to the exact page size
        const total = res.data.length;
        setTotalOrders(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setOrders(res.data.slice(start, start + rowsPerPage));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndProducts = async () => {
    try {
      const [rc, rp] = await Promise.all([
        api.get('/clients').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ]);
      setClients(rc.data || []);
      const prods = rp.data || [];
      setAllProducts(prods);
      if (rc.data?.length) setForm(f => ({ ...f, clientId: rc.data[0]._id }));
      if (prods.length) {
        const p0 = prods[0];
        setForm(f => ({
          ...f,
          productId: p0._id,
          amount: (p0.basePrice || 0) * (Number(f.quantity) || 100)
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdminOrStaff = ['Admin', 'SuperAdmin', 'Procurement', 'WarehouseLogistics'].includes(user?.role);

  const formatINR = v =>
    v != null
      ? '₹' + Number(v).toLocaleString('en-IN')
      : '₹' + '0';

  /* ── Table Columns Definition ── */
  const columns = [
    {
      header: 'Order ID',
      key: 'orderNumber',
      render: (order) => (
        <span className="text-[#D90B37] font-semibold text-[13px] cursor-pointer hover:underline">
          {order.orderNumber || '—'}
        </span>
      ),
    },
    {
      header: 'Client',
      key: 'client',
      render: (order) => (
        <span className="text-[#0F1729] font-medium">
          {order.client?.companyName || '—'}
        </span>
      ),
    },
    {
      header: 'Product',
      key: 'product',
      render: (order) => (
        <span className="text-[#545454]">
          {order.items?.[0]?.product?.name || '—'}
        </span>
      ),
    },
    {
      header: 'Qty',
      key: 'quantity',
      render: (order) => (
        <span className="text-[#0F1729] font-medium">
          {order.items?.[0]?.quantity ?? '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (order) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
          {order.status || '—'}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (order) => (
        <span className="text-[#878787]">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-CA') : '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      key: 'totalAmount',
      render: (order) => (
        <span className="font-semibold text-[#0F1729]">
          {formatINR(order.totalAmount)}
        </span>
      ),
    },
    ...(isAdminOrStaff ? [{
      header: 'Actions',
      key: 'actions',
      render: (order) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenView(order)}
            title="View Order Details"
            className="p-1.5 text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <ViewIcon size={16} />
          </button>
          <button
            onClick={() => handleOpenEdit(order)}
            title="Edit Order"
            className="p-1.5 text-slate-500 hover:text-[#D97706] hover:bg-amber-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={() => handleOpenDelete(order)}
            title="Delete Order"
            className="p-1.5 text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      ),
    }] : []),
  ];

  /* ── handlers ── */
  const handleOpenView = (order) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditQuantity(order.items?.[0]?.quantity || 1);
    setEditTotalAmount(order.totalAmount || 0);
    setEditStatus(order.status || 'Pending');
    setEditAddress(order.shippingAddress?.street || '');
    setEditDate(order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : '');
    setEditError('');
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setEditError('');
    const errs = {};

    if (!editQuantity || Number(editQuantity) < 1) {
      errs.quantity = 'Quantity must be at least 1';
    }
    if (editTotalAmount === '' || Number(editTotalAmount) < 0) {
      errs.totalAmount = 'Total amount cannot be negative';
    }

    if (Object.keys(errs).length > 0) {
      setEditFieldErrors(errs);
      setEditError(Object.values(errs)[0]);
      return;
    }

    setEditLoading(true);
    try {
      await api.put(`/orders/${editingOrder._id}`, {
        quantity: Number(editQuantity),
        totalAmount: Number(editTotalAmount),
        status: editStatus,
        shippingAddress: {
          street: editAddress.trim(),
        },
        expectedDeliveryDate: editDate || undefined,
      });
      showToast(setToast, 'success', 'Order updated successfully!');
      setShowEditModal(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (order) => {
    setDeletingOrder(order);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/orders/${deletingOrder._id}`);
      showToast(setToast, 'success', 'Order deleted successfully!');
      setShowDeleteModal(false);
      setDeletingOrder(null);
      fetchOrders();
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetOrderForm = () => {
    const defaultProduct = allProducts[0];
    setForm({
      clientId: clients[0]?._id || '',
      productId: defaultProduct?._id || '',
      quantity: 100,
      amount: (defaultProduct?.basePrice || 0) * 100,
      contactPerson: '',
      deliveryAddress: '',
    });
    setOrderError('');
    setOrderFieldErrors({});
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    resetOrderForm();
  };

  const openFilter = () => {
    setDraftStatus(appliedStatus); setDraftFrom(appliedFrom); setDraftTo(appliedTo);
    setShowFilter(true);
  };
  const applyFilter = () => {
    setAppliedStatus(draftStatus); setAppliedFrom(draftFrom); setAppliedTo(draftTo);
    setShowFilter(false);
  };
  const resetFilter = () => {
    setDraftStatus('All'); setDraftFrom(''); setDraftTo('');
    setAppliedStatus('All'); setAppliedFrom(''); setAppliedTo('');
    setShowFilter(false);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    const fieldErrors = {};

    if (!form.clientId) {
      fieldErrors.clientId = 'Please select a client';
    }
    if (!form.productId) {
      fieldErrors.productId = 'Please select a product';
    }
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      fieldErrors.quantity = 'Quantity must be at least 1';
    } else {
      const selProduct = allProducts.find(p => p._id === form.productId);
      const availableStock = selProduct?.availableQty ?? selProduct?.initialQty;
      if (availableStock !== undefined && availableStock !== null && qty > availableStock) {
        fieldErrors.quantity = `Insufficient stock for product ${selProduct?.name || ''}. Available: ${availableStock}`;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setOrderFieldErrors(fieldErrors);
      setOrderError(Object.values(fieldErrors)[0]);
      return;
    }

    setCreating(true);
    try {
      const amt = Number(form.amount) || 0;
      await api.post('/orders', {
        client: form.clientId,
        items: [{ product: form.productId, quantity: qty, price: qty > 0 ? amt / qty : 0 }],
        shippingAddress: {
          street:  form.deliveryAddress || 'Custom Destination',
          city:    'City',
          state:   'State',
          zipCode: '100001',
          country: 'India',
        },
      });
      setShowCreate(false);
      setForm({
        clientId: clients[0]?._id || '',
        productId: allProducts[0]?._id || '',
        quantity: 100,
        amount: 0,
        contactPerson: '',
        deliveryAddress: ''
      });
      setOrderError('');
      setOrderFieldErrors({});
      fetchOrders();
      showToast(setToast, 'success', 'Order created successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create order.';
      setOrderError(errMsg);
      // Display inline inside modal; do not show top-right toast
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = { status: updateStatusVal };
      if (updateStatusVal === 'Dispatched') payload.trackingDetails = { carrier, trackingNumber };
      await api.put(`/orders/${updatingOrderId}/status`, payload);
      setUpdatingOrderId(null); setUpdateStatusVal(''); setCarrier(''); setTrackingNumber('');
      fetchOrders();
      showToast(setToast, 'success', 'Order status updated.');
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportProgress({ percentage: 0, message: 'Starting export queue...' });
    try {
      const exportList = await fetchPaginatedDataQueue({
        fetchPage: async (page, limit) => {
          const params = { page, limit };
          if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
          if (appliedStatus && appliedStatus !== 'All') params.status = appliedStatus;
          if (appliedFrom) params.from = appliedFrom;
          if (appliedTo) params.to = appliedTo;

          const res = await api.get('/orders', { params });
          const ordersData = res.data?.orders || (Array.isArray(res.data) ? res.data : []);
          return {
            items: ordersData,
            total: res.data?.total ?? ordersData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Order ID', 'Client', 'Product', 'Qty', 'Status', 'Date', 'Amount'];
      const rows = exportList.map((o) => [
        o.orderNumber || '—',
        o.client?.companyName || '—',
        o.items?.[0]?.product?.name || '—',
        o.items?.[0]?.quantity ?? '—',
        o.status || '—',
        o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '—',
        formatINR(o.totalAmount),
      ]);

      handleExport(exportFormat, 'Orders_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} orders successfully.`);
      setShowExport(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export orders.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  /* ── render ── */
  if (user?.role === 'Employee') {
    return <EmployeeOrderTracking />;
  }

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">

      {/* Main Card */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">

        {/* Toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Orders</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalOrders}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-[#878787]" size={16} />
            </div>
            {/* Filter & Export Buttons */}
            <ActionButtons
              compact
              hasActiveFilter={Boolean((appliedStatus && appliedStatus !== 'All' && appliedStatus !== 'All statuses') || appliedFrom || appliedTo)}
              onFilterClick={openFilter}
              onExportClick={() => setShowExport(true)}
            />
            {/* New Order */}
            <button
              onClick={() => setShowCreate(true)}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm ml-auto sm:ml-0 border-none whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found"
          emptySubMessage="Try adjusting your filters or create a new order"
          emptyIcon={ShoppingCart}
          itemLabel="orders"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalOrders}
          rowsPerPage={rowsPerPage}
          onPageChange={p => setCurrentPage(p)}
          onRowsPerPageChange={r => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ——— CREATE NEW ORDER MODAL ——— */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-[#E1E7EF] flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Create New Order</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Inline modal error banner ("pati") */}
                <FormErrorBanner error={orderError} onClose={() => setOrderError('')} />

                {/* Row 1: Client + Product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Client"
                    required
                    value={form.clientId}
                    error={orderFieldErrors.clientId}
                    onChange={e => {
                      setForm(f => ({ ...f, clientId: e.target.value }));
                      if (orderFieldErrors.clientId) setOrderFieldErrors(prev => ({ ...prev, clientId: '' }));
                    }}
                    placeholder="Select Client"
                  >
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.companyName}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Product"
                    required
                    value={form.productId}
                    error={orderFieldErrors.productId}
                    onChange={e => {
                      const prodId = e.target.value;
                      const selProd = allProducts.find(p => p._id === prodId);
                      const baseP = selProd?.basePrice || 0;
                      setForm(f => ({
                        ...f,
                        productId: prodId,
                        amount: baseP * (Number(f.quantity) || 1)
                      }));
                      if (orderFieldErrors.productId) setOrderFieldErrors(prev => ({ ...prev, productId: '' }));
                    }}
                    placeholder="Select Product"
                  >
                    {allProducts.length > 0
                      ? allProducts.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} {p.availableQty !== undefined ? `(Stock: ${p.availableQty})` : ''}
                          </option>
                        ))
                      : catalogue.map(c => (
                          <option key={c.product?._id} value={c.product?._id}>
                            {c.product?.name}
                          </option>
                        ))}
                  </SelectField>
                </div>

                {/* Row 2: Quantity + Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Quantity"
                    type="number"
                    min="1"
                    required
                    value={form.quantity}
                    error={orderFieldErrors.quantity}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const num = Number(val);
                      const selProd = allProducts.find(p => p._id === form.productId);
                      const baseP = selProd?.basePrice || 0;
                      setForm(f => ({
                        ...f,
                        quantity: val,
                        amount: baseP ? baseP * (num || 0) : f.amount
                      }));
                      if (orderFieldErrors.quantity) setOrderFieldErrors(prev => ({ ...prev, quantity: '' }));
                    }}
                    placeholder="100"
                  />

                  <InputField
                    label="Amount (₹)"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                {/* Row 3: Contact Person + Delivery Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Contact Person"
                    value={form.contactPerson}
                    onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                    placeholder="Name"
                  />
                  <InputField
                    label="Delivery Address"
                    value={form.deliveryAddress}
                    onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                    placeholder="Address"
                  />
                </div>
              </div>

              {/* Clean styled footer eliminating bottom white patch */}
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] rounded-b-2xl flex items-center justify-end gap-3 flex-shrink-0">
                <SecondaryButton onClick={closeCreateModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={creating}>
                  Create Order
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â•â•â• FILTER MODAL â€” image 29 â•â•â• */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Filter Records</h3>
              </div>
              <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={draftStatus}
                    onChange={e => setDraftStatus(e.target.value)}
                    className="w-full border-2 border-[#D90B37] rounded-xl px-4 py-2.5 text-[13px] text-[#0F1729] focus:outline-none appearance-none bg-white cursor-pointer"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
              {/* Date range */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Date From</label>
                  <ThemeDatePicker
                    value={draftFrom || ''}
                    maxDate={draftTo || ''}
                    onChange={val => {
                      setDraftFrom(val || '');
                      if (val && draftTo && val > draftTo) {
                        setDraftTo('');
                      }
                    }}
                    placeholder="dd-mm-yyyy"
                    ariaLabel="Date From"
                    align="left"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Date To</label>
                  <ThemeDatePicker
                    value={draftTo || ''}
                    minDate={draftFrom || ''}
                    onChange={val => {
                      if (val && draftFrom && val < draftFrom) return;
                      setDraftTo(val || '');
                    }}
                    placeholder="dd-mm-yyyy"
                    ariaLabel="Date To"
                    align="right"
                  />
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetFilter}
                  className="px-5 py-2.5 border border-[#E3E3E3] text-[#878787] rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilter}
                  className="px-5 py-2.5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer border-none"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â•â•â• EXPORT MODAL â€” image 30 â•â•â• */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Export Data</h3>
              </div>
              <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Format</label>
                <div className="relative">
                  <select
                    value={exportFormat}
                    onChange={e => setExportFormat(e.target.value)}
                    className="w-full border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none bg-white cursor-pointer"
                  >
                    {['PDF', 'CSV', 'Excel'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
              <p className="text-[13px] text-[#878787]">
                <span className="font-bold text-[#0F1729]">{totalOrders}</span> records will be exported
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowExport(false)}
                  className="px-5 py-2.5 border border-[#E3E3E3] text-[#878787] rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer border-none flex items-center gap-1.5"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â•â•â• UPDATE STATUS MODAL (kept for admin functionality) â•â•â• */}
      {updatingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Update Order Stage</h3>
              </div>
              <button onClick={() => setUpdatingOrderId(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Select Stage</label>
                <div className="relative">
                  <select
                    value={updateStatusVal}
                    onChange={e => setUpdateStatusVal(e.target.value)}
                    className="w-full border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none bg-white cursor-pointer"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Ready to Ship">Ready to Ship</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
              {updateStatusVal === 'Dispatched' && (
                <div className="space-y-2 border-t border-[#F0F0F0] pt-3">
                  <label className="block text-[13px] font-semibold text-[#0F1729]">Courier Details</label>
                  <input
                    type="text" placeholder="Carrier (e.g. FedEx)" required
                    value={carrier} onChange={e => setCarrier(e.target.value)}
                    className="w-full border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] placeholder-[#878787]"
                  />
                  <input
                    type="text" placeholder="Tracking Number" required
                    value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                    className="w-full border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] placeholder-[#878787]"
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer border-none"
              >
                Apply Stage
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── VIEW ORDER DETAILS MODAL ── */}
      {showViewModal && viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[520px] rounded-2xl shadow-2xl p-6 border border-[#E1E7EF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#D90B37] flex items-center justify-center font-bold">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">Order Details</h3>
                  <p className="text-xs text-[#878787] font-mono">ID: <span className="text-[#D90B37] font-semibold">{viewingOrder.orderNumber}</span></p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingOrder(null); }}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client</div>
                  <div className="text-sm font-bold text-[#0F1729] mt-0.5">{viewingOrder.client?.companyName || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                  <div className="mt-0.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[viewingOrder.status] || 'bg-slate-100 text-slate-500'}`}>
                      {viewingOrder.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs text-slate-400">Product</div>
                  <div className="font-semibold text-[#0F1729] mt-0.5">{viewingOrder.items?.[0]?.product?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Quantity</div>
                  <div className="font-semibold text-[#0F1729] mt-0.5">{viewingOrder.items?.[0]?.quantity ?? 1} units</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Total Amount</div>
                  <div className="text-base font-bold text-[#D90B37] mt-0.5">{formatINR(viewingOrder.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Order Placed</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">
                    {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>

              {viewingOrder.shippingAddress?.street && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">Shipping Destination</div>
                  <div className="text-[13px] text-[#545454] mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {viewingOrder.shippingAddress.street}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <button
                type="button"
                onClick={() => { setShowViewModal(false); setViewingOrder(null); }}
                className="px-4 py-2 border border-[#E3E3E3] text-[#878787] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const o = viewingOrder;
                  setShowViewModal(false);
                  handleOpenEdit(o);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ORDER MODAL ── */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl p-6 border border-[#E1E7EF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div>
                <h3 className="text-[17px] font-bold text-[#0F1729]">Edit Order</h3>
                <p className="text-xs text-[#878787] mt-0.5 font-medium">Order ID: <span className="text-[#D90B37] font-semibold">{editingOrder.orderNumber}</span></p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <FormErrorBanner error={editError} onClose={() => setEditError('')} />

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client</div>
                  <div className="text-[13px] font-bold text-[#0F1729]">{editingOrder.client?.companyName || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</div>
                  <div className="text-[13px] font-bold text-[#0F1729]">{editingOrder.items?.[0]?.product?.name || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Quantity <span className="text-[#D90B37]">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={editQuantity}
                    onChange={e => {
                      setEditQuantity(e.target.value);
                      if (editFieldErrors.quantity) setEditFieldErrors(p => ({ ...p, quantity: '' }));
                    }}
                    className={`w-full border ${editFieldErrors.quantity ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20' : 'border-[#E3E3E3]'} rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37]`}
                  />
                  {editFieldErrors.quantity && (
                    <p className="text-[12px] text-[#D90B37] mt-1 font-medium">{editFieldErrors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Total Amount (₹) <span className="text-[#D90B37]">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={editTotalAmount}
                    onChange={e => {
                      setEditTotalAmount(e.target.value);
                      if (editFieldErrors.totalAmount) setEditFieldErrors(p => ({ ...p, totalAmount: '' }));
                    }}
                    className={`w-full border ${editFieldErrors.totalAmount ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20' : 'border-[#E3E3E3]'} rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37]`}
                  />
                  {editFieldErrors.totalAmount && (
                    <p className="text-[12px] text-[#D90B37] mt-1 font-medium">{editFieldErrors.totalAmount}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Order Status</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="w-full border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none bg-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Processing">Processing</option>
                      <option value="Ready to Ship">Ready to Ship</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Expected Delivery</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">Shipping Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="Enter full delivery destination..."
                  className="w-full border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0F0F0]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-[#E3E3E3] text-[#878787] rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingOrder(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone and will permanently remove the record."
        itemName={deletingOrder?.orderNumber ? `Order #${deletingOrder.orderNumber}` : ''}
        loading={deleteLoading}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        recordCount={totalOrders}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Orders;
