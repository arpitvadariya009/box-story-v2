import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  ImageIcon,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

/* ─── Shared Form Components ───────────────────────────────────────────── */
function FormLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-[#D90B37] ml-0.5">*</span>}
    </label>
  );
}

function FormInput({ id, ...props }) {
  return (
    <input
      id={id}
      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white"
      {...props}
    />
  );
}

function FormSelect({ id, children, value, onChange, ...props }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full h-10 px-3.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-all focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white appearance-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

function FormTextarea({ id, rows = 4, ...props }) {
  return (
    <textarea
      id={id}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white resize-none"
      {...props}
    />
  );
}

const CATEGORIES = [
  'Welcome Kits',
  'Office Kits',
  'Electronics',
  'Stationery',
  'Apparel',
  'Food & Beverages',
  'Personal Care',
  'Gift Boxes',
  'Awards & Trophies',
  'Tech Accessories',
  'Other',
];

/* ─── Image Upload Zone ─────────────────────────────────────────────────── */
function ImageUploadZone({ images, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => onAdd(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 transition-all ${
        dragging ? 'border-[#D90B37] bg-red-50' : 'border-gray-200 bg-gray-50/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt={`Product ${i + 1}`} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#D90B37] hover:text-[#D90B37] transition-colors"
          >
            <Upload size={18} />
            <span className="text-xs mt-1">Add</span>
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Upload size={20} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Drag & drop or click to upload</p>
          <p className="text-xs text-gray-400 mb-3">PNG, JPG, WEBP up to 5MB</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Choose Files
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

/* ─── Success Toast ─────────────────────────────────────────────────────── */
function SuccessToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-3.5 animate-[slideIn_0.3s_ease]">
      <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
      <p className="text-sm font-semibold text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function DataEntryProductEntry() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    vendor: '',
    description: '',
    specifications: '',
    basePrice: '',
    minOrderQty: '1',
    priority: 'Medium',
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.get('/data-entry/vendors').then((r) => setVendors(r.data)).catch(() => {});
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm({ name: '', sku: '', category: '', vendor: '', description: '', specifications: '', basePrice: '', minOrderQty: '1', priority: 'Medium' });
    setImages([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || !form.basePrice) {
      setError('Please fill all required fields (Name, SKU, Category, Price).');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/data-entry/products', { ...form, images });
      setSuccess(`Product "${form.name}" submitted for review!`);
      handleClear();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && <SuccessToast message={success} onClose={() => setSuccess('')} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top error banner */}
          {error && (
            <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-b border-red-100">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel required>Product Name</FormLabel>
                <FormInput id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" />
              </div>
              <div>
                <FormLabel required>SKU</FormLabel>
                <FormInput id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SKU-4521" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel required>Category</FormLabel>
                <FormSelect id="category" name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </FormSelect>
              </div>
              <div>
                <FormLabel>Supplier / Brand</FormLabel>
                <FormSelect id="vendor" name="vendor" value={form.vendor} onChange={handleChange}>
                  <option value="">Lookup supplier</option>
                  {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                </FormSelect>
              </div>
            </div>

            {/* Description */}
            <div>
              <FormLabel>Description</FormLabel>
              <FormTextarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Product description" rows={3} />
            </div>

            {/* Specifications */}
            <div>
              <FormLabel>Specifications</FormLabel>
              <FormTextarea id="specifications" name="specifications" value={form.specifications} onChange={handleChange} placeholder="Technical specifications, dimensions, materials..." rows={3} />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1">
                <FormLabel required>Price (₹)</FormLabel>
                <FormInput id="basePrice" name="basePrice" type="number" step="0.01" min="0" value={form.basePrice} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <FormLabel>Minimum Order Quantity</FormLabel>
                <FormInput id="minOrderQty" name="minOrderQty" type="number" min="1" value={form.minOrderQty} onChange={handleChange} placeholder="1" />
              </div>
              <div>
                <FormLabel>Priority</FormLabel>
                <FormSelect id="priority" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </FormSelect>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <FormLabel>Product Images</FormLabel>
              <ImageUploadZone
                images={images}
                onAdd={(src) => setImages((prev) => [...prev, src])}
                onRemove={(i) => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 size={16} /> Submit for Review</>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
