import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Loader2, AlertTriangle, ChevronDown, Plus, Trash2, X } from 'lucide-react';

/* ─── Shared Form Components ───────────────────────────────────────────── */
function FormLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-[#D90B37] ml-0.5">*</span>}
    </label>
  );
}

function FormInput({ id, className = '', ...props }) {
  return (
    <input
      id={id}
      className={`w-full h-10 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white ${className}`}
      {...props}
    />
  );
}

function FormSelect({ id, children, value, onChange, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full h-10 px-3.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-all focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/10 bg-white appearance-none cursor-pointer ${className}`}
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

function SectionCard({ title, children, headerRight }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        {headerRight}
      </div>
      <div className="p-6 space-y-5">{children}</div>
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

const EMPTY_LINE = { product: '', quantity: 1 };

export default function DataEntryOrderEntry() {
  const { api } = useAuth();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [client, setClient] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_LINE }]);
  const [address, setAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Normal');

  const fetchLookups = useCallback(async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/data-entry/clients'),
        api.get('/data-entry/products-list'),
      ]);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
    } catch {
      // Silent failure
    }
  }, [api]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  const addLine = () => setItems((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateLine = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleClear = () => {
    setClient('');
    setItems([{ ...EMPTY_LINE }]);
    setAddress({ street: '', apartment: '', city: '', state: '', zipCode: '', country: 'India' });
    setNotes('');
    setPriority('Normal');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) { setError('Please select a customer/client.'); return; }
    if (items.some((i) => !i.product || !i.quantity)) { setError('All product lines must have a product and quantity.'); return; }
    if (!address.street || !address.city) { setError('Street address and city are required.'); return; }

    const shippingAddress = {
      street: `${address.street}${address.apartment ? ', ' + address.apartment : ''}`,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    };

    try {
      setLoading(true);
      setError('');
      await api.post('/data-entry/orders', {
        client,
        items: items.map((i) => ({ product: i.product, quantity: parseInt(i.quantity) || 1 })),
        shippingAddress,
        notes,
        priority,
      });
      setSuccess('Order submitted for confirmation!');
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

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-3 bg-red-50 border border-red-100 rounded-2xl">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Customer Information */}
        <SectionCard title="Customer Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FormLabel required>Customer / Client</FormLabel>
              <FormSelect id="client" value={client} onChange={(e) => setClient(e.target.value)}>
                <option value="">Lookup customer...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <FormLabel>Priority</FormLabel>
              <FormSelect id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </FormSelect>
            </div>
          </div>
        </SectionCard>

        {/* Products & Quantities */}
        <SectionCard
          title="Products & Quantities"
          headerRight={
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#D90B37] hover:text-[#b8082d] transition-colors"
            >
              <Plus size={16} />
              Add Line
            </button>
          }
        >
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <FormSelect
                    value={item.product}
                    onChange={(e) => updateLine(idx, 'product', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku}) — ₹{p.basePrice}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div className="w-28">
                  <FormInput
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Delivery Address */}
        <SectionCard title="Delivery Address">
          <div className="space-y-4">
            <div>
              <FormLabel required>Address Line 1</FormLabel>
              <FormInput
                value={address.street}
                onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div>
              <FormLabel>Address Line 2</FormLabel>
              <FormInput
                value={address.apartment}
                onChange={(e) => setAddress((p) => ({ ...p, apartment: e.target.value }))}
                placeholder="Apt, suite, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel required>City</FormLabel>
                <FormInput
                  value={address.city}
                  onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div>
                <FormLabel>State</FormLabel>
                <FormInput
                  value={address.state}
                  onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div>
                <FormLabel>PIN Code</FormLabel>
                <FormInput
                  value={address.zipCode}
                  onChange={(e) => setAddress((p) => ({ ...p, zipCode: e.target.value }))}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Notes">
          <FormTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for this order (optional)"
            rows={3}
          />
        </SectionCard>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
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
              <><CheckCircle2 size={16} /> Submit for Confirmation</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
