import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';

const WHProductSnapshot = () => {
  const { api } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample Products DB for Selector
  const sampleSnapshots = {
    'BTL-001': {
      sku: 'BTL-001',
      productName: 'Copper Bottle 750ml',
      currentStock: 240,
      reservedStock: 40,
      incomingStock: 100,
      availableToSell: 200,
      lastPurchase: '2026-08-21 · PO-8840 (200 units)',
      lastSale: '2026-08-24 · SO-2041 (80 units)',
      lastDispatch: '2026-08-23 · DSP-0312 (40 units)',
      lastReturn: '2026-08-19 · RET-0091 (12 units)'
    },
    'DRY-014': {
      sku: 'DRY-014',
      productName: 'A5 Hardbound Diary',
      currentStock: 180,
      reservedStock: 20,
      incomingStock: 300,
      availableToSell: 160,
      lastPurchase: '2026-08-15 · PO-8835 (500 units)',
      lastSale: '2026-08-22 · SO-2038 (50 units)',
      lastDispatch: '2026-08-21 · DSP-0308 (50 units)',
      lastReturn: '2026-08-10 · RET-0084 (4 units)'
    },
    'SPK-022': {
      sku: 'SPK-022',
      productName: 'Bluetooth Speaker Mini',
      currentStock: 15,
      reservedStock: 12,
      incomingStock: 50,
      availableToSell: 3,
      lastPurchase: '2026-08-10 · PO-8820 (100 units)',
      lastSale: '2026-08-23 · SO-2039 (40 units)',
      lastDispatch: '2026-08-23 · DSP-0310 (40 units)',
      lastReturn: 'None'
    },
    'MUG-007': {
      sku: 'MUG-007',
      productName: 'Ceramic Mug 320ml',
      currentStock: 450,
      reservedStock: 50,
      incomingStock: 200,
      availableToSell: 400,
      lastPurchase: '2026-08-18 · PO-8831 (500 units)',
      lastSale: '2026-08-24 · SO-2040 (100 units)',
      lastDispatch: '2026-08-24 · DSP-0315 (100 units)',
      lastReturn: '2026-08-20 · RET-0089 (8 units)'
    }
  };

  const [form, setForm] = useState(sampleSnapshots['BTL-001']);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'sku' && sampleSnapshots[value.toUpperCase()]) {
        return sampleSnapshots[value.toUpperCase()];
      }
      if (name === 'currentStock' || name === 'reservedStock') {
        const cs = Number(name === 'currentStock' ? value : updated.currentStock) || 0;
        const rs = Number(name === 'reservedStock' ? value : updated.reservedStock) || 0;
        updated.availableToSell = Math.max(0, cs - rs);
      }
      return updated;
    });
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = form.sku.trim().toUpperCase();
    if (sampleSnapshots[query]) {
      setForm(sampleSnapshots[query]);
      showToastMsg(`Loaded Inventory Snapshot for ${query}.`);
    } else {
      showToastMsg(`Searched Inventory Snapshot for ${form.sku || form.productName}.`);
    }
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

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Inventory Snapshot</h1>
      </div>

      {/* CARD 1: Product Information matching Background.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Product Information</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Select SKU:</span>
            <select
              value={form.sku}
              onChange={(e) => setForm(sampleSnapshots[e.target.value] || form)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#E21D48]"
            >
              <option value="BTL-001">BTL-001 (Copper Bottle)</option>
              <option value="DRY-014">DRY-014 (Hardbound Diary)</option>
              <option value="SPK-022">SPK-022 (Bluetooth Speaker)</option>
              <option value="MUG-007">MUG-007 (Ceramic Mug)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleInputChange}
              placeholder="SKU"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-[#E21D48]"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT NAME</label>
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleInputChange}
              placeholder="Product Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CURRENT STOCK</label>
            <input
              type="number"
              name="currentStock"
              value={form.currentStock}
              onChange={handleInputChange}
              placeholder="Current Stock"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RESERVED STOCK</label>
            <input
              type="number"
              name="reservedStock"
              value={form.reservedStock}
              onChange={handleInputChange}
              placeholder="Reserved Stock"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-amber-600"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">INCOMING STOCK</label>
            <input
              type="number"
              name="incomingStock"
              value={form.incomingStock}
              onChange={handleInputChange}
              placeholder="Incoming Stock"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">AVAILABLE TO SELL</label>
            <input
              type="number"
              name="availableToSell"
              value={form.availableToSell}
              readOnly
              placeholder="Available to Sell"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-emerald-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Movement History matching Background.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Movement History</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LAST PURCHASE</label>
            <input
              type="text"
              name="lastPurchase"
              value={form.lastPurchase}
              onChange={handleInputChange}
              placeholder="Last Purchase"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LAST SALE</label>
            <input
              type="text"
              name="lastSale"
              value={form.lastSale}
              onChange={handleInputChange}
              placeholder="Last Sale"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LAST DISPATCH</label>
            <input
              type="text"
              name="lastDispatch"
              value={form.lastDispatch}
              onChange={handleInputChange}
              placeholder="Last Dispatch"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LAST RETURN</label>
            <input
              type="text"
              name="lastReturn"
              value={form.lastReturn}
              onChange={handleInputChange}
              placeholder="Last Return"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar matching Background.jpg */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Search size={15} /> Search
        </button>
        <button
          onClick={() => showToastMsg('Exporting Product Inventory Snapshot to Excel...')}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet size={15} className="text-emerald-600" /> Export Excel
        </button>
        <button
          onClick={() => showToastMsg('Exporting Product Inventory Snapshot to PDF...')}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <FileText size={15} className="text-rose-600" /> Export PDF
        </button>
      </div>
    </div>
  );
};

export default WHProductSnapshot;
