import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Columns,
  Plus,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WHStockLedger = () => {
  const { api } = useAuth();
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    sku: '',
    productName: '',
    warehouse: 'Warehouse',
    dateFrom: '',
    dateTo: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [transactions, setTransactions] = useState([
    { id: '1', date: '2026-06-21', ref: 'GRN-1042', type: 'Receipt', qtyIn: 200, qtyOut: 0, balance: 212, user: 'rahul' },
    { id: '2', date: '2026-06-22', ref: 'SO-2039', type: 'Issue', qtyIn: 0, qtyOut: 80, balance: 132, user: 'priya' },
    { id: '3', date: '2026-06-24', ref: 'DSP-0312', type: 'Dispatch', qtyIn: 0, qtyOut: 40, balance: 92, user: 'ankit' }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sku) params.append('sku', filters.sku);
      if (filters.productName) params.append('productName', filters.productName);
      if (filters.warehouse && filters.warehouse !== 'Warehouse') params.append('warehouse', filters.warehouse);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const res = await api.get(`/inventory/ledger?${params.toString()}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setTransactions(res.data.map((t, idx) => ({
          id: t._id || String(idx),
          date: t.date,
          ref: t.reference,
          type: t.type,
          qtyIn: t.qtyIn,
          qtyOut: t.qtyOut,
          balance: t.balance,
          user: t.user
        })));
      }
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    fetchLedger();
    showToastMsg('Filtered Stock Ledger entries.');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(transactions.map(t => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredTransactions = transactions.filter(t =>
    t.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Ledger</h1>
      </div>

      {/* CARD 1: Filters Card matching 1920w light-2.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Filters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SKU</label>
            <input
              type="text"
              placeholder="SKU"
              value={filters.sku}
              onChange={(e) => setFilters({ ...filters, sku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT NAME</label>
            <input
              type="text"
              placeholder="Product Name"
              value={filters.productName}
              onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">WAREHOUSE</label>
            <input
              type="text"
              placeholder="Warehouse"
              value={filters.warehouse}
              onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DATE FROM</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              max={filters.dateTo || undefined}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  dateFrom: val,
                  dateTo: val && prev.dateTo && val > prev.dateTo ? '' : prev.dateTo
                }));
              }}
              onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch (_) {} }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DATE TO</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              min={filters.dateFrom || undefined}
              onChange={(e) => {
                const val = e.target.value;
                if (val && filters.dateFrom && val < filters.dateFrom) return;
                setFilters(prev => ({ ...prev, dateTo: val }));
              }}
              onClick={(e) => { try { e.target.showPicker && e.target.showPicker(); } catch (_) {} }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Transaction Grid matching 1920w light-2.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Transaction Grid</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filteredTransactions.length} records</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
              <Filter size={14} /> Filter
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
              <Columns size={14} /> Columns
            </button>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button onClick={() => showToastMsg('Exporting Stock Ledger to Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
              <FileSpreadsheet size={16} />
            </button>
            <button onClick={() => showToastMsg('Exporting Stock Ledger to PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
              <FileText size={16} />
            </button>
            <button onClick={() => showToastMsg('Downloading Stock Ledger dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
              <Download size={16} />
            </button>
            <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
              <Printer size={16} />
            </button>
            <button onClick={handleSearchClick} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Fullscreen">
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => showToastMsg('Record manual entry.')}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors ml-2"
            >
              <Plus size={14} /> Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0}
                    className="rounded text-[#E21D48] focus:ring-rose-500"
                  />
                </th>
                <th className="py-2.5 px-3">Transaction Date ⇅</th>
                <th className="py-2.5 px-3">Reference Number ⇅</th>
                <th className="py-2.5 px-3">Transaction Type ⇅</th>
                <th className="py-2.5 px-3">Qty In ⇅</th>
                <th className="py-2.5 px-3">Qty Out ⇅</th>
                <th className="py-2.5 px-3">Balance ⇅</th>
                <th className="py-2.5 px-3 text-right">User ⇅</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTransactions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="rounded text-[#E21D48] focus:ring-rose-500"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{row.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.ref}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{row.type}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{row.qtyIn}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">{row.qtyOut}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.balance}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{row.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 gap-3">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>Showing <strong>1-{filteredTransactions.length}</strong> of <strong>{filteredTransactions.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-not-allowed">&lt;&lt;</button>
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-not-allowed">&lt;</button>
              <span className="px-2 font-medium">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-not-allowed">&gt;</button>
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-not-allowed">&gt;&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar matching 1920w light-2.jpg */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
        <button
          onClick={handleSearchClick}
          className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Search size={15} /> Search
        </button>
        <button
          onClick={() => showToastMsg('Exporting Stock Ledger to Excel...')}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <FileSpreadsheet size={15} className="text-emerald-600" /> Export Excel
        </button>
        <button
          onClick={() => showToastMsg('Exporting Stock Ledger to PDF...')}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <FileText size={15} className="text-rose-600" /> Export PDF
        </button>
      </div>
    </div>
  );
};

export default WHStockLedger;
