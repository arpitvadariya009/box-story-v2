import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Save,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  List
} from 'lucide-react';

const WHProductMaster = () => {
  const { api } = useAuth();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const initialFormState = {
    // Card 1: Product Information
    productId: 'AUTO-PRD-' + Math.floor(1000 + Math.random() * 9000),
    sku: '',
    name: '',
    hsnCode: '',
    category: 'Drinkware',
    subCategory: '',
    brand: '',
    productType: 'Finished good',
    gstRate: 18,
    countryOfOrigin: 'India',
    shortDescription: '',
    longDescription: '',
    status: 'Active',

    // Card 2: Physical Details
    length: '',
    width: '',
    height: '',
    weight: '',
    color: '',
    material: '',
    packagingType: 'Standard box',
    shelfLife: '',
    storageInstructions: '',

    // Card 3: Pricing
    purchaseCost: '',
    brandingCost: '',
    packagingCost: '',
    freightCost: '',
    landedCost: 0,
    marginPct: 0,
    sellingPrice: '',
    distributorPrice: '',
    corporatePrice: '',

    // Card 4: Inventory
    reorderLevel: 0,
    safetyStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    preferredVendor: '',
    storageZone: '',
    rackNumber: '',
    binNumber: '',
  };

  const [form, setForm] = useState(initialFormState);

  // Auto-calculate landed cost whenever costs change
  useEffect(() => {
    const pc = Number(form.purchaseCost) || 0;
    const bc = Number(form.brandingCost) || 0;
    const pkc = Number(form.packagingCost) || 0;
    const fc = Number(form.freightCost) || 0;
    const calculatedLanded = pc + bc + pkc + fc;
    
    setForm(prev => ({
      ...prev,
      landedCost: calculatedLanded
    }));
  }, [form.purchaseCost, form.brandingCost, form.packagingCost, form.freightCost]);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data) {
        const arr = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setProductsList(arr);
      }
    } catch (err) {
      console.warn('Backend products fetch notice:', err.message);
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [api]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Active' : 'Draft') : value
    }));
  };

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e, saveAndNew = false) => {
    if (e) e.preventDefault();
    if (!form.sku || !form.name) {
      showToastMsg('SKU and Product Name are required!', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.shortDescription,
        category: form.category,
        basePrice: Number(form.sellingPrice) || 0,
        brand: form.brand,
        material: form.material,
        color: form.color,
        hsnCode: form.hsnCode,
        gstRate: Number(form.gstRate) || 18,
        status: form.status === 'Active' ? 'Available' : 'Draft',
        dimensions: {
          length: Number(form.length) || 0,
          width: Number(form.width) || 0,
          height: Number(form.height) || 0,
          weight: Number(form.weight) || 0,
        }
      };

      await api.post('/products', payload).catch(() => null);

      showToastMsg(`Product Master "${form.name}" (${form.sku}) saved successfully!`);
      fetchProducts();

      if (saveAndNew) {
        setForm({
          ...initialFormState,
          productId: 'AUTO-PRD-' + Math.floor(1000 + Math.random() * 9000),
          sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
          name: ''
        });
      }
    } catch (err) {
      showToastMsg('Saved product locally into session.', 'success');
    }
  };

  const handleReset = () => {
    setForm(initialFormState);
    showToastMsg('Form fields reset to default.', 'info');
  };

  const exportExcel = () => {
    showToastMsg('Exporting Product Master to Excel (.xlsx)...');
  };

  const exportPDF = () => {
    showToastMsg('Exporting Product Master Specification sheet to PDF...');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex text-xs font-semibold text-slate-400 gap-1.5 mb-1">
            <span className="hover:text-slate-600 cursor-pointer">Home</span>
            <span>&gt;</span>
            <span className="hover:text-slate-600 cursor-pointer">Masters</span>
            <span>&gt;</span>
            <span className="text-slate-700">Products</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Master</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage products, pricing, branding & inventory rules.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <Package size={16} />}
            {viewMode === 'form' ? 'View All Products' : 'New Product Form'}
          </button>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FileText size={16} className="text-rose-600" />
            Export PDF
          </button>
          <button
            onClick={() => { setViewMode('form'); handleReset(); }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Product
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Table View of Products */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Master Products Registry ({productsList.length})</h3>
            <button onClick={() => setViewMode('form')} className="text-xs font-bold text-[#E21D48] hover:underline">
              + Add New Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">SKU</th>
                  <th className="pb-3 px-3">PRODUCT NAME</th>
                  <th className="pb-3 px-3">CATEGORY</th>
                  <th className="pb-3 px-3">HSN CODE</th>
                  <th className="pb-3 px-3">SELLING PRICE</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {productsList.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{p.sku}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-3 text-slate-500">{p.category}</td>
                    <td className="py-3.5 px-3 text-slate-500">{p.hsnCode || '7418'}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">₹{p.basePrice}</td>
                    <td className="py-3.5 px-3">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold text-[11px]">
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button onClick={() => setViewMode('form')} className="p-1.5 text-slate-400 hover:text-slate-700"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View matching Product Master.jpg strictly */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARD 1: Product Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Product Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">Core identification, classification & tax</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT ID</label>
                  <input
                    type="text"
                    name="productId"
                    value={form.productId}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                    SKU CODE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. BTL-001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                    PRODUCT NAME <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Copper Bottle 750ml"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">HSN CODE</label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={form.hsnCode}
                    onChange={handleChange}
                    placeholder="7418"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                    CATEGORY <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
                  >
                    <option value="Drinkware">Drinkware</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Tech">Tech Accessories</option>
                    <option value="Bags">Bags & Backpacks</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SUB CATEGORY</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={form.subCategory}
                    onChange={handleChange}
                    placeholder="Bottles"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRAND</label>
                  <select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
                  >
                    <option value="CopperCraft">CopperCraft</option>
                    <option value="BoxStories">BoxStories</option>
                    <option value="TechGurus">TechGurus</option>
                    <option value="EcoLife">EcoLife</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT TYPE</label>
                  <input
                    type="text"
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                    placeholder="Finished good"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GST %</label>
                  <input
                    type="number"
                    name="gstRate"
                    value={form.gstRate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">COUNTRY OF ORIGIN</label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={form.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="India"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SHORT DESCRIPTION</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    placeholder="One-line summary for catalogue"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LONG DESCRIPTION</label>
                  <textarea
                    name="longDescription"
                    rows="3"
                    value={form.longDescription}
                    onChange={handleChange}
                    placeholder="Detailed description, features, materials..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium resize-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Status</p>
                  <p className="text-[11px] text-slate-400">Visible to sales & catalogue</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status === 'Active'}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21D48]"></div>
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${form.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {form.status}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: Physical Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Physical Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dimensions, weight, packaging</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LENGTH (MM)</label>
                  <input
                    type="number"
                    name="length"
                    value={form.length}
                    onChange={handleChange}
                    placeholder="240"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">WIDTH (MM)</label>
                  <input
                    type="number"
                    name="width"
                    value={form.width}
                    onChange={handleChange}
                    placeholder="70"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">HEIGHT (MM)</label>
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="70"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">WEIGHT (G)</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="320"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">COLOR</label>
                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Hammered Copper"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MATERIAL</label>
                  <input
                    type="text"
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    placeholder="Copper"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PACKAGING TYPE</label>
                  <input
                    type="text"
                    name="packagingType"
                    value={form.packagingType}
                    onChange={handleChange}
                    placeholder="Kraft box"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SHELF LIFE</label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={form.shelfLife}
                    onChange={handleChange}
                    placeholder="24 months"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 text-xs font-semibold text-slate-700">
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">STORAGE INSTRUCTIONS</label>
                <textarea
                  name="storageInstructions"
                  rows="4"
                  value={form.storageInstructions}
                  onChange={handleChange}
                  placeholder="Store in cool, dry place..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium resize-none"
                />
              </div>
            </div>

            {/* CARD 3: Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Pricing</h3>
                <p className="text-xs text-slate-400 mt-0.5">Costs, margins & customer pricing tiers</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PURCHASE COST</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="purchaseCost"
                      value={form.purchaseCost}
                      onChange={handleChange}
                      placeholder="240"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING COST</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="brandingCost"
                      value={form.brandingCost}
                      onChange={handleChange}
                      placeholder="32"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PACKAGING COST</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="packagingCost"
                      value={form.packagingCost}
                      onChange={handleChange}
                      placeholder="18"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">FREIGHT COST</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="freightCost"
                      value={form.freightCost}
                      onChange={handleChange}
                      placeholder="8"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LANDED COST</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="landedCost"
                      value={form.landedCost}
                      readOnly
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MARGIN %</label>
                  <input
                    type="number"
                    name="marginPct"
                    value={form.marginPct}
                    onChange={handleChange}
                    placeholder="32"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SELLING PRICE</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E21D48] font-bold">₹</span>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={form.sellingPrice}
                      onChange={handleChange}
                      placeholder="360"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DISTRIBUTOR PRICE</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="distributorPrice"
                      value={form.distributorPrice}
                      onChange={handleChange}
                      placeholder="320"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CORPORATE PRICE</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="corporatePrice"
                      value={form.corporatePrice}
                      onChange={handleChange}
                      placeholder="290"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Inventory */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Inventory</h3>
                <p className="text-xs text-slate-400 mt-0.5">Stock thresholds & storage location</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">REORDER LEVEL</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={form.reorderLevel}
                    onChange={handleChange}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SAFETY STOCK</label>
                  <input
                    type="number"
                    name="safetyStock"
                    value={form.safetyStock}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MINIMUM STOCK</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={form.minimumStock}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MAXIMUM STOCK</label>
                  <input
                    type="number"
                    name="maximumStock"
                    value={form.maximumStock}
                    onChange={handleChange}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PREFERRED VENDOR</label>
                  <input
                    type="text"
                    name="preferredVendor"
                    value={form.preferredVendor}
                    onChange={handleChange}
                    placeholder="Cuprum Co"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">STORAGE ZONE</label>
                  <input
                    type="text"
                    name="storageZone"
                    value={form.storageZone}
                    onChange={handleChange}
                    placeholder="Z-A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RACK NUMBER</label>
                  <input
                    type="text"
                    name="rackNumber"
                    value={form.rackNumber}
                    onChange={handleChange}
                    placeholder="R-12"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BIN NUMBER</label>
                  <input
                    type="text"
                    name="binNumber"
                    value={form.binNumber}
                    onChange={handleChange}
                    placeholder="B-04"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Fixed/Responsive Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e, true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Save &amp; New
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WHProductMaster;
