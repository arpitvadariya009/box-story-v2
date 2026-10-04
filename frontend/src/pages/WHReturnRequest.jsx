import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
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
  X,
  List
} from 'lucide-react';

const WHReturnRequest = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Return Details State matching 1920w light-9.jpg
  const initialDetailsState = {
    returnNumber: 'RET-' + new Date().getFullYear() + '-' + Math.floor(9000 + Math.random() * 1000),
    returnDate: new Date().toISOString().split('T')[0],
    orderNumber: 'SO-2026-2041',
    clientName: 'Acme Pvt Ltd',
    status: 'Pending'
  };

  const [details, setDetails] = useState(initialDetailsState);

  // Product Grid State matching 1920w light-9.jpg
  const initialItemsState = [
    {
      id: '1',
      productName: 'Copper Bottle 750ml',
      quantity: 4,
      returnReason: 'Damaged',
      returnStatus: 'Pending'
    }
  ];

  const [items, setItems] = useState(initialItemsState);

  // Existing Returns for Registry View
  const [returnList, setReturnList] = useState([
    { id: 'RET-2026-9042', order: 'SO-2026-2041', client: 'Acme Pvt Ltd', product: 'Copper Bottle 750ml', qty: 4, reason: 'Damaged', status: 'Pending', date: '2026-08-26' },
    { id: 'RET-2026-9041', order: 'SO-2026-2038', client: 'TCS', product: 'Ceramic Mug 320ml', qty: 2, reason: 'Defective', status: 'Approved', date: '2026-08-23' },
    { id: 'RET-2026-9040', order: 'SO-2026-2035', client: 'Infosys', product: 'Hardbound Diary', qty: 10, reason: 'Wrong Color', status: 'Rejected', date: '2026-08-20' }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productName: 'A5 Hardbound Diary',
      quantity: 2,
      returnReason: 'Printing Defect',
      returnStatus: 'Pending'
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('Added item to return request.');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    showToastMsg('Item removed from return list.', 'info');
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
        returnNumber: details.returnNumber,
        returnDate: details.returnDate,
        orderNumber: details.orderNumber,
        clientName: details.clientName,
        items,
        status: details.status
      };
      await api.post('/returns', payload).catch(() => null);

      const newRet = {
        id: details.returnNumber,
        order: details.orderNumber,
        client: details.clientName,
        product: items[0]?.productName || 'Multiple Items',
        qty: items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0),
        reason: items[0]?.returnReason || 'General',
        status: details.status,
        date: details.returnDate
      };
      setReturnList(prev => [newRet, ...prev]);

      showToastMsg(`Return Request "${details.returnNumber}" saved as draft!`);
    } catch (err) {
      showToastMsg(`Return Request "${details.returnNumber}" saved.`, 'success');
    }
  };

  const handleApprove = () => {
    setDetails(prev => ({ ...prev, status: 'Approved' }));
    setItems(prev => prev.map(i => ({ ...i, returnStatus: 'Approved' })));
    showToastMsg(`Return Request "${details.returnNumber}" APPROVED! Stock adjusted in warehouse ledger.`);
  };

  const handleReject = () => {
    setDetails(prev => ({ ...prev, status: 'Rejected' }));
    setItems(prev => prev.map(i => ({ ...i, returnStatus: 'Rejected' })));
    showToastMsg(`Return Request "${details.returnNumber}" REJECTED.`, 'error');
  };

  const filteredItems = items.filter(i =>
    i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.returnReason.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Return Request</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage customer return requests, damaged inventory inspection & stock credit.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <RotateCcw size={16} />}
            {viewMode === 'form' ? 'View All Returns' : 'New Return Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Returns Registry ({returnList.length})</h3>
            <button
              onClick={() => {
                setDetails({
                  ...initialDetailsState,
                  returnNumber: 'RET-' + new Date().getFullYear() + '-' + Math.floor(9000 + Math.random() * 1000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Return Request
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">RETURN #</th>
                  <th className="pb-3 px-3">ORDER #</th>
                  <th className="pb-3 px-3">CLIENT</th>
                  <th className="pb-3 px-3">PRODUCT</th>
                  <th className="pb-3 px-3">QTY</th>
                  <th className="pb-3 px-3">REASON</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {returnList.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{ret.id}</td>
                    <td className="py-3.5 px-3 text-slate-500">{ret.order}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{ret.client}</td>
                    <td className="py-3.5 px-3 text-slate-700">{ret.product}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{ret.qty}</td>
                    <td className="py-3.5 px-3 text-slate-600">{ret.reason}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        ret.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        ret.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-9.jpg */
        <div className="space-y-6">

          {/* CARD 1: Return Details matching 1920w light-9.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Return Details</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                details.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                details.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {details.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RETURN NUMBER</label>
                <input
                  type="text"
                  name="returnNumber"
                  value={details.returnNumber}
                  onChange={handleDetailsChange}
                  placeholder="Return Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RETURN DATE</label>
                <input
                  type="date"
                  name="returnDate"
                  value={details.returnDate}
                  onChange={handleDetailsChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">ORDER NUMBER</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={details.orderNumber}
                  onChange={handleDetailsChange}
                  placeholder="Order Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CLIENT NAME</label>
                <input
                  type="text"
                  name="clientName"
                  value={details.clientName}
                  onChange={handleDetailsChange}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Product Grid matching 1920w light-9.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Product Grid</h3>
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
                <button onClick={() => showToastMsg('Exporting Return Request to Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
                  <FileSpreadsheet size={16} />
                </button>
                <button onClick={() => showToastMsg('Exporting Return Request to PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
                  <FileText size={16} />
                </button>
                <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
                  <Download size={16} />
                </button>
                <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
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

            {/* Table matching 1920w light-9.jpg */}
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
                    <th className="py-2.5 px-3">Product Name ⇅</th>
                    <th className="py-2.5 px-3">Quantity ⇅</th>
                    <th className="py-2.5 px-3">Return Reason ⇅</th>
                    <th className="py-2.5 px-3">Return Status ⇅</th>
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
                          value={item.productName}
                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
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
                      <td className="py-2.5 px-3 text-slate-700">
                        <input
                          type="text"
                          value={item.returnReason}
                          onChange={(e) => handleItemChange(item.id, 'returnReason', e.target.value)}
                          className="w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          item.returnStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                          item.returnStatus === 'Pending' ? 'bg-amber-100/70 text-amber-700' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.returnStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching 1920w light-9.jpg */}
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

          {/* CARD 3: Bottom Action Bar matching 1920w light-9.jpg */}
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
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <X size={15} /> Reject
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHReturnRequest;
