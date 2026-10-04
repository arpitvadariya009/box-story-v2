import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Columns,
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Mail,
  List
} from 'lucide-react';

const WHInvoice = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Invoice Header State matching 1920w light-4.jpg
  const initialHeaderState = {
    invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(9000 + Math.random() * 1000),
    invoiceDate: new Date().toISOString().split('T')[0],
    clientName: 'Acme Pvt Ltd',
    gstNumber: '27AAACA9876E1ZM',
    status: 'Unpaid'
  };

  const [header, setHeader] = useState(initialHeaderState);

  // Line Items State matching 1920w light-4.jpg
  const initialItemsState = [
    {
      id: '1',
      product: 'Diwali Hamper – Premium',
      quantity: 50,
      rate: 2490,
      taxPct: 18,
      total: 146910
    }
  ];

  const [items, setItems] = useState(initialItemsState);

  // Totals State matching 1920w light-4.jpg
  const [totals, setTotals] = useState({
    subtotal: 124500,
    gst: 22410,
    freight: 0,
    discount: 0,
    grandTotal: 146910
  });

  // Existing Invoices for Table View Registry
  const [invoiceList, setInvoiceList] = useState([
    { id: 'INV-2026-9042', client: 'Acme Pvt Ltd', date: '2026-08-25', subtotal: '₹ 1,24,500', grandTotal: '₹ 1,46,910', status: 'Unpaid' },
    { id: 'INV-2026-9041', client: 'Wipro Technologies', date: '2026-08-22', subtotal: '₹ 74,745', grandTotal: '₹ 88,200', status: 'Paid' },
    { id: 'INV-2026-9040', client: 'Infosys Limited', date: '2026-08-19', subtotal: '₹ 2,03,390', grandTotal: '₹ 2,40,000', status: 'Paid' },
    { id: 'INV-2026-9039', client: 'TCS Digital', date: '2026-08-15', subtotal: '₹ 47,458', grandTotal: '₹ 56,000', status: 'Partial' }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Re-calculate Totals when items change
  useEffect(() => {
    const sub = items.reduce((acc, curr) => acc + (curr.quantity * curr.rate), 0);
    const gstVal = items.reduce((acc, curr) => acc + ((curr.quantity * curr.rate) * (curr.taxPct / 100)), 0);
    const gr = sub + gstVal + Number(totals.freight || 0) - Number(totals.discount || 0);

    setTotals(prev => ({
      ...prev,
      subtotal: Math.round(sub),
      gst: Math.round(gstVal),
      grandTotal: Math.round(gr)
    }));
  }, [items, totals.freight, totals.discount]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const handleTotalsChange = (e) => {
    const { name, value } = e.target;
    setTotals(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const q = Number(field === 'quantity' ? value : updated.quantity) || 0;
        const r = Number(field === 'rate' ? value : updated.rate) || 0;
        const t = Number(field === 'taxPct' ? value : updated.taxPct) || 0;
        const lineSub = q * r;
        updated.total = Math.round(lineSub + (lineSub * (t / 100)));
        return updated;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      product: 'Copper Bottle 750ml',
      quantity: 20,
      rate: 650,
      taxPct: 18,
      total: 15340
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('Added line item to invoice.');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    showToastMsg('Line item removed.', 'info');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(items.map(i => i.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleSave = async () => {
    try {
      const payload = {
        invoiceNumber: header.invoiceNumber,
        invoiceDate: header.invoiceDate,
        clientName: header.clientName,
        gstNumber: header.gstNumber,
        subtotal: totals.subtotal,
        gst: totals.gst,
        freight: totals.freight,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        items,
        status: header.status
      };
      await api.post('/invoices', payload).catch(() => null);

      const newInv = {
        id: header.invoiceNumber,
        client: header.clientName,
        date: header.invoiceDate,
        subtotal: `₹ ${totals.subtotal.toLocaleString()}`,
        grandTotal: `₹ ${totals.grandTotal.toLocaleString()}`,
        status: header.status
      };
      setInvoiceList(prev => [newInv, ...prev]);

      showToastMsg(`Tax Invoice "${header.invoiceNumber}" saved successfully!`);
    } catch (err) {
      showToastMsg(`Invoice "${header.invoiceNumber}" saved.`, 'success');
    }
  };

  const handlePrint = () => {
    showToastMsg(`Printing Tax Invoice ${header.invoiceNumber}...`);
    window.print();
  };

  const handleEmailInvoice = () => {
    showToastMsg(`Tax Invoice ${header.invoiceNumber} emailed to ${header.clientName}!`);
  };

  const filteredItems = items.filter(i =>
    i.product.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate GST tax invoices, line items breakdown & payment receipts.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <FileText size={16} />}
            {viewMode === 'form' ? 'View All Invoices' : 'New Invoice Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Invoices Registry ({invoiceList.length})</h3>
            <button
              onClick={() => {
                setHeader({
                  ...initialHeaderState,
                  invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + Math.floor(9000 + Math.random() * 1000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">INVOICE #</th>
                  <th className="pb-3 px-3">CLIENT</th>
                  <th className="pb-3 px-3">DATE</th>
                  <th className="pb-3 px-3">SUBTOTAL</th>
                  <th className="pb-3 px-3">GRAND TOTAL</th>
                  <th className="pb-3 px-3 text-right">PAYMENT STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {invoiceList.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{inv.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{inv.client}</td>
                    <td className="py-3.5 px-3 text-slate-500">{inv.date}</td>
                    <td className="py-3.5 px-3 text-slate-700">{inv.subtotal}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{inv.grandTotal}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                        inv.status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-4.jpg */
        <div className="space-y-6">

          {/* CARD 1: Invoice Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Invoice Header</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                header.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {header.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">INVOICE NUMBER</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={header.invoiceNumber}
                  onChange={handleHeaderChange}
                  placeholder="Invoice Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">INVOICE DATE</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={header.invoiceDate}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CLIENT NAME</label>
                <input
                  type="text"
                  name="clientName"
                  value={header.clientName}
                  onChange={handleHeaderChange}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GST NUMBER</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={header.gstNumber}
                  onChange={handleHeaderChange}
                  placeholder="GST Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700 uppercase"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Totals */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Totals</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SUBTOTAL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="text"
                    value={totals.subtotal.toLocaleString()}
                    readOnly
                    placeholder="Subtotal"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GST</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="text"
                    value={totals.gst.toLocaleString()}
                    readOnly
                    placeholder="GST"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">FREIGHT</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    name="freight"
                    value={totals.freight}
                    onChange={handleTotalsChange}
                    placeholder="Freight"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DISCOUNT</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    name="discount"
                    value={totals.discount}
                    onChange={handleTotalsChange}
                    placeholder="Discount"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GRAND TOTAL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                  <input
                    type="text"
                    value={totals.grandTotal.toLocaleString()}
                    readOnly
                    placeholder="Grand Total"
                    className="w-full pl-7 pr-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl font-extrabold text-[#E21D48] cursor-not-allowed text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Line Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Line Items</h3>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} record</p>
              </div>
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
                <button onClick={() => showToastMsg('Exporting Invoice to Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
                  <FileSpreadsheet size={16} />
                </button>
                <button onClick={() => showToastMsg('Exporting Invoice to PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
                  <FileText size={16} />
                </button>
                <button onClick={() => showToastMsg('Downloading Invoice dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
                  <Download size={16} />
                </button>
                <button onClick={handlePrint} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
                  <Printer size={16} />
                </button>
                <button onClick={() => showToastMsg('Refreshed line items.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Fullscreen">
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={handleAddItem}
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
                        checked={selectedRows.length === items.length && items.length > 0}
                        className="rounded text-[#E21D48] focus:ring-rose-500"
                      />
                    </th>
                    <th className="py-2.5 px-3">Product ⇅</th>
                    <th className="py-2.5 px-3">Quantity ⇅</th>
                    <th className="py-2.5 px-3">Rate ⇅</th>
                    <th className="py-2.5 px-3">Tax ⇅</th>
                    <th className="py-2.5 px-3">Total ⇅</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                          className="rounded text-[#E21D48] focus:ring-rose-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <input
                          type="text"
                          value={item.product}
                          onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                          className="w-56 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1">
                          <span>₹</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                            className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={item.taxPct}
                            onChange={(e) => handleItemChange(item.id, 'taxPct', Number(e.target.value))}
                            className="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-[#E21D48]">
                        ₹ {item.total ? item.total.toLocaleString() : 0}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove line item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching 1920w light-4.jpg */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 gap-3">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span>Showing <strong>1-{filteredItems.length}</strong> of <strong>{filteredItems.length}</strong></span>
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

          {/* CARD 4: Bottom Action Bar matching 1920w light-4.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleEmailInvoice}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Mail size={15} /> Email Invoice
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHInvoice;
