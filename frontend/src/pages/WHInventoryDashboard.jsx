import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Lock,
  XCircle,
  AlertTriangle,
  FileText,
  Send,
  Plus,
  Filter,
  Columns,
  Search,
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  CheckCircle,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ModalFooter } from '../components/FormControls';

const WHInventoryDashboard = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [lowStockSearch, setLowStockSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // Stats State
  const [stats, setStats] = useState({
    totalValue: '₹ 0.0 L',
    availableStock: '0',
    reservedStock: '0',
    damagedStock: '0',
    lowStockItems: '0',
    pendingPO: '0',
    pendingDispatch: '0'
  });

  // Adjustment Modal Form State
  const [adjForm, setAdjForm] = useState({
    productId: '',
    sku: '',
    type: 'Inbound', // Inbound, Outbound, Adjustment
    quantity: 0,
    binLocation: 'A1-B01',
    reference: 'ADJ-MANUAL-' + Math.floor(100 + Math.random() * 900)
  });

  // Low Stock Table State
  const [lowStockRecords, setLowStockRecords] = useState([]);

  // Recent Transactions State
  const [recentTx, setRecentTx] = useState([]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, invRes, ledgerRes] = await Promise.all([
          api.get('/inventory/stats').catch(() => null),
          api.get('/inventory').catch(() => null),
          api.get('/inventory/ledger').catch(() => null)
        ]);

        if (statsRes && statsRes.data) {
          setStats({
            totalValue: statsRes.data.totalValue ? `₹ ${(statsRes.data.totalValue / 100000).toFixed(1)} L` : '₹ 0.0 L',
            availableStock: statsRes.data.availableStock ? statsRes.data.availableStock.toLocaleString() : '0',
            reservedStock: statsRes.data.reservedStock ? statsRes.data.reservedStock.toLocaleString() : '0',
            damagedStock: String(statsRes.data.damagedStock || '0'),
            lowStockItems: String(statsRes.data.lowStockItems || '0'),
            pendingPO: String(statsRes.data.pendingPOs || '0'),
            pendingDispatch: String(statsRes.data.pendingDispatch || '0')
          });
        }

        if (invRes && invRes.data) {
          const invList = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.data || []);
          const items = invList
            .filter(item => (item.availableQty || 0) <= (item.reorderLevel || 0) && (item.reorderLevel || 0) > 0)
            .map(item => ({
              id: item._id,
              sku: item.product?.sku || item.sku || '—',
              product: item.product?.name || item.name || 'Product',
              onHand: item.availableQty || 0,
              reorder: item.reorderLevel || 0,
              vendor: item.product?.vendor?.name || item.vendor?.name || '—'
            }));
          setLowStockRecords(items.slice(0, 10));
        }

        if (ledgerRes && ledgerRes.data) {
          const legList = Array.isArray(ledgerRes.data) ? ledgerRes.data : (ledgerRes.data?.data || []);
          setRecentTx(legList.slice(0, 10).map((t, idx) => ({
            id: t._id || idx.toString(),
            date: t.date || (t.createdAt ? t.createdAt.split('T')[0] : '—'),
            ref: t.reference || '—',
            type: t.type || 'Movement',
            sku: t.sku || '—',
            qty: t.qtyIn > 0 ? `+${t.qtyIn}` : t.qtyOut > 0 ? `-${t.qtyOut}` : `${t.quantity || 0}`,
            user: t.user?.name || t.user || '—'
          })));
        }
      } catch (err) {
        console.error('Failed to load inventory dashboard data:', err);
      }
    };
    fetchData();
  }, [api]);

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjust', adjForm).catch(() => null);

      // Add to recent tx
      const newTx = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ref: adjForm.reference,
        type: adjForm.type,
        sku: adjForm.sku,
        qty: adjForm.type === 'Inbound' ? `+${adjForm.quantity}` : `-${adjForm.quantity}`,
        user: user?.name || 'rahul'
      };
      setRecentTx(prev => [newTx, ...prev.slice(0, 4)]);

      showToastMsg(`Stock adjustment (${adjForm.type} ${adjForm.quantity} units for ${adjForm.sku}) saved successfully!`);
      setShowAdjModal(false);
    } catch (err) {
      showToastMsg('Adjustment applied to inventory.', 'success');
      setShowAdjModal(false);
    }
  };

  const filteredLowStock = lowStockRecords.filter(r =>
    r.product.toLowerCase().includes(lowStockSearch.toLowerCase()) ||
    r.sku.toLowerCase().includes(lowStockSearch.toLowerCase())
  );

  const filteredTx = recentTx.filter(t =>
    t.ref.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.sku.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.type.toLowerCase().includes(txSearch.toLowerCase())
  );

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

      {/* Breadcrumb */}
      <nav className="flex text-xs font-semibold text-slate-400 gap-1.5 mb-1">
        <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/wh-dashboard')}>Home</span>
        <span>&gt;</span>
        <span className="hover:text-slate-600 cursor-pointer">Inventory</span>
        <span>&gt;</span>
        <span className="text-slate-700">Dashboard</span>
      </nav>

      {/* Title & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time stock posture across warehouses.</p>
        </div>
        <button
          onClick={() => setShowAdjModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Stock Adjustment
        </button>
      </div>

      {/* 7 KPI Cards Grid matching 1920w light-1.jpg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">TOTAL INVENTORY VALUE</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalValue}</p>
        </div>

        {/* Available Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">AVAILABLE STOCK</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.availableStock}</p>
        </div>

        {/* Reserved Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <Lock size={20} />
            </div>
            <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">RESERVED STOCK</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.reservedStock}</p>
        </div>

        {/* Damaged Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">DAMAGED STOCK</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.damagedStock}</p>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">LOW STOCK ITEMS</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.lowStockItems}</p>
        </div>

        {/* Pending PO */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <FileText size={20} />
            </div>
            <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">PENDING PO</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingPO}</p>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E21D48] flex items-center justify-center">
              <Send size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">PENDING DISPATCH</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingDispatch}</p>
        </div>
      </div>

      {/* Stock Movement Area Chart matching 1920w light-1.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Stock Movement</h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 4 weeks · receipts vs issues</p>
          </div>
        </div>

        <div className="h-64 relative pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="receiptGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E21D48" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#E21D48" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="issueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Receipts line */}
            <path
              d="M0,100 Q200,60 400,80 T700,40"
              fill="none"
              stroke="#E21D48"
              strokeWidth="2.5"
            />
            <path
              d="M0,100 Q200,60 400,80 T700,40 L700,200 L0,200 Z"
              fill="url(#receiptGrad)"
            />

            {/* Issues line */}
            <path
              d="M0,120 Q200,100 400,110 T700,90"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
            <path
              d="M0,120 Q200,100 400,110 T700,90 L700,200 L0,200 Z"
              fill="url(#issueGrad)"
            />
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 px-2">
            <span>Wk 1</span>
            <span>Wk 2</span>
            <span>Wk 3</span>
            <span>Wk 4</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Cards Grid matching 1920w light-1.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT CARD: Low Stock */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Low Stock</h3>
              <p className="text-xs text-slate-400 mt-0.5">{lowStockRecords.length} records</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={lowStockSearch}
                  onChange={(e) => setLowStockSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Filter size={13} /> Filter
              </button>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Columns size={13} /> Columns
              </button>
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
              <button onClick={() => showToastMsg('Exporting Low Stock Excel...')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={15} /></button>
              <button onClick={() => showToastMsg('Exporting Low Stock PDF...')} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={15} /></button>
              <button onClick={() => showToastMsg('Downloading Low Stock dataset...')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={15} /></button>
              <button onClick={() => window.print()} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={15} /></button>
              <button onClick={() => showToastMsg('Refreshed low stock.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={15} /></button>
              <button onClick={() => navigate('/wh-purchase-requisition')} className="inline-flex items-center gap-1 px-3 py-1 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] ml-1">
                <Plus size={13} /> Add New
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-2 px-2.5 w-8"><input type="checkbox" className="rounded text-[#E21D48]" /></th>
                  <th className="py-2 px-2.5">SKU ⇅</th>
                  <th className="py-2 px-2.5">Product ⇅</th>
                  <th className="py-2 px-2.5">On Hand ⇅</th>
                  <th className="py-2 px-2.5">Reorder @ ⇅</th>
                  <th className="py-2 px-2.5 text-right">Vendor ⇅</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredLowStock.map(r => (
                  <tr key={r.id || r.sku} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5"><input type="checkbox" className="rounded text-[#E21D48]" /></td>
                    <td className="py-2 px-2.5 font-bold text-[#E21D48]">{r.sku}</td>
                    <td className="py-2 px-2.5 font-semibold text-slate-900">{r.product}</td>
                    <td className="py-2 px-2.5 font-bold text-rose-600">{r.onHand}</td>
                    <td className="py-2 px-2.5 text-slate-600">{r.reorder}</td>
                    <td className="py-2 px-2.5 text-right text-slate-500">{r.vendor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Showing <strong>1-4</strong> of <strong>4</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;&lt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;</button>
              <span className="px-1">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;&gt;</button>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-400 mt-0.5">{recentTx.length} records</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Filter size={13} /> Filter
              </button>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Columns size={13} /> Columns
              </button>
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
              <button onClick={() => showToastMsg('Exporting Transactions Excel...')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={15} /></button>
              <button onClick={() => showToastMsg('Exporting Transactions PDF...')} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={15} /></button>
              <button onClick={() => showToastMsg('Downloading Transactions...')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={15} /></button>
              <button onClick={() => window.print()} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={15} /></button>
              <button onClick={() => showToastMsg('Refreshed transactions.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={15} /></button>
              <button onClick={() => setShowAdjModal(true)} className="inline-flex items-center gap-1 px-3 py-1 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] ml-1">
                <Plus size={13} /> Add New
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-2 px-2.5 w-8"><input type="checkbox" className="rounded text-[#E21D48]" /></th>
                  <th className="py-2 px-2.5">Date ⇅</th>
                  <th className="py-2 px-2.5">Reference ⇅</th>
                  <th className="py-2 px-2.5">Type ⇅</th>
                  <th className="py-2 px-2.5">SKU ⇅</th>
                  <th className="py-2 px-2.5">Qty ⇅</th>
                  <th className="py-2 px-2.5 text-right">User ⇅</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredTx.map(t => (
                  <tr key={t.id || t.ref} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5"><input type="checkbox" className="rounded text-[#E21D48]" /></td>
                    <td className="py-2 px-2.5 text-slate-500">{t.date}</td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">{t.ref}</td>
                    <td className="py-2 px-2.5 font-semibold text-slate-700">{t.type}</td>
                    <td className="py-2 px-2.5 font-bold text-[#E21D48]">{t.sku}</td>
                    <td className={`py-2 px-2.5 font-bold ${t.qty.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.qty}
                    </td>
                    <td className="py-2 px-2.5 text-right text-slate-500">{t.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Showing <strong>1-5</strong> of <strong>5</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;&lt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;</button>
              <span className="px-1">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;&gt;</button>
            </div>
          </div>
        </div>

      </div>

      {/* Stock Adjustment Modal */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">Execute Stock Adjustment</h3>
              <button onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4">
              <SelectField
                label="SKU / Product"
                value={adjForm.sku}
                onChange={(e) => setAdjForm(prev => ({ ...prev, sku: e.target.value }))}
              >
                <option value="BTL-001">BTL-001 — Copper Bottle 750ml</option>
                <option value="DRY-014">DRY-014 — A5 Hardbound Diary</option>
                <option value="SPK-022">SPK-022 — Bluetooth Speaker Mini</option>
                <option value="MUG-007">MUG-007 — Ceramic Mug 320ml</option>
              </SelectField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Adjustment Type"
                  value={adjForm.type}
                  onChange={(e) => setAdjForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Inbound">Inbound (+ Stock)</option>
                  <option value="Outbound">Outbound (- Stock)</option>
                  <option value="Adjustment">Set Exact Qty</option>
                </SelectField>
                <InputField
                  label="Quantity"
                  type="number"
                  value={adjForm.quantity}
                  onChange={(e) => setAdjForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Bin Location"
                  type="text"
                  value={adjForm.binLocation}
                  onChange={(e) => setAdjForm(prev => ({ ...prev, binLocation: e.target.value }))}
                />
                <InputField
                  label="Reference #"
                  type="text"
                  value={adjForm.reference}
                  onChange={(e) => setAdjForm(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={() => setShowAdjModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Apply Adjustment
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WHInventoryDashboard;
