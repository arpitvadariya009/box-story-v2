import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Plus,
  X,
  Upload,
  CheckCircle2,
} from 'lucide-react';
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
  PrimaryButton,
  SecondaryButton,
  ModalFooter,
  FormErrorBanner
} from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const Inventory = () => {
  const { api, user } = useAuth();
  const [inventoryList, setInventoryList] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Server-side Pagination & Stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [kpiStats, setKpiStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalMovements: 0,
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
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // View Inventory Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  // Edit Inventory Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editAvailQty, setEditAvailQty] = useState('0');
  const [editReservedQty, setEditReservedQty] = useState('0');
  const [editReorderLvl, setEditReorderLvl] = useState('50');
  const [editBinLocation, setEditBinLocation] = useState('');
  const [editWarehouseLocation, setEditWarehouseLocation] = useState('');
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Inventory Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Adjust Stock Modal States
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustType, setAdjustType] = useState('Add Stock');
  const [adjustQty, setAdjustQty] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustFieldErrors, setAdjustFieldErrors] = useState({});

  // 2. Import Stock Modal States
  const [selectedFile, setSelectedFile] = useState(null);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // 3. Export Modal States
  const [exportFormat, setExportFormat] = useState('Excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated inventory whenever page, rows, search, or filters change
  useEffect(() => {
    fetchInventory();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  // Fetch full products list for the adjust modal dropdown
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await api.get('/products');
        if (Array.isArray(res.data)) {
          setAllProductsList(res.data);
        } else if (Array.isArray(res.data?.products)) {
          setAllProductsList(res.data.products);
        }
      } catch (e) {
        console.error('Failed to load products for dropdown:', e);
      }
    };
    fetchAllProducts();
  }, [api]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });

      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (appliedFilterStatus && appliedFilterStatus !== 'All statuses') {
        params.append('status', appliedFilterStatus);
      }
      if (appliedDateFrom) params.append('from', appliedDateFrom);
      if (appliedDateTo) params.append('to', appliedDateTo);

      const res = await api.get(`/inventory?${params.toString()}`);
      const data = res.data;

      if (data && typeof data === 'object' && Array.isArray(data.inventory)) {
        setInventoryList(data.inventory);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.kpis) {
          setKpiStats({
            totalProducts: data.kpis.totalProducts ?? (data.total || 0),
            lowStock: data.kpis.lowStock ?? 0,
            outOfStock: data.kpis.outOfStock ?? 0,
            totalMovements: data.kpis.totalMovements ?? 0,
          });
        }
      } else if (Array.isArray(data)) {
        setInventoryList(data);
        setTotalItems(data.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast(setToast, 'error', error.response?.data?.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  const resetAdjustForm = () => {
    setAdjustProductId('');
    setAdjustType('Add Stock');
    setAdjustQty('');
    setAdjustError('');
    setAdjustFieldErrors({});
  };

  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    resetAdjustForm();
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportSuccess('');
    setImportError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Adjust Stock Submit
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');
    const errs = {};

    if (!adjustProductId) {
      errs.product = 'Please select a product';
    }
    if (!adjustQty || Number(adjustQty) <= 0) {
      errs.qty = 'Please enter a valid positive quantity';
    }

    if (Object.keys(errs).length > 0) {
      setAdjustFieldErrors(errs);
      setAdjustError(Object.values(errs)[0]);
      return;
    }

    setIsAdjusting(true);
    try {
      const typeMap = {
        'Add Stock': 'Inbound',
        'Deduct Stock': 'Outbound',
        'Set Stock': 'Adjustment',
      };

      await api.post('/inventory/adjust', {
        productId: adjustProductId,
        type: typeMap[adjustType] || 'Inbound',
        quantity: Number(adjustQty),
        reference: `Manual adjustment (${adjustType})`,
      });

      setShowAdjustModal(false);
      setAdjustQty('');
      setAdjustError('');
      setAdjustFieldErrors({});
      fetchInventory();
      showToast(setToast, 'success', 'Stock adjusted successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to adjust stock.';
      setAdjustError(msg);
      // Inline display only, no error toast
    } finally {
      setIsAdjusting(false);
    }
  };

  // Import Stock Submit
  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');
    if (!selectedFile) {
      setImportError('Please choose a file to import.');
      return;
    }
    setImportSuccess(`Successfully imported stock updates from ${selectedFile.name}`);
    setTimeout(() => {
      setImportSuccess('');
      setShowImportModal(false);
      setSelectedFile(null);
      fetchInventory();
    }, 1500);
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

  // Helper for status badge styling
  const getStockStatusBadge = (available, reorderLvl) => {
    const isOut = (available || 0) <= 0;
    const isLow = (available || 0) <= (reorderLvl || 10) && !isOut;

    if (isOut) {
      return {
        label: 'Out Of Stock',
        className: 'bg-[#FCE8ED] text-[#E21D48] border-[#F8C4D0]',
      };
    }
    if (isLow) {
      return {
        label: 'Low Stock',
        className: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
      };
    }
    return {
      label: 'In Stock',
      className: 'bg-[#E2FBE9] text-[#10B77F] border-[#C3F4D3]',
    };
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportProgress({ percentage: 0, message: 'Starting export queue...' });
    try {
      const exportList = await fetchPaginatedDataQueue({
        fetchPage: async (page, limit) => {
          const params = new URLSearchParams({ page: String(page), limit: String(limit) });
          if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
          if (appliedFilterStatus && appliedFilterStatus !== 'All statuses') {
            params.append('status', appliedFilterStatus);
          }
          if (appliedDateFrom) params.append('from', appliedDateFrom);
          if (appliedDateTo) params.append('to', appliedDateTo);

          const res = await api.get(`/inventory?${params.toString()}`);
          const inventoryData = res.data?.inventory || (Array.isArray(res.data) ? res.data : []);
          return {
            items: inventoryData,
            total: res.data?.total ?? inventoryData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Product', 'SKU', 'Category', 'Available', 'Reserved', 'Total', 'Reorder Lvl', 'Status'];
      const rows = exportList.map((item) => {
        const avail = item.availableQty ?? 0;
        const reserved = item.reservedQty ?? 0;
        const total = avail + reserved;
        const reorder = item.reorderLevel ?? 50;
        const status = getStockStatusBadge(avail, reorder).label;
        return [
          item.product?.name || item.name || '—',
          item.product?.sku || item.sku || '—',
          item.product?.category || '—',
          avail,
          reserved,
          total,
          reorder,
          status,
        ];
      });

      handleExport(exportFormat, 'Inventory_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} inventory records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export inventory.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const handleOpenView = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditAvailQty(item.availableQty !== undefined ? String(item.availableQty) : '0');
    setEditReservedQty(item.reservedQty !== undefined ? String(item.reservedQty) : '0');
    setEditReorderLvl(item.reorderLevel !== undefined ? String(item.reorderLevel) : '50');
    setEditBinLocation(item.binLocation || '');
    setEditWarehouseLocation(item.warehouseLocation || '');
    setEditError('');
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError('');
    const errs = {};

    if (editAvailQty === '' || Number(editAvailQty) < 0) {
      errs.availableQty = 'Available quantity cannot be negative';
    }
    if (editReorderLvl === '' || Number(editReorderLvl) < 0) {
      errs.reorderLevel = 'Reorder level cannot be negative';
    }

    if (Object.keys(errs).length > 0) {
      setEditFieldErrors(errs);
      setEditError(Object.values(errs)[0]);
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        availableQty: Number(editAvailQty) || 0,
        reservedQty: Number(editReservedQty) || 0,
        reorderLevel: Number(editReorderLvl) || 0,
        binLocation: editBinLocation.trim(),
        warehouseLocation: editWarehouseLocation.trim(),
      };
      await api.put(`/inventory/${editingItem._id}`, payload);
      showToast(setToast, 'success', `Inventory for "${editingItem.product?.name || 'Product'}" updated successfully.`);
      setShowEditModal(false);
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update inventory.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/inventory/${deletingItem._id}`);
      showToast(setToast, 'success', `Inventory record deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchInventory();
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to delete inventory record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Table Columns Definition (Original 8 columns + Actions)
  const columns = [
    {
      header: 'PRODUCT',
      key: 'name',
      className: 'font-semibold text-[#0F1729]',
      render: (item) => item.product?.name || item.name || '—',
    },
    {
      header: 'SKU',
      key: 'sku',
      className: 'font-mono text-[#878787] text-[11px] whitespace-nowrap',
      render: (item) => item.product?.sku || item.sku || '—',
    },
    {
      header: 'CATEGORY',
      key: 'category',
      className: 'text-[#65758B] font-medium whitespace-nowrap',
      render: (item) => item.product?.category || '—',
    },
    {
      header: 'AVAILABLE',
      key: 'availableQty',
      className: 'font-bold text-[#0F1729] whitespace-nowrap',
      render: (item) => item.availableQty ?? 0,
    },
    {
      header: 'RESERVED',
      key: 'reservedQty',
      className: 'text-[#65758B] whitespace-nowrap',
      render: (item) => item.reservedQty ?? 0,
    },
    {
      header: 'TOTAL',
      key: 'total',
      className: 'text-[#65758B] whitespace-nowrap',
      render: (item) => (item.availableQty || 0) + (item.reservedQty || 0),
    },
    {
      header: 'REORDER LVL',
      key: 'reorderLevel',
      className: 'text-[#65758B] whitespace-nowrap',
      render: (item) => item.reorderLevel ?? 50,
    },
    {
      header: 'STATUS',
      key: 'status',
      align: 'center',
      className: 'whitespace-nowrap min-w-[120px]',
      headerClassName: 'text-center whitespace-nowrap',
      render: (item) => {
        const badge = getStockStatusBadge(item.availableQty, item.reorderLevel);
        return (
          <span className={`inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      align: 'center',
      headerClassName: 'text-center whitespace-nowrap',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenView(item)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
            title="View Stock Details"
          >
            <ViewIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#D97706] hover:bg-amber-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Edit Stock"
          >
            <EditIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(item)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Delete Stock Record"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col space-y-4 overflow-hidden font-['Inter'] w-full min-w-0 max-w-full">
      {/* Row 1: KPI Stat Cards (4 Equal Cards) */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Products */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Total Products</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.totalProducts}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
        </div>

        {/* Card 2: Low Stock Items */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Low Stock Items</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.lowStock}</div>
            <span className={`text-[11px] font-medium mt-1 block ${kpiStats.lowStock > 0 ? 'text-[#D90B37]' : 'text-emerald-600'}`}>
              {kpiStats.lowStock > 0 ? 'Needs attention' : 'Optimal'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Out of Stock</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.outOfStock}</div>
            <span className={`text-[11px] font-medium mt-1 block ${kpiStats.outOfStock > 0 ? 'text-[#D90B37]' : 'text-emerald-600'}`}>
              {kpiStats.outOfStock > 0 ? `${kpiStats.outOfStock} items unavailable` : 'All items in stock'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
        </div>

        {/* Card 4: Stock Movements */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.03)] flex items-start justify-between">
          <div>
            <span className="text-[13px] font-medium text-[#65758B]">Stock Movements</span>
            <div className="text-[28px] font-bold text-[#0F1729] leading-tight mt-2">{kpiStats.totalMovements}</div>
            <span className="text-[11px] font-medium text-[#65758B] mt-1 block">Live movement logs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] text-[#D90B37] flex items-center justify-center flex-shrink-0">
            <ArrowUpDown size={20} />
          </div>
        </div>
      </div>

      {/* Row 2: Stock Levels Table Container */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        
        {/* Header Action Toolbar (Exact uniform height h-9 & rounded-[10px] across all buttons) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          
          {/* Left Title with Count Pill */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">Stock Levels</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalItems}
            </span>
          </div>

          {/* Right Action Group */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search inventory..."
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

            {/* Import Stock Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="h-9 px-4 bg-white border border-[#E3E3E3] hover:bg-[#F6F7FA] text-[#0F1729] text-sm font-semibold rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>Import Stock</span>
            </button>

            {/* + Adjust Stock Primary Crimson Button */}
            <button
              onClick={() => {
                if (inventoryList.length > 0 && inventoryList[0].product?._id) {
                  setAdjustProductId(inventoryList[0].product._id);
                } else if (allProductsList.length > 0) {
                  setAdjustProductId(allProductsList[0]._id);
                }
                setShowAdjustModal(true);
              }}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none ml-auto sm:ml-0"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Adjust Stock</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={inventoryList}
          loading={loading}
          emptyMessage="No matching inventory items found."
          itemLabel="items"
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
        statusOptions={['All statuses', 'In Stock', 'Low Stock', 'Out of Stock']}
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
      {/* FLOW 1: ADJUST STOCK POPUP MODAL */}
      {/* ========================================== */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Adjust Stock</h3>
              </div>
              <button
                type="button"
                onClick={closeAdjustModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 mt-1">
              <FormErrorBanner error={adjustError} onClose={() => setAdjustError('')} />

              <SelectField
                label="Product SKU"
                required
                value={adjustProductId}
                error={adjustFieldErrors.product}
                onChange={(e) => {
                  setAdjustProductId(e.target.value);
                  if (adjustFieldErrors.product) setAdjustFieldErrors(prev => ({ ...prev, product: '' }));
                }}
                placeholder="Select product"
              >
                {allProductsList.length > 0
                  ? allProductsList.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.name} ({prod.sku})
                      </option>
                    ))
                  : inventoryList.map((item) => (
                      <option key={item.product?._id} value={item.product?._id}>
                        {item.product?.name} ({item.product?.sku}) - Avail: {item.availableQty}
                      </option>
                    ))}
              </SelectField>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Adjustment Type"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                >
                  <option value="Add Stock">Add Stock</option>
                  <option value="Deduct Stock">Deduct Stock</option>
                  <option value="Set Stock">Set Stock</option>
                </SelectField>

                <InputField
                  label="Quantity"
                  required
                  type="number"
                  min="1"
                  value={adjustQty}
                  error={adjustFieldErrors.qty}
                  onChange={(e) => {
                    setAdjustQty(e.target.value);
                    if (adjustFieldErrors.qty) setAdjustFieldErrors(prev => ({ ...prev, qty: '' }));
                  }}
                  placeholder="0"
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={closeAdjustModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isAdjusting}>
                  {isAdjusting ? 'Applying...' : 'Apply Adjustment'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FLOW 2: IMPORT STOCK UPDATE POPUP MODAL */}
      {/* ========================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#EDEDED] shadow-2xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Import Stock Update</h3>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#65758B] text-left w-full">Upload a CSV or Excel file with SKU and quantity columns to bulk update stock levels.</p>
            <FormErrorBanner error={importError} onClose={() => setImportError('')} />
            {importSuccess && (
              <div className="w-full bg-[#E2FBE9] border border-[#C3F4D3] text-[#10B77F] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{importSuccess}</span>
              </div>
            )}
            <form onSubmit={handleImportSubmit} className="w-full space-y-4">
              <input type="file" ref={fileInputRef} accept=".csv, .xlsx, .xls" className="hidden" onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setImportError('');
              }} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-[#F6F7FA] hover:bg-[#E5E7EB] border border-dashed border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#0F1729] transition-colors cursor-pointer flex flex-col items-center gap-1.5"
              >
                <Upload size={18} className="text-[#878787]" />
                <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
              </button>
              <ModalFooter className="justify-center">
                <SecondaryButton onClick={closeImportModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Upload & Update
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[540px] rounded-2xl shadow-2xl relative p-8 border border-[#E1E7EF]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#D90B37]">
                <Package size={24} />
                <h3 className="text-[20px] font-bold text-[#0F1729]">Edit Inventory</h3>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
                <span className="text-xl">✕</span>
              </button>
            </div>

            <FormErrorBanner error={editError} onClose={() => setEditError('')} />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-[#0F1729] mb-4">
              Product: {editingItem?.product?.name || '—'} ({editingItem?.product?.sku || 'SKU'})
            </div>

            {/* Body */}
            <form onSubmit={handleUpdateInventory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Available Quantity"
                  type="number"
                  required
                  value={editAvailQty}
                  onChange={(e) => {
                    setEditAvailQty(e.target.value);
                    if (editFieldErrors.availableQty) setEditFieldErrors((p) => ({ ...p, availableQty: '' }));
                  }}
                  error={editFieldErrors.availableQty}
                  placeholder="0"
                />
                <InputField
                  label="Reserved Quantity"
                  type="number"
                  value={editReservedQty}
                  onChange={(e) => setEditReservedQty(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Reorder Level"
                  type="number"
                  required
                  value={editReorderLvl}
                  onChange={(e) => {
                    setEditReorderLvl(e.target.value);
                    if (editFieldErrors.reorderLevel) setEditFieldErrors((p) => ({ ...p, reorderLevel: '' }));
                  }}
                  error={editFieldErrors.reorderLevel}
                  placeholder="50"
                />
                <InputField
                  label="Bin Location"
                  value={editBinLocation}
                  onChange={(e) => setEditBinLocation(e.target.value)}
                  placeholder="e.g. Bin A-12"
                />
                <InputField
                  label="Warehouse"
                  value={editWarehouseLocation}
                  onChange={(e) => setEditWarehouseLocation(e.target.value)}
                  placeholder="e.g. Main WH"
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={() => { setShowEditModal(false); setEditingItem(null); }}>
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

      {/* View Stock Details Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[520px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#D90B37] font-bold overflow-hidden border border-slate-200">
                  {viewingItem.product?.images?.[0] || viewingItem.product?.image ? (
                    <img src={viewingItem.product?.images?.[0] || viewingItem.product?.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={22} />
                  )}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">{viewingItem.product?.name || 'Stock Details'}</h3>
                  <p className="text-xs text-[#878787] font-mono">SKU: {viewingItem.product?.sku || '—'} • {viewingItem.product?.category || 'General'}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingItem(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available</div>
                  <div className="text-lg font-bold text-[#0F1729] mt-0.5">{viewingItem.availableQty ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reserved</div>
                  <div className="text-lg font-bold text-[#D97706] mt-0.5">{viewingItem.reservedQty ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Stock</div>
                  <div className="text-lg font-bold text-[#D90B37] mt-0.5">{(viewingItem.availableQty || 0) + (viewingItem.reservedQty || 0)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Reorder Threshold</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingItem.reorderLevel ?? 50} units</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Status</div>
                  <div className="mt-0.5">
                    {(() => {
                      const badge = getStockStatusBadge(viewingItem.availableQty, viewingItem.reorderLevel);
                      return (
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Bin Location</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingItem.binLocation || 'Not Assigned'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Warehouse</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingItem.warehouseLocation || 'Main Warehouse'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingItem(null); }}>
                Close
              </SecondaryButton>
              <button
                type="button"
                onClick={() => {
                  const itm = viewingItem;
                  setShowViewModal(false);
                  handleOpenEdit(itm);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inventory Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingItem(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Stock Record"
        message="Are you sure you want to delete this inventory record? Product data will remain intact."
        itemName={deletingItem ? `${deletingItem.product?.name || 'Product'} (SKU: ${deletingItem.product?.sku || '—'})` : ''}
        loading={deleteLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Inventory;
