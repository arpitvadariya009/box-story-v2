import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Printer,
  Loader2,
  AlertTriangle,
  X,
  FileCheck,
} from 'lucide-react';

function formatCurrency(num) {
  return `₹${Number(num || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Generate e-Way Bill Modal ────────────────────────────────────────── */
function GenerateEWayBillModal({ onClose, onGenerated }) {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [dispatchNumber, setDispatchNumber] = useState('');
  const [fromWarehouse, setFromWarehouse] = useState('Mumbai Warehouse');
  const [toDestination, setToDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [validDays, setValidDays] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data || [])).catch(() => {});
  }, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber || !toDestination) {
      setError('Please fill in vehicle number and destination.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/eway-bills', {
        orderId: orderId || undefined,
        dispatchId: dispatchNumber,
        vehicleNumber,
        fromAddress: { name: fromWarehouse },
        toAddress: { name: toDestination },
        validDays: Number(validDays) || 3,
      });
      onGenerated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate e-Way bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Generate e-Way Bill & Gate Pass</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Order / Client</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            >
              <option value="">Select order...</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.orderNumber} — {o.client?.companyName || 'Client'} (₹{o.totalAmount})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Dispatch Ref</label>
              <input
                type="text"
                value={dispatchNumber}
                onChange={(e) => setDispatchNumber(e.target.value)}
                placeholder="DSP-401"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">From Location</label>
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              >
                <option value="Mumbai Warehouse">Mumbai Warehouse</option>
                <option value="Delhi Warehouse">Delhi Warehouse</option>
                <option value="Bangalore FC">Bangalore FC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Destination (To) *</label>
            <input
              type="text"
              value={toDestination}
              onChange={(e) => setToDestination(e.target.value)}
              placeholder="e.g. Myntra Hub, Bangalore"
              className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vehicle Number *</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="MH-12-AB-1234"
                className="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Validity</label>
              <select
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#D90B37]"
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />} Generate e-Way Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function AccountsEWayBills() {
  const { api } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts/eway-bills');
      setBills(res.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const displayBills = bills.map(b => ({
    _id: b._id,
    billNumber: b.billNumber || 'EWB-—',
    dispatchNumber: b.dispatchNumber || b.dispatch?.dispatchNumber || '—',
    fromLocation: b.fromLocation || 'Main Warehouse',
    toDestination: b.clientName || b.destination || '—',
    totalValue: b.totalValue || 0,
    vehicleNumber: b.vehicleNumber || '—',
    validTill: b.validUpto || b.validTill || '—',
    status: b.status || 'Active',
  }));

  const filtered = search
    ? displayBills.filter(
        (b) =>
          b.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
          b.dispatchNumber?.toLowerCase().includes(search.toLowerCase()) ||
          b.toDestination?.toLowerCase().includes(search.toLowerCase()) ||
          b.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : displayBills;

  const handlePrint = (b) => {
    alert(`Printing Gate Pass / e-Way Bill: ${b.billNumber}`);
  };

  return (
    <>
      {showGenerateModal && (
        <GenerateEWayBillModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={fetchBills}
        />
      )}

      <div className="space-y-4">
        {/* Header with Generate e-Way Bill Button (Image 1) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">e-Way Bill & Gate Pass</h1>
            <p className="text-sm text-gray-400 mt-0.5">GST portal integration & dispatch gate passes</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#D90B37] rounded-xl hover:bg-[#b8082d] transition-colors shadow-sm"
          >
            <Plus size={16} /> Generate e-Way Bill
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search e-Way bills..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D90B37] text-gray-800"
            />
          </div>
        </div>

        {/* Data Table (Exact layout from Image 1) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#D90B37]" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5">e-Way Bill</th>
                    <th className="text-left px-6 py-3.5">Dispatch</th>
                    <th className="text-left px-6 py-3.5">From</th>
                    <th className="text-left px-6 py-3.5">To</th>
                    <th className="text-left px-6 py-3.5">Value</th>
                    <th className="text-left px-6 py-3.5">Vehicle</th>
                    <th className="text-left px-6 py-3.5">Valid Till</th>
                    <th className="text-left px-6 py-3.5">Status</th>
                    <th className="text-right px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{b.billNumber}</td>
                      <td className="px-6 py-3.5 text-gray-400 font-medium text-xs">{b.dispatchNumber}</td>
                      <td className="px-6 py-3.5 text-gray-700 text-xs font-medium">{b.fromLocation}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">{b.toDestination}</td>
                      <td className="px-6 py-3.5 font-bold text-gray-900">{formatCurrency(b.totalValue)}</td>
                      <td className="px-6 py-3.5 text-gray-600 text-xs font-semibold">{b.vehicleNumber}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{formatDate(b.validTill)}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${
                            b.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-red-50 text-red-500 border-red-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end text-gray-400">
                          <button
                            onClick={() => handlePrint(b)}
                            title="Print / Download Gate Pass"
                            className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
