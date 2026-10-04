import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Loader2, AlertTriangle, ChevronDown, X } from 'lucide-react';

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

function SuccessToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-3.5">
      <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
      <p className="text-sm font-semibold text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2"><X size={16} /></button>
    </div>
  );
}

const INITIAL_FORM = {
  grnNumber: '',
  purchaseOrderId: '',
  productSku: '',
  stockQty: '',
  batchNumber: '',
  serialNumber: '',
  binLocation: '',
  priority: 'Medium',
};

export default function DataEntryInventoryEntry() {
  const { api } = useAuth();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchLookups = useCallback(async () => {
    try {
      const [posRes, binsRes] = await Promise.all([
        api.get('/data-entry/purchase-orders'),
        api.get('/data-entry/bin-locations'),
      ]);
      setPurchaseOrders(posRes.data || []);
      setBinLocations(binsRes.data || []);
    } catch {
      // Silent failure — dropdowns will be empty
    }
  }, [api]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.grnNumber || !form.stockQty) {
      setError('GRN Number and Stock Quantity are required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/data-entry/inventory', form);
      setSuccess(res.data?.message || 'Inventory entry submitted for approval!');
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
                <FormLabel required>GRN Number</FormLabel>
                <FormInput
                  id="grnNumber"
                  name="grnNumber"
                  value={form.grnNumber}
                  onChange={handleChange}
                  placeholder="e.g. GRN-2024-001"
                />
              </div>
              <div>
                <FormLabel>Purchase Order Reference</FormLabel>
                <FormSelect
                  id="purchaseOrderId"
                  name="purchaseOrderId"
                  value={form.purchaseOrderId}
                  onChange={handleChange}
                >
                  <option value="">Select PO</option>
                  {purchaseOrders.map((po) => (
                    <option key={po._id} value={po._id}>
                      {po.poNumber} — {po.vendor?.name || 'Unknown Vendor'}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel>Product SKU</FormLabel>
                <FormInput
                  id="productSku"
                  name="productSku"
                  value={form.productSku}
                  onChange={handleChange}
                  placeholder="e.g. SKU-4521"
                />
              </div>
              <div>
                <FormLabel required>Stock Quantity</FormLabel>
                <FormInput
                  id="stockQty"
                  name="stockQty"
                  type="number"
                  min="0"
                  value={form.stockQty}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel>Batch Number</FormLabel>
                <FormInput
                  id="batchNumber"
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g. BATCH-001"
                />
              </div>
              <div>
                <FormLabel>Serial Number</FormLabel>
                <FormInput
                  id="serialNumber"
                  name="serialNumber"
                  value={form.serialNumber}
                  onChange={handleChange}
                  placeholder="e.g. SN-123456"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel>Bin Location (Lookup)</FormLabel>
                <FormSelect
                  id="binLocation"
                  name="binLocation"
                  value={form.binLocation}
                  onChange={handleChange}
                >
                  <option value="">Select bin location</option>
                  {binLocations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label} {loc.warehouse ? `— ${loc.warehouse}` : ''}
                    </option>
                  ))}
                  {/* Manual entry fallback */}
                  <option value="__manual__">Enter manually below</option>
                </FormSelect>
                {form.binLocation === '__manual__' && (
                  <FormInput
                    className="mt-2"
                    name="binLocation"
                    value=""
                    onChange={(e) => setForm((p) => ({ ...p, binLocation: e.target.value }))}
                    placeholder="e.g. A-Shelf-04"
                  />
                )}
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
          </div>

          {/* Footer */}
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
                <><CheckCircle2 size={16} /> Submit for Approval</>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
