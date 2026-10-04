import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Trash2, Upload } from 'lucide-react';
import api from '../services/api';
import { InputField, SelectField } from '../components/FormControls';


const ProcurementCreatePO = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([{ sku: '', product: '', quantity: 0, unitPrice: 0 }]);

  useEffect(() => {
    // Fetch vendors
    api.get('/vendors')
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setVendors(res.data); })
      .catch(() => { });
    // Fetch products
    api.get('/products')
      .then(res => {
        const arr = res.data?.data || res.data;
        if (Array.isArray(arr) && arr.length > 0) setProducts(arr);
      })
      .catch(() => { });
  }, []);

  const addItem = () => setItems(prev => [...prev, { sku: '', product: '', quantity: 0, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      // Auto-fill SKU and price when product is selected
      if (field === 'product') {
        const prod = products.find(p => p._id === value);
        if (prod) {
          updated[idx].sku = prod.sku || '';
          updated[idx].unitPrice = prod.basePrice || 0;
        }
      }
      return updated;
    });
  };

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.unitPrice)), 0);

  const handleSubmit = async (sendToVendor = false) => {
    setError('');
    if (!vendor) { setError('Please select a vendor.'); return; }
    if (!deliveryDate) { setError('Please set an expected delivery date.'); return; }
    const validItems = items.filter(it => it.product && it.quantity > 0 && it.unitPrice > 0);
    if (validItems.length === 0) { setError('Add at least one valid line item.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        vendor,
        expectedDeliveryDate: deliveryDate,
        notes,
        items: validItems.map(it => ({
          product: it.product,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      };
      await api.post('/purchase-orders', payload);
      navigate('/purchase-orders');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/purchase-orders')}
        className="flex items-center gap-1.5 text-[13px] text-[#65758B] hover:text-[#D90B37] bg-transparent border-none cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Back to Purchase Orders
      </button>

      {/* Gradient Header Banner */}
      <div className="rounded-[14px] p-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #D90B37 0%, #FF6B9D 100%)' }}>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-white">Create Purchase Order</h1>
          <p className="text-[13px] text-white/80">Raise a new PO with line items for approval</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Vendor & Delivery Details */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] p-6 space-y-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
        <h2 className="text-[14px] font-semibold text-[#0F1729] flex items-center gap-1.5">
          <span className="text-base">👤</span> Vendor &amp; Delivery Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Vendor"
            required
            value={vendor}
            onChange={e => setVendor(e.target.value)}
            placeholder="Choose a vendor"
          >
            {vendors.length > 0
              ? vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)
              : [
                <option key="v1" value="v1">Steel Corp India</option>,
                <option key="v2" value="v2">Bharat Chemicals</option>,
                <option key="v3" value="v3">Gupta Electronics</option>,
                <option key="v4" value="v4">Rathi Polymers</option>,
              ]}
          </SelectField>
          <InputField
            label="Expected Delivery Date"
            required
            type="date"
            value={deliveryDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDeliveryDate(e.target.value)}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[#0F1729] flex items-center gap-1.5">
            <span className="text-base">🛒</span> Line Items ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 h-9 px-4 bg-[#D90B37] hover:bg-[#AE032C] text-white text-[13px] font-semibold rounded-lg border-none cursor-pointer transition-colors"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="border border-[#E3E3E3] rounded-xl p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#D90B37] text-white text-[12px] font-bold flex items-center justify-center">{idx + 1}</div>
                  <span className="text-[13px] font-semibold text-[#0F1729]">Line Item</span>
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="text-[#878787] hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField
                  label="SKU"
                  placeholder="e.g. SKU-001"
                  value={item.sku}
                  onChange={e => updateItem(idx, 'sku', e.target.value)}
                />
                <SelectField
                  label="Product"
                  required
                  value={item.product}
                  onChange={e => updateItem(idx, 'product', e.target.value)}
                  placeholder="Select product"
                >
                  {products.length > 0
                    ? products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)
                    : [
                      <option key="p1" value="p1">MS Plates 6mm</option>,
                      <option key="p2" value="p2">Industrial Solvent</option>,
                      <option key="p3" value="p3">Control Panels</option>,
                    ]}
                </SelectField>
                <InputField
                  label="Quantity"
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.quantity || ''}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)}
                />
                <InputField
                  label="Rate (₹)"
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.unitPrice || ''}
                  onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                />
              </div>
              {(item.quantity > 0 && item.unitPrice > 0) && (
                <div className="mt-2 text-right text-[12px] text-[#65758B]">
                  Line Total: <span className="font-semibold text-[#0F1729]">₹{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="mt-4 flex justify-end">
          <div className="bg-[#FFF0F3] border border-[#FECDD5] rounded-xl px-6 py-3 text-right">
            <div className="text-[12px] text-[#65758B] font-medium">Grand Total</div>
            <div className="text-[22px] font-bold text-[#D90B37]">₹{grandTotal.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Notes & Attach Quote */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E1E7EF] rounded-[12px] p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-[13px] font-semibold text-[#0F1729] mb-3 flex items-center gap-1.5">
            📄 Notes
          </h3>
          <textarea
            rows={4}
            placeholder="Additional instructions, delivery notes, special requirements..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl px-4 py-3 text-[13px] text-[#0F1729] outline-none focus:border-[#D90B37] transition-all resize-none placeholder-[#878787]"
          />
        </div>
        <div className="bg-white border border-[#E1E7EF] rounded-[12px] p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-[13px] font-semibold text-[#0F1729] mb-3 flex items-center gap-1.5">
            📎 Attach Quote
          </h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E3E3E3] rounded-xl h-32 cursor-pointer hover:border-[#D90B37] transition-colors bg-[#F8FAFC]">
            <Upload size={24} className="text-[#878787] mb-2" />
            <span className="text-[13px] text-[#65758B]">Click to upload</span>
            <span className="text-[11px] text-[#878787] mt-1">PDF, DOC, XLS up to 10MB</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          onClick={() => navigate('/purchase-orders')}
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 border border-[#E3E3E3] text-[#65758B] rounded-[10px] text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer bg-white"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-[#D90B37] text-[#D90B37] rounded-[10px] text-sm font-semibold hover:bg-[#FFF0F3] transition-colors cursor-pointer bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          Send to Vendor
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-[10px] text-sm font-semibold transition-colors cursor-pointer border-none shadow-sm"
        >
          📋 {submitting ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </div>
    </div>
  );
};

export default ProcurementCreatePO;
