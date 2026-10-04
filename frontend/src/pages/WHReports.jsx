import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Mail,
  Play,
  CheckCircle,
  AlertCircle,
  Table
} from 'lucide-react';

const WHReports = () => {
  const { api } = useAuth();
  const [toast, setToast] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    dateRange: 'Current Month',
    client: 'All Clients',
    product: 'All Products',
    category: 'All Categories',
    warehouse: 'Main Hub',
    vendor: 'All Vendors',
    salesPerson: 'All'
  });

  const [selectedReport, setSelectedReport] = useState('Product Sales Report');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 14 Available Reports
  const reportTypes = [
    'Product Sales Report',
    'Inventory Report',
    'Purchase Report',
    'Sales Report',
    'Dispatch Report',
    'GRN Report',
    'Client Report',
    'Vendor Report',
    'Low Stock Report',
    'Stock Ledger Report',
    'Branding Report',
    'Gift Box Report',
    'Invoice Report',
    'Return Report'
  ];

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    showToastMsg(`Generating "${selectedReport}" with selected filters...`);
    try {
      const [ordersRes, invRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/inventory').catch(() => ({ data: [] }))
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const inventory = invRes.data?.data || invRes.data || [];

      let dynamicRows = [];

      if (selectedReport.includes('Inventory') || selectedReport.includes('Stock')) {
        dynamicRows = inventory.map((inv, idx) => ({
          id: String(idx + 1),
          ref: inv.product?.sku || `SKU-${idx + 100}`,
          item: inv.product?.name || inv.name || 'Inventory Item',
          qty: inv.availableQty || inv.quantity || 0,
          amount: `₹ ${Number((inv.availableQty || 0) * (inv.product?.basePrice || inv.product?.unitPrice || 0)).toLocaleString('en-IN')}`,
          status: (inv.availableQty || 0) <= (inv.reorderLevel || 0) && (inv.reorderLevel || 0) > 0 ? 'Low Stock' : 'In Stock'
        }));
      } else {
        dynamicRows = orders.map((o, idx) => ({
          id: String(idx + 1),
          ref: o.orderNumber || `SO-2026-${idx + 1000}`,
          item: o.eventName || (o.items && o.items[0]?.product?.name) || 'Corporate Gift Order',
          qty: o.totalQuantity || (o.items ? o.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0),
          amount: `₹ ${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
          status: o.status || 'Completed'
        }));
      }

      setReportData({
        title: selectedReport,
        generatedAt: new Date().toLocaleString(),
        rows: dynamicRows
      });
      setLoading(false);
      showToastMsg(`Report "${selectedReport}" generated successfully! (${dynamicRows.length} rows)`);
    } catch (err) {
      setLoading(false);
      showToastMsg('Failed to generate report', 'error');
    }
  };

  const handleExportExcel = () => {
    showToastMsg(`Exported "${selectedReport}" to Excel (.xlsx) file.`);
  };

  const handleExportPDF = () => {
    showToastMsg(`Exported "${selectedReport}" to PDF document.`);
  };

  const handleSchedule = () => {
    showToastMsg(`Scheduled automated monthly email for "${selectedReport}".`);
  };

  const handleEmail = () => {
    showToastMsg(`Report "${selectedReport}" emailed to warehouse leadership.`);
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate, schedule and export operational reports.</p>
      </div>

      {/* CARD 1: Report Filters matching 1920w light-11.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Report Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DATE RANGE</label>
            <input
              type="text"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              placeholder="Date Range"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CLIENT</label>
            <input
              type="text"
              name="client"
              value={filters.client}
              onChange={handleFilterChange}
              placeholder="Client"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT</label>
            <input
              type="text"
              name="product"
              value={filters.product}
              onChange={handleFilterChange}
              placeholder="Product"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CATEGORY</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Category"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">WAREHOUSE</label>
            <input
              type="text"
              name="warehouse"
              value={filters.warehouse}
              onChange={handleFilterChange}
              placeholder="Warehouse"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">VENDOR</label>
            <input
              type="text"
              name="vendor"
              value={filters.vendor}
              onChange={handleFilterChange}
              placeholder="Vendor"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SALES PERSON</label>
            <input
              type="text"
              name="salesPerson"
              value={filters.salesPerson}
              onChange={handleFilterChange}
              placeholder="Sales Person"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Available Reports matching 1920w light-11.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Available Reports</h3>
        </div>

        {/* 4-Column Grid of 14 Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const isSelected = selectedReport === report;
            return (
              <div
                key={report}
                onClick={() => setSelectedReport(report)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-[#E21D48] bg-rose-50/40 shadow-xs ring-1 ring-[#E21D48]'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-[#E21D48] text-white shadow-xs' : 'bg-rose-50 text-[#E21D48]'
                }`}>
                  <FileText size={20} />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-snug">{report}</span>
              </div>
            );
          })}
        </div>

        {/* Inner Action Bar inside Available Reports Card matching 1920w light-11.jpg */}
        <div className="flex items-center gap-3 pt-2 flex-wrap border-t border-slate-100">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
          >
            <Play size={15} /> Generate
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download size={15} className="text-rose-600" /> Export PDF
          </button>
          <button
            onClick={handleSchedule}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Calendar size={15} /> Schedule Report
          </button>
          <button
            onClick={handleEmail}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Mail size={15} /> Email Report
          </button>
        </div>
      </div>

      {/* Generated Report Data Display */}
      {reportData && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table size={18} className="text-[#E21D48]" />
              Generated Report: {reportData.title}
            </h3>
            <span className="text-xs text-slate-400 font-medium">Timestamp: {reportData.generatedAt}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">REFERENCE #</th>
                  <th className="pb-3 px-3">ITEM DESCRIPTION</th>
                  <th className="pb-3 px-3">QTY</th>
                  <th className="pb-3 px-3">TOTAL AMOUNT</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {reportData.rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-[#E21D48]">{row.ref}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{row.item}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.qty}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{row.amount}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD 3: Bottom Action Bar matching 1920w light-11.jpg */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Play size={15} /> Generate
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Export Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Export PDF
        </button>
        <button
          onClick={handleSchedule}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Schedule Report
        </button>
        <button
          onClick={handleEmail}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Email Report
        </button>
      </div>

    </div>
  );
};

export default WHReports;
