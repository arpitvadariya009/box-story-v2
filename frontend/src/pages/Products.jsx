import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, X, AlertCircle, ImageIcon, Upload, Link, Camera, Check } from 'lucide-react';
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
  validateHsn
} from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const ProductImageThumbnail = ({ product, onImageClick }) => {
  const [imgError, setImgError] = useState(false);
  const imgUrl = product.images?.[0] || product.image || product.imageUrl || '';
  const canPreview = Boolean(imgUrl && !imgError);

  return (
    <div
      onClick={() => {
        if (canPreview && onImageClick) {
          onImageClick({
            url: imgUrl,
            name: product.name,
            sku: product.sku,
            category: product.category,
            brand: product.brand,
          });
        }
      }}
      className={`w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-[#E3E3E3] flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
        canPreview 
          ? 'cursor-zoom-in hover:border-[#D90B37] hover:scale-110 hover:shadow-md active:scale-95' 
          : ''
      }`}
      title={canPreview ? 'Click to preview photo' : ''}
    >
      {canPreview ? (
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <Package size={18} className="text-slate-400" />
      )}
    </div>
  );
};

const Products = () => {
  const { api, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState(null);
  
  // Image Lightbox Preview State
  const [previewImage, setPreviewImage] = useState(null);
  const [isClosingPreview, setIsClosingPreview] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closePreview = () => {
    setIsClosingPreview(true);
    setTimeout(() => {
      setPreviewImage(null);
      setIsClosingPreview(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closePreview();
    };
    if (previewImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [productFieldErrors, setProductFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields - Basic
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [mrp, setMrp] = useState('');
  const [moq, setMoq] = useState('');
  const [supplier, setSupplier] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [initialQty, setInitialQty] = useState('0');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [description, setDescription] = useState('');

  // Form fields - Specifications & Extra
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('7');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [binLocation, setBinLocation] = useState('');

  // Image upload state
  const [imageMode, setImageMode] = useState('file'); // 'file' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // View Product Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Edit Product Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editMinOrderQty, setEditMinOrderQty] = useState('1');
  const [editMaxOrderQty, setEditMaxOrderQty] = useState('10000');
  const [editAvailableQty, setEditAvailableQty] = useState('0');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete Product Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
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
    fetchProducts();
  }, [currentPage, rowsPerPage, debouncedSearch, categoryFilter, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
        params.status = appliedFilterStatus;
      }
      if (appliedDateFrom) params.from = appliedDateFrom;
      if (appliedDateTo) params.to = appliedDateTo;

      const res = await api.get('/products', { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
        setTotalProducts(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        const total = res.data.length;
        setTotalProducts(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setProducts(res.data.slice(start, start + rowsPerPage));
      }
    } catch (error) {
      console.error('Error fetching products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let maxDim = 500;
          let canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.7;
          let result = canvas.toDataURL('image/jpeg', quality);
          while (result.length > 60000 && quality > 0.25) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }
          if (result.length > 60000) {
            canvas.width = Math.round(width * 0.7);
            canvas.height = Math.round(height * 0.7);
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            result = canvas.toDataURL('image/jpeg', 0.6);
          }
          resolve(result);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName(''); setSku(''); setDescription(''); setCategory('');
    setMrp(''); setMoq(''); setSupplier(''); setDeliveryTime('');
    setMaxQty(''); setInitialQty('0');
    setBrand(''); setMaterial(''); setColor(''); setLeadTimeDays('7');
    setHsnCode(''); setGstRate('18'); setBinLocation('');
    setImageUrl(''); setImageFile(null); setImagePreview(''); setImageMode('file');
    setError(''); setProductFieldErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Product name is required';
    }
    if (!sku.trim()) {
      errs.sku = 'SKU is required';
    }
    if (!category.trim()) {
      errs.category = 'Category is required';
    }
    if (!mrp || String(mrp).trim() === '') {
      errs.mrp = 'MRP is required';
    } else if (Number(mrp) < 0) {
      errs.mrp = 'Price cannot be negative';
    }
    if (!moq || String(moq).trim() === '') {
      errs.moq = 'MOQ is required';
    } else if (Number(moq) < 1) {
      errs.moq = 'Minimum order quantity must be at least 1';
    }
    if (!supplier.trim()) {
      errs.supplier = 'Supplier is required';
    }
    if (initialQty === '' || initialQty === null || initialQty === undefined || String(initialQty).trim() === '') {
      errs.initialQty = 'Available stock is required';
    } else if (Number(initialQty) < 0) {
      errs.initialQty = 'Available stock cannot be negative';
    }
    if (!maxQty || String(maxQty).trim() === '') {
      errs.maxQty = 'Max order limit is required';
    } else if (Number(maxQty) < 1) {
      errs.maxQty = 'Max order limit must be at least 1';
    }
    if (!deliveryTime.trim()) {
      errs.deliveryTime = 'Delivery time is required';
    }
    if (!binLocation.trim()) {
      errs.binLocation = 'Bin / Shelf location is required';
    }
    if (imageMode === 'file' && !imageFile && !imagePreview) {
      errs.image = 'Product photo is required';
    } else if (imageMode === 'url' && !imageUrl.trim()) {
      errs.image = 'Product image URL is required';
    }
    if (!brand.trim()) {
      errs.brand = 'Brand is required';
    }
    if (!material.trim()) {
      errs.material = 'Material is required';
    }
    if (!color.trim()) {
      errs.color = 'Color is required';
    }
    if (!hsnCode.trim()) {
      errs.hsnCode = 'HSN code is required';
    } else {
      const hsnErr = validateHsn(hsnCode);
      if (hsnErr) errs.hsnCode = hsnErr;
    }
    if (gstRate === '' || gstRate === null || gstRate === undefined || String(gstRate).trim() === '') {
      errs.gstRate = 'GST rate is required';
    }

    if (Object.keys(errs).length > 0) {
      setProductFieldErrors(errs);
      setError(Object.values(errs)[0]);
      return;
    }

    setIsSubmitting(true);

    try {
      let images = [];

      if (imageMode === 'file' && imageFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          const uploadRes = await api.post('/products/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.url) {
            images = [uploadRes.data.url];
          }
        } catch (uploadErr) {
          console.warn('Backend upload endpoint unavailable, storing optimized image directly:', uploadErr.message);
          const base64Data = await fileToBase64(imageFile);
          if (base64Data) {
            images = [base64Data];
          }
        } finally {
          setUploading(false);
        }
      } else if (imageMode === 'url' && imageUrl.trim()) {
        images = [imageUrl.trim()];
      }

      let parsedLeadTime = 7;
      if (deliveryTime) {
        const match = deliveryTime.match(/\d+/);
        if (match) parsedLeadTime = parseInt(match[0], 10);
      }

      await api.post('/products', {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        category: category.trim() || 'General',
        basePrice: mrp ? (Number(mrp) || 0) : 0,
        minOrderQty: moq ? (Number(moq) || 1) : 1,
        maxOrderQty: maxQty ? (Number(maxQty) || 10000) : 10000,
        initialQty: initialQty ? (Number(initialQty) || 0) : 0,
        leadTimeDays: parsedLeadTime,
        brand: brand.trim() || supplier.trim(),
        material: material.trim(),
        color: color.trim(),
        hsnCode: hsnCode.trim(),
        gstRate: Number(gstRate) || 18,
        binLocation: binLocation.trim(),
        images,
        dimensions: { length: 0, width: 0, height: 0, weight: 0 }
      });

      setShowAddModal(false);
      fetchProducts();
      showToast(setToast, 'success', `Product "${name}" added successfully!`);
      resetForm();
    } catch (err) {
      setUploading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to create product';
      setError(msg);
      // Inline error banner inside modal; do not show top toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product and its inventory records?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      showToast(setToast, 'success', 'Product deleted.');
    } catch (err) {
      showToast(setToast, 'error', 'Failed to delete product.');
    }
  };

  // Helper for status capsule class names & text
  const getProductStockStatus = (stockCount) => {
    if (stockCount === 0) {
      return {
        label: 'Out of Stock',
        badgeClass: 'bg-[#FCE8ED] text-[#E21D48] border-[#E21D48]/30'
      };
    }
    if (stockCount <= 15) {
      return {
        label: 'Low Stock',
        badgeClass: 'bg-[#FFF3E0] text-[#FF9900] border-[#FF9900]/30'
      };
    }
    return {
      label: 'In Stock',
      badgeClass: 'bg-[#E2FBE9] text-[#10B77F] border-[#10B77F]/30'
    };
  };

  // Format Base Price to ₹ Indian style
  const formatINR = (value) => {
    const num = Number(value) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);

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
          if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
          if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
            params.status = appliedFilterStatus;
          }
          if (appliedDateFrom) params.from = appliedDateFrom;
          if (appliedDateTo) params.to = appliedDateTo;

          const res = await api.get('/products', { params });
          const productsData = res.data?.products || (Array.isArray(res.data) ? res.data : []);
          return {
            items: productsData,
            total: res.data?.total ?? productsData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Product', 'SKU', 'Category', 'MRP', 'Order Limits (Min/Max)', 'Available Stock', 'Status'];
      const rows = exportList.map((p) => [
        p.name || '—',
        p.sku || '—',
        p.category || '—',
        formatINR(p.basePrice),
        `Min: ${p.minOrderQty || 1}, Max: ${(p.maxOrderQty || 10000).toLocaleString('en-IN')}`,
        `${(p.availableQty ?? 0).toLocaleString('en-IN')} units`,
        getProductStockStatus(p.availableQty ?? 0).label,
      ]);

      handleExport(exportFormat, 'Product_Catalogue_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} product records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export products.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const handleOpenView = (prod) => {
    setViewingProduct(prod);
    setShowViewModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name || '');
    setEditSku(prod.sku || '');
    setEditCategory(prod.category || '');
    setEditBrand(prod.brand || '');
    setEditBasePrice(prod.basePrice !== undefined ? String(prod.basePrice) : '');
    setEditMinOrderQty(prod.minOrderQty !== undefined ? String(prod.minOrderQty) : '1');
    setEditMaxOrderQty(prod.maxOrderQty !== undefined ? String(prod.maxOrderQty) : '10000');
    setEditAvailableQty(prod.availableQty !== undefined ? String(prod.availableQty) : '0');
    setEditDescription(prod.description || '');
    setEditImageUrl(prod.images?.[0] || prod.image || prod.imageUrl || '');
    setEditError('');
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError('');
    const errs = {};

    if (!editName.trim()) {
      errs.name = 'Product name is required';
    }
    if (!editSku.trim()) {
      errs.sku = 'SKU is required';
    }
    if (!editCategory) {
      errs.category = 'Category is required';
    }
    if (editBasePrice !== '' && Number(editBasePrice) < 0) {
      errs.basePrice = 'Price cannot be negative';
    }

    if (Object.keys(errs).length > 0) {
      setEditFieldErrors(errs);
      setEditError(Object.values(errs)[0]);
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        name: editName.trim(),
        sku: editSku.trim(),
        category: editCategory,
        brand: editBrand.trim(),
        basePrice: Number(editBasePrice) || 0,
        minOrderQty: Number(editMinOrderQty) || 1,
        maxOrderQty: Number(editMaxOrderQty) || 10000,
        availableQty: Number(editAvailableQty) || 0,
        description: editDescription.trim(),
        images: editImageUrl ? [editImageUrl] : [],
      };
      await api.put(`/products/${editingProduct._id}`, payload);
      showToast(setToast, 'success', `Product "${editName}" updated successfully.`);
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (prod) => {
    setDeletingProduct(prod);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      showToast(setToast, 'success', `Product "${deletingProduct.name}" deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      key: 'name',
      render: (prod) => {
        const imgUrl = prod.images?.[0] || prod.image || prod.imageUrl || '';
        return (
          <div className="flex items-center gap-3">
            <ProductImageThumbnail
              product={prod}
              onImageClick={(data) => setPreviewImage(data)}
            />
            <div>
              <div 
                className="font-semibold text-[#0F1729] text-sm hover:text-[#D90B37] cursor-pointer transition-colors"
                onClick={() => handleOpenView(prod)}
              >
                {prod.name || '—'}
              </div>
              <div className="text-xs text-[#878787] flex items-center gap-1.5 mt-0.5">
                <span>{prod.sku || 'No SKU'}</span>
                {prod.brand && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-slate-600">{prod.brand}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Category',
      key: 'category',
      className: 'whitespace-nowrap',
      render: (prod) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0F0F0] text-[#545454]">
          {prod.category || 'General'}
        </span>
      ),
    },
    {
      header: 'MRP (Base Price)',
      key: 'basePrice',
      className: 'whitespace-nowrap',
      render: (prod) => (
        <span className="text-sm font-semibold text-[#0F1729]">
          {formatINR(prod.basePrice)}
        </span>
      ),
    },
    {
      header: 'Order Limits',
      key: 'orderLimits',
      className: 'whitespace-nowrap',
      render: (prod) => (
        <div className="text-xs text-[#545454]">
          <div>Min: <span className="font-semibold text-[#0F1729]">{prod.minOrderQty || 1}</span></div>
          <div>Max: <span className="font-semibold text-[#0F1729]">{(prod.maxOrderQty || 10000).toLocaleString('en-IN')}</span></div>
        </div>
      ),
    },
    {
      header: 'Available Stock',
      key: 'availableQty',
      className: 'whitespace-nowrap',
      render: (prod) => (
        <div className="font-mono whitespace-nowrap">
          <span className="text-sm font-semibold text-[#0F1729]">
            {(prod.availableQty ?? 0).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 ml-1">units</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      className: 'whitespace-nowrap min-w-[130px]',
      headerClassName: 'text-center whitespace-nowrap',
      render: (prod) => {
        const statusInfo = getProductStockStatus(prod.availableQty ?? 0);
        return (
          <span className={`inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1 rounded-full text-[12px] font-semibold border ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'center',
      headerClassName: 'text-center whitespace-nowrap',
      render: (prod) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenView(prod)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
            title="View Product Details"
          >
            <ViewIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(prod)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#D97706] hover:bg-amber-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Edit Product"
          >
            <EditIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(prod)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Delete Product"
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
        
        {/* Header toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Products</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalProducts}
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search products..."
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

            {/* Add Product Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm ml-auto sm:ml-0 border-none whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found"
          emptySubMessage="Try adjusting your search or filters"
          emptyIcon={Package}
          itemLabel="products"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalProducts}
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
        statusOptions={['All statuses', 'Available', 'Active', 'Discontinued', 'Draft']}
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
        recordCount={totalProducts}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />

      {/* Add Product Modal - Exact Figma Design */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl relative p-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Add New Product</h3>
              </div>
              <button 
                type="button" 
                onClick={closeAddModal} 
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <FormErrorBanner error={error} onClose={() => setError('')} />

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="space-y-5">
              
              {/* Row 1: Product Name + SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Product Name"
                  required
                  value={name}
                  error={productFieldErrors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (productFieldErrors.name) setProductFieldErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Product name"
                />
                <InputField
                  label="SKU"
                  required
                  value={sku}
                  error={productFieldErrors.sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    if (productFieldErrors.sku) setProductFieldErrors(prev => ({ ...prev, sku: '' }));
                  }}
                  placeholder="SKU-001"
                  className="uppercase"
                />
              </div>

              {/* Row 2: Category + MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Category"
                  required
                  value={category}
                  error={productFieldErrors.category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (productFieldErrors.category) setProductFieldErrors(prev => ({ ...prev, category: '' }));
                  }}
                  placeholder="e.g. Drinkware, Electronics"
                />
                <InputField
                  label="MRP (₹)"
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={mrp}
                  error={productFieldErrors.mrp}
                  onChange={(e) => {
                    setMrp(e.target.value);
                    if (productFieldErrors.mrp) setProductFieldErrors(prev => ({ ...prev, mrp: '' }));
                  }}
                  placeholder="₹0"
                />
              </div>

              {/* Row 3: MOQ + Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="MOQ"
                  type="number"
                  required
                  min="1"
                  value={moq}
                  error={productFieldErrors.moq}
                  onChange={(e) => {
                    setMoq(e.target.value);
                    if (productFieldErrors.moq) setProductFieldErrors(prev => ({ ...prev, moq: '' }));
                  }}
                  placeholder="10"
                />
                <InputField
                  label="Supplier"
                  required
                  value={supplier}
                  error={productFieldErrors.supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                    if (productFieldErrors.supplier) setProductFieldErrors(prev => ({ ...prev, supplier: '' }));
                  }}
                  placeholder="Supplier name"
                />
              </div>

              {/* Row 4: Available Stock + Max Order Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Available Stock"
                  type="number"
                  required
                  min="0"
                  value={initialQty}
                  error={productFieldErrors.initialQty}
                  onChange={(e) => {
                    setInitialQty(e.target.value);
                    if (productFieldErrors.initialQty) setProductFieldErrors(prev => ({ ...prev, initialQty: '' }));
                  }}
                  placeholder="0"
                />
                <InputField
                  label="Max Order Limit"
                  type="number"
                  required
                  min="1"
                  value={maxQty}
                  error={productFieldErrors.maxQty}
                  onChange={(e) => {
                    setMaxQty(e.target.value);
                    if (productFieldErrors.maxQty) setProductFieldErrors(prev => ({ ...prev, maxQty: '' }));
                  }}
                  placeholder="10000"
                />
              </div>

              {/* Row 5: Delivery Time + Bin Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Delivery Time"
                  required
                  value={deliveryTime}
                  error={productFieldErrors.deliveryTime}
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                    if (productFieldErrors.deliveryTime) setProductFieldErrors(prev => ({ ...prev, deliveryTime: '' }));
                  }}
                  placeholder="e.g. 5-7 days"
                />
                <InputField
                  label="Bin / Shelf Location"
                  required
                  value={binLocation}
                  error={productFieldErrors.binLocation}
                  onChange={(e) => {
                    setBinLocation(e.target.value);
                    if (productFieldErrors.binLocation) setProductFieldErrors(prev => ({ ...prev, binLocation: '' }));
                  }}
                  placeholder="e.g. A-12-04"
                />
              </div>

              {/* Row 6: Product Photo (Upload or URL) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-semibold text-[#0F1729]">
                    Product Photo <span className="text-[#D90B37]">*</span>
                  </label>
                  <div className="flex bg-[#F0F2F5] p-0.5 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer border-none ${
                        imageMode === 'file' ? 'bg-white text-[#D90B37] shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer border-none ${
                        imageMode === 'url' ? 'bg-white text-[#D90B37] shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageMode === 'file' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleFileChange(e);
                        if (productFieldErrors.image) setProductFieldErrors(prev => ({ ...prev, image: '' }));
                      }}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="p-3 bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl flex items-center gap-3">
                        <img src={imagePreview} alt="Selected" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0F1729] truncate">{imageFile?.name || 'Selected Image'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{formatFileSize(imageFile?.size)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-white border border-[#E3E3E3] hover:border-[#D90B37] text-xs font-medium rounded-lg text-slate-700 cursor-pointer transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="px-2.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed ${productFieldErrors.image ? 'border-[#D90B37] bg-red-50/10' : 'border-[#E3E3E3] hover:border-[#D90B37] bg-[#F7F7F7]'} hover:bg-red-50/10 rounded-xl p-4 text-center cursor-pointer transition-colors group`}
                      >
                        <div className="flex items-center justify-center gap-2 text-slate-400 group-hover:text-[#D90B37] mb-1 transition-colors">
                          <Camera size={18} />
                          <span className="text-sm font-medium text-slate-600 group-hover:text-[#D90B37]">Click to upload photo (Camera or Gallery)</span>
                        </div>
                        <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <InputField
                        type="url"
                        value={imageUrl}
                        error={productFieldErrors.image}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          if (productFieldErrors.image) setProductFieldErrors(prev => ({ ...prev, image: '' }));
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="h-11 px-4 border border-[#E3E3E3] rounded-xl text-slate-500 hover:text-red-600 bg-white cursor-pointer text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
                {productFieldErrors.image && (
                  <p className="text-[12px] text-[#D90B37] mt-1.5 font-medium">{productFieldErrors.image}</p>
                )}
              </div>

              {/* Row 7: Brand + Material + Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Brand"
                  required
                  value={brand}
                  error={productFieldErrors.brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    if (productFieldErrors.brand) setProductFieldErrors(prev => ({ ...prev, brand: '' }));
                  }}
                  placeholder="Brand name"
                />
                <InputField
                  label="Material"
                  required
                  value={material}
                  error={productFieldErrors.material}
                  onChange={(e) => {
                    setMaterial(e.target.value);
                    if (productFieldErrors.material) setProductFieldErrors(prev => ({ ...prev, material: '' }));
                  }}
                  placeholder="e.g. Ceramic, Cotton"
                />
                <InputField
                  label="Color"
                  required
                  value={color}
                  error={productFieldErrors.color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (productFieldErrors.color) setProductFieldErrors(prev => ({ ...prev, color: '' }));
                  }}
                  placeholder="e.g. Matte Black"
                />
              </div>

              {/* Row 8: HSN Code + GST Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="HSN Code"
                  required
                  isHsn={true}
                  value={hsnCode}
                  error={productFieldErrors.hsnCode}
                  onChange={(e) => {
                    setHsnCode(e.target.value);
                    if (productFieldErrors.hsnCode) setProductFieldErrors(prev => ({ ...prev, hsnCode: '' }));
                  }}
                  placeholder="4 to 8 digit HSN code"
                />
                <SelectField
                  label="GST Rate (%)"
                  required
                  value={gstRate}
                  error={productFieldErrors.gstRate}
                  onChange={(e) => {
                    setGstRate(e.target.value);
                    if (productFieldErrors.gstRate) setProductFieldErrors(prev => ({ ...prev, gstRate: '' }));
                  }}
                >
                  <option value="0">0% (Nil)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18% (Standard)</option>
                  <option value="28">28%</option>
                </SelectField>
              </div>

              {/* Row 9: Description (Optional) */}
              <TextareaField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product Description (Optional)"
                rows={3}
              />

              {/* Actions */}
              <ModalFooter>
                <SecondaryButton onClick={closeAddModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton 
                  type="submit" 
                  disabled={isSubmitting || uploading}
                  loading={isSubmitting || uploading}
                >
                  {uploading ? 'Uploading Photo...' : isSubmitting ? 'Saving Product...' : 'Add Product'}
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* Smooth Pure Image Lightbox (Image Only) */}
      {previewImage && (
        <div
          onClick={closePreview}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md transition-opacity duration-200 ease-out cursor-pointer ${
            isClosingPreview ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Minimal floating close icon in corner */}
          <button
            type="button"
            onClick={closePreview}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-sm z-10 hover:scale-105"
            title="Close"
          >
            <X size={20} />
          </button>

          {/* Pure Image */}
          <img
            src={previewImage.url}
            alt={previewImage.name}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-200 ease-out transform select-none ${
              isClosingPreview ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative p-8 border border-[#E1E7EF]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#D90B37]">
                <Package size={24} />
                <h3 className="text-[20px] font-bold text-[#0F1729]">Edit Product</h3>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
                <span className="text-xl">✕</span>
              </button>
            </div>

            <FormErrorBanner error={editError} onClose={() => setEditError('')} />

            {/* Body */}
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Product Name"
                  required
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (editFieldErrors.name) setEditFieldErrors((p) => ({ ...p, name: '' }));
                  }}
                  error={editFieldErrors.name}
                  placeholder="e.g. Premium Parker Pen"
                />
                <InputField
                  label="SKU Code"
                  required
                  value={editSku}
                  onChange={(e) => {
                    setEditSku(e.target.value);
                    if (editFieldErrors.sku) setEditFieldErrors((p) => ({ ...p, sku: '' }));
                  }}
                  error={editFieldErrors.sku}
                  placeholder="e.g. PEN-PARK-001"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  required
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value);
                    if (editFieldErrors.category) setEditFieldErrors((p) => ({ ...p, category: '' }));
                  }}
                  error={editFieldErrors.category}
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Drinkware">Drinkware</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Gift Hampers">Gift Hampers</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Eco Friendly">Eco Friendly</option>
                </SelectField>

                <InputField
                  label="Brand"
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  placeholder="Brand name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="MRP (Base Price ₹)"
                  type="number"
                  required
                  value={editBasePrice}
                  onChange={(e) => {
                    setEditBasePrice(e.target.value);
                    if (editFieldErrors.basePrice) setEditFieldErrors((p) => ({ ...p, basePrice: '' }));
                  }}
                  error={editFieldErrors.basePrice}
                  placeholder="₹ 0.00"
                />
                <InputField
                  label="Min Order Qty (MOQ)"
                  type="number"
                  value={editMinOrderQty}
                  onChange={(e) => setEditMinOrderQty(e.target.value)}
                  placeholder="1"
                />
                <InputField
                  label="Max Order Qty"
                  type="number"
                  value={editMaxOrderQty}
                  onChange={(e) => setEditMaxOrderQty(e.target.value)}
                  placeholder="10000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Available Stock (Units)"
                  type="number"
                  value={editAvailableQty}
                  onChange={(e) => setEditAvailableQty(e.target.value)}
                  placeholder="0"
                />
                <InputField
                  label="Image URL"
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <TextareaField
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Product Description"
                rows={3}
              />

              <ModalFooter>
                <SecondaryButton onClick={() => { setShowEditModal(false); setEditingProduct(null); }}>
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

      {/* View Product Details Modal */}
      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[550px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3">
                {viewingProduct.images?.[0] || viewingProduct.image || viewingProduct.imageUrl ? (
                  <img
                    src={viewingProduct.images?.[0] || viewingProduct.image || viewingProduct.imageUrl}
                    alt={viewingProduct.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Package size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">{viewingProduct.name || 'Product Details'}</h3>
                  <p className="text-xs text-[#878787] font-mono">{viewingProduct.sku || 'No SKU'} • {viewingProduct.category || 'General'}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingProduct(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MRP / Base Price</div>
                  <div className="text-base font-bold text-[#D90B37] mt-0.5">{formatINR(viewingProduct.basePrice)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available Stock</div>
                  <div className="text-base font-bold text-[#0F1729] mt-0.5">{(viewingProduct.availableQty ?? 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MOQ</div>
                  <div className="text-base font-bold text-[#0F1729] mt-0.5">{viewingProduct.minOrderQty || 1}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Brand</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingProduct.brand || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Max Order Qty</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{(viewingProduct.maxOrderQty || 10000).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">Description</div>
                  <div className="text-[13px] text-[#545454] mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {viewingProduct.description}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingProduct(null); }}>
                Close
              </SecondaryButton>
              <button
                type="button"
                onClick={() => {
                  const p = viewingProduct;
                  setShowViewModal(false);
                  handleOpenEdit(p);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingProduct(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be removed from all catalogues and inventory views."
        itemName={deletingProduct ? `${deletingProduct.name} (${deletingProduct.sku || 'SKU'})` : ''}
        loading={deleteLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Products;
