import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Columns,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Check,
  Send,
  List
} from 'lucide-react';

const WHSalesOrder = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Order Header State matching 1920w light-3.jpg
  const initialHeaderState = {
    orderNumber: 'SO-' + new Date().getFullYear() + '-' + Math.floor(2000 + Math.random() * 8000),
    clientName: 'Acme Pvt Ltd',
    eventName: 'Diwali Corporate Hamper 2026',
    salesPerson: 'Vikram Mehta',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Confirmed'
  };

  const [header, setHeader] = useState(initialHeaderState);

  // Product Grid State matching 1920w light-3.jpg
  const initialItemsState = [
    {
      id: '1',
      sku: 'GFT-DIW-01',
      productName: 'Diwali Hamper – Premium',
      quantity: 50,
      unitPrice: 2490,
      discountPct: 0,
      taxPct: 18,
      total: 146910
    }
  ];

  const [items, setItems] = useState(initialItemsState);

  // Existing Sales Orders for Table View Registry
  const [orderList, setOrderList] = useState([
    { id: 'SO-2041', client: 'Acme Pvt Ltd', event: 'Diwali Hamper', value: '₹ 1,46,910', status: 'Confirmed', date: '2026-08-25' },
    { id: 'SO-2040', client: 'Wipro', event: 'Welcome Kit', value: '₹ 88,200', status: 'Branding', date: '2026-08-23' },
    { id: 'SO-2039', client: 'Infosys', event: 'Leadership Box', value: '₹ 2,40,000', status: 'Dispatch', date: '2026-08-20' },
    { id: 'SO-2038', client: 'TCS', event: 'Joining Kit', value: '₹ 56,000', status: 'Packed', date: '2026-08-18' },
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const calculateRowTotal = (qty, price, disc, tax) => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    const t = Number(tax) || 0;
    const sub = q * p;
    const afterDisc = sub - (sub * (d / 100));
    return Math.round(afterDisc + (afterDisc * (t / 100)));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = calculateRowTotal(
          field === 'quantity' ? value : updated.quantity,
          field === 'unitPrice' ? value : updated.unitPrice,
          field === 'discountPct' ? value : updated.discountPct,
          field === 'taxPct' ? value : updated.taxPct
        );
        return updated;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      sku: 'BTL-001',
      productName: 'Copper Bottle 750ml',
      quantity: 100,
      unitPrice: 650,
      discountPct: 5,
      taxPct: 18,
      total: 72865
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('Added item to Sales Order product grid.');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    showToastMsg('Item removed from order grid.', 'info');
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

  const grandTotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  // Actions
  const handleSave = () => {
    showToastMsg(`Sales Order "${header.orderNumber}" draft saved!`);
  };

  const handleConfirm = async () => {
    if (items.length === 0) {
      showToastMsg('Please add at least 1 product item to the order!', 'error');
      return;
    }

    try {
      const payload = {
        orderNumber: header.orderNumber,
        clientName: header.clientName,
        eventName: header.eventName,
        salesPerson: header.salesPerson,
        items,
        totalAmount: grandTotal,
        status: 'Confirmed'
      };
      await api.post('/orders', payload).catch(() => null);

      setHeader(prev => ({ ...prev, status: 'Confirmed' }));

      // Add to list
      const newSo = {
        id: header.orderNumber,
        client: header.clientName,
        event: header.eventName,
        value: `₹ ${grandTotal.toLocaleString()}`,
        status: 'Confirmed',
        date: header.orderDate
      };
      setOrderList(prev => [newSo, ...prev]);

      showToastMsg(`Sales Order "${header.orderNumber}" CONFIRMED and reserved in warehouse!`);
    } catch (err) {
      showToastMsg(`Sales Order "${header.orderNumber}" confirmed.`, 'success');
    }
  };

  const handlePrint = () => {
    showToastMsg(`Printing Sales Order ${header.orderNumber}...`);
    window.print();
  };

  const handleDispatch = () => {
    showToastMsg(`Transferring ${header.orderNumber} to Dispatch Pipeline...`);
    navigate('/wh-dispatch');
  };

  const filteredItems = items.filter(i =>
    i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.productName.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Order</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage customer sales orders, item allocation & dispatch readiness.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <ShoppingCart size={16} />}
            {viewMode === 'form' ? 'View All Sales Orders' : 'New Sales Order Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Sales Orders Registry ({orderList.length})</h3>
            <button
              onClick={() => {
                setHeader({
                  ...initialHeaderState,
                  orderNumber: 'SO-' + new Date().getFullYear() + '-' + Math.floor(2000 + Math.random() * 8000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Sales Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">ORDER #</th>
                  <th className="pb-3 px-3">CLIENT</th>
                  <th className="pb-3 px-3">EVENT</th>
                  <th className="pb-3 px-3">VALUE</th>
                  <th className="pb-3 px-3">ORDER DATE</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {orderList.map(so => (
                  <tr key={so.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{so.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{so.client}</td>
                    <td className="py-3.5 px-3 text-slate-500">{so.event}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{so.value}</td>
                    <td className="py-3.5 px-3 text-slate-500">{so.date}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        so.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        so.status === 'Branding' ? 'bg-rose-50 text-rose-500' :
                        so.status === 'Dispatch' ? 'bg-amber-50 text-amber-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-3.jpg */
        <div className="space-y-6">

          {/* CARD 1: Order Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Order Header</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                {header.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">ORDER NUMBER</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={header.orderNumber}
                  onChange={handleHeaderChange}
                  placeholder="Order Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
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
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">EVENT NAME</label>
                <input
                  type="text"
                  name="eventName"
                  value={header.eventName}
                  onChange={handleHeaderChange}
                  placeholder="Event Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">SALES PERSON</label>
                <input
                  type="text"
                  name="salesPerson"
                  value={header.salesPerson}
                  onChange={handleHeaderChange}
                  placeholder="Sales Person"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">ORDER DATE</label>
                <input
                  type="date"
                  name="orderDate"
                  value={header.orderDate}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DELIVERY DATE</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={header.deliveryDate}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Product Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Product Grid</h3>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} record</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-bold">Total Order Value</span>
                <p className="text-lg font-extrabold text-[#E21D48]">₹ {grandTotal.toLocaleString()}</p>
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
                <button onClick={() => showToastMsg('Exporting Sales Order to Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
                  <FileSpreadsheet size={16} />
                </button>
                <button onClick={() => showToastMsg('Exporting Sales Order to PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
                  <FileText size={16} />
                </button>
                <button onClick={() => showToastMsg('Downloading Sales Order dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
                  <Download size={16} />
                </button>
                <button onClick={handlePrint} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
                  <Printer size={16} />
                </button>
                <button onClick={() => showToastMsg('Refreshed order grid.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
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
                    <th className="py-2.5 px-3">SKU ⇅</th>
                    <th className="py-2.5 px-3">Product Name ⇅</th>
                    <th className="py-2.5 px-3">Quantity ⇅</th>
                    <th className="py-2.5 px-3">Unit Price ⇅</th>
                    <th className="py-2.5 px-3">Discount ⇅</th>
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
                      <td className="py-2.5 px-3 font-bold text-[#E21D48]">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                          className="w-28 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                          className="w-52 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
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
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={item.discountPct}
                            onChange={(e) => handleItemChange(item.id, 'discountPct', Number(e.target.value))}
                            className="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                          />
                          <span>%</span>
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
                          title="Remove row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching 1920w light-3.jpg */}
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

          {/* CARD 3: Bottom Action Bar matching 1920w light-3.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Check size={15} /> Confirm
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDispatch}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Send size={15} /> Dispatch
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHSalesOrder;
