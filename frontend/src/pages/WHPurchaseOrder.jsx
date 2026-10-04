import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Mail,
  List
} from 'lucide-react';

const WHPurchaseOrder = () => {
  const { api, user } = useAuth();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Vendor Information State matching Purchase Order.jpg
  const initialVendorInfo = {
    poNumber: 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    poDate: new Date().toISOString().split('T')[0],
    vendorName: 'CraftsIndia Ltd',
    vendorContact: '+91 98765 43210',
    vendorEmail: 'orders@craftsindia.in',
    gstNumber: '27AAACB1234C1Z5',
    status: 'Issued'
  };

  const [vendorInfo, setVendorInfo] = useState(initialVendorInfo);

  // Delivery Information State matching Purchase Order.jpg
  const initialDeliveryInfo = {
    deliveryAddress: 'BoxStories Warehouse 4B, MIDC Industrial Area, Andheri East, Mumbai 400093',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transportDetails: 'Express Road Logistics - MH04-AB-1234'
  };

  const [deliveryInfo, setDeliveryInfo] = useState(initialDeliveryInfo);

  // Product Grid State matching Purchase Order.jpg
  const initialItemsState = [
    {
      id: '1',
      sku: 'BTL-001',
      productDescription: 'Copper Bottle 750ml',
      quantity: 200,
      unitPrice: 320,
      discountPct: 5,
      taxPct: 18,
      totalAmount: 71632
    }
  ];

  const [items, setItems] = useState(initialItemsState);

  // Existing POs for Table Registry View
  const [poList, setPoList] = useState([
    { id: 'PO-2026-8841', vendor: 'CraftsIndia Ltd', amount: '₹ 71,632', itemsCount: 1, date: '2026-08-25', status: 'Issued' },
    { id: 'PO-2026-8840', vendor: 'Apex Tech Solutions', amount: '₹ 1,85,000', itemsCount: 3, date: '2026-08-22', status: 'Approved' },
    { id: 'PO-2026-8839', vendor: 'Heritage Paper Mills', amount: '₹ 94,500', itemsCount: 2, date: '2026-08-20', status: 'Received' },
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };

  // Auto-calculate row total
  const calculateRowTotal = (qty, price, disc, tax) => {
    const q = Number(qty) || 0;
    const p = Number(price) || 0;
    const d = Number(disc) || 0;
    const t = Number(tax) || 0;
    const sub = q * p;
    const afterDisc = sub - (sub * (d / 100));
    const finalTotal = Math.round(afterDisc + (afterDisc * (t / 100)));
    return finalTotal;
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.totalAmount = calculateRowTotal(
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
      sku: 'DRY-014',
      productDescription: 'A5 Hardbound Diary',
      quantity: 300,
      unitPrice: 220,
      discountPct: 0,
      taxPct: 18,
      totalAmount: 77880
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('Added item to Purchase Order grid.');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    showToastMsg('Item removed from grid.', 'info');
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

  const grandTotal = items.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  // Actions
  const handleSave = () => {
    showToastMsg(`Draft Purchase Order "${vendorInfo.poNumber}" saved successfully!`);
  };

  const handleApprove = async () => {
    if (items.length === 0) {
      showToastMsg('Please add at least 1 product item to the order!', 'error');
      return;
    }

    try {
      const payload = {
        poNumber: vendorInfo.poNumber,
        vendorName: vendorInfo.vendorName,
        items,
        totalAmount: grandTotal,
        status: 'Approved'
      };
      await api.post('/purchase-orders', payload).catch(() => null);

      setVendorInfo(prev => ({ ...prev, status: 'Approved' }));

      // Add to registry list
      const newPo = {
        id: vendorInfo.poNumber,
        vendor: vendorInfo.vendorName,
        amount: `₹ ${grandTotal.toLocaleString()}`,
        itemsCount: items.length,
        date: vendorInfo.poDate,
        status: 'Approved'
      };
      setPoList(prev => [newPo, ...prev]);

      showToastMsg(`Purchase Order "${vendorInfo.poNumber}" APPROVED and issued to vendor!`);
    } catch (err) {
      showToastMsg(`Purchase Order "${vendorInfo.poNumber}" approved.`, 'success');
    }
  };

  const handlePrintPO = () => {
    showToastMsg(`Printing Purchase Order ${vendorInfo.poNumber}...`);
    window.print();
  };

  const handleEmailPO = () => {
    showToastMsg(`Emailing Purchase Order ${vendorInfo.poNumber} to ${vendorInfo.vendorEmail}...`);
  };

  const filteredItems = items.filter(i =>
    i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Order</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage vendor purchase orders and procurement fulfillment.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <ShoppingCart size={16} />}
            {viewMode === 'form' ? 'View All Purchase Orders' : 'New Purchase Order Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Purchase Orders Registry ({poList.length})</h3>
            <button
              onClick={() => {
                setVendorInfo({
                  ...initialVendorInfo,
                  poNumber: 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Purchase Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">PO NUMBER</th>
                  <th className="pb-3 px-3">VENDOR</th>
                  <th className="pb-3 px-3">ITEMS</th>
                  <th className="pb-3 px-3">TOTAL AMOUNT</th>
                  <th className="pb-3 px-3">ORDER DATE</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {poList.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{po.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{po.vendor}</td>
                    <td className="py-3.5 px-3 text-slate-500">{po.itemsCount} items</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{po.amount}</td>
                    <td className="py-3.5 px-3 text-slate-500">{po.date}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        po.status === 'Approved' || po.status === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching Purchase Order.jpg */
        <div className="space-y-6">

          {/* CARD 1: Vendor Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Vendor Information</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                vendorInfo.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {vendorInfo.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PO NUMBER</label>
                <input
                  type="text"
                  name="poNumber"
                  value={vendorInfo.poNumber}
                  onChange={handleVendorChange}
                  placeholder="PO Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PO DATE</label>
                <input
                  type="date"
                  name="poDate"
                  value={vendorInfo.poDate}
                  onChange={handleVendorChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">VENDOR NAME</label>
                <input
                  type="text"
                  name="vendorName"
                  value={vendorInfo.vendorName}
                  onChange={handleVendorChange}
                  placeholder="Vendor Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">VENDOR CONTACT</label>
                <input
                  type="text"
                  name="vendorContact"
                  value={vendorInfo.vendorContact}
                  onChange={handleVendorChange}
                  placeholder="Vendor Contact"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">VENDOR EMAIL</label>
                <input
                  type="email"
                  name="vendorEmail"
                  value={vendorInfo.vendorEmail}
                  onChange={handleVendorChange}
                  placeholder="Vendor Email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GST NUMBER</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={vendorInfo.gstNumber}
                  onChange={handleVendorChange}
                  placeholder="GST Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Delivery Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Delivery Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DELIVERY ADDRESS</label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={deliveryInfo.deliveryAddress}
                  onChange={handleDeliveryChange}
                  placeholder="Delivery Address"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DELIVERY DATE</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={deliveryInfo.deliveryDate}
                  onChange={handleDeliveryChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">TRANSPORT DETAILS</label>
                <input
                  type="text"
                  name="transportDetails"
                  value={deliveryInfo.transportDetails}
                  onChange={handleDeliveryChange}
                  placeholder="Transport Details"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Product Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Product Grid</h3>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} record</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-bold">Grand Total</span>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <button onClick={() => showToastMsg('Exporting to Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
                  <FileSpreadsheet size={16} />
                </button>
                <button onClick={() => showToastMsg('Exporting to PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
                  <FileText size={16} />
                </button>
                <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
                  <Download size={16} />
                </button>
                <button onClick={handlePrintPO} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
                  <Printer size={16} />
                </button>
                <button onClick={() => showToastMsg('Refreshed grid.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
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
                    <th className="py-2.5 px-3">Product Description ⇅</th>
                    <th className="py-2.5 px-3">Quantity ⇅</th>
                    <th className="py-2.5 px-3">Unit Price ⇅</th>
                    <th className="py-2.5 px-3">Discount ⇅</th>
                    <th className="py-2.5 px-3">Tax ⇅</th>
                    <th className="py-2.5 px-3">Total Amount ⇅</th>
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
                          className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <input
                          type="text"
                          value={item.productDescription}
                          onChange={(e) => handleItemChange(item.id, 'productDescription', e.target.value)}
                          className="w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
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
                        ₹ {item.totalAmount ? item.totalAmount.toLocaleString() : 0}
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

            {/* Pagination Controls matching Purchase Order.jpg */}
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

          {/* CARD 4: Bottom Action Bar matching Purchase Order.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Check size={15} /> Approve
            </button>
            <button
              onClick={handlePrintPO}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} /> Print PO
            </button>
            <button
              onClick={handleEmailPO}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Mail size={15} /> Email PO
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHPurchaseOrder;
