import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  XCircle,
  Save,
  Send,
  Check,
  X,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const WHPurchaseRequisition = () => {
  const { api, user } = useAuth();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Header State matching Purchase Requisition.jpg
  const initialHeaderState = {
    prNumber: 'PR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    requestDate: new Date().toISOString().split('T')[0],
    department: 'Warehouse Operations',
    requestor: user?.name || 'Rahul Sharma',
    costCenter: 'CC-WH-01',
    projectName: 'Diwali Corporate Procurement 2026',
    status: 'Pending Approval'
  };

  const [header, setHeader] = useState(initialHeaderState);

  // Item Grid State matching Purchase Requisition.jpg
  const initialItemsState = [
    { id: '1', sku: 'BTL-001', productName: 'Copper Bottle 750ml', currentStock: 12, requiredQty: 200, uom: 'Nos', expectedDate: '2026-07-10', remarks: 'Diwali Hamper' },
    { id: '2', sku: 'DRY-014', name: 'A5 Hardbound Diary', productName: 'A5 Hardbound Diary', currentStock: 8, requiredQty: 300, uom: 'Nos', expectedDate: '2026-07-12', remarks: 'Welcome Kit' }
  ];

  const [items, setItems] = useState(initialItemsState);

  // List of existing PRs for table view
  const [prList, setPrList] = useState([
    { id: 'PR-2026-8841', requestor: 'Rahul Sharma', department: 'Warehouse Ops', itemsCount: 2, date: '2026-08-25', status: 'Pending Approval' },
    { id: 'PR-2026-8840', requestor: 'Priya Verma', department: 'Procurement', itemsCount: 4, date: '2026-08-23', status: 'Approved' },
    { id: 'PR-2026-8839', requestor: 'Ankit Mehta', department: 'Logistics', itemsCount: 1, date: '2026-08-20', status: 'Converted to PO' },
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      sku: 'SPK-022',
      productName: 'Bluetooth Speaker Mini',
      currentStock: 3,
      requiredQty: 100,
      uom: 'Nos',
      expectedDate: new Date().toISOString().split('T')[0],
      remarks: 'Restock Alert'
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('New item added to requisition grid.');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
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

  // Actions
  const handleSave = () => {
    showToastMsg(`Draft Purchase Requisition "${header.prNumber}" saved successfully!`);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      showToastMsg('Please add at least 1 item to the requisition grid!', 'error');
      return;
    }
    setHeader(prev => ({ ...prev, status: 'Pending Approval' }));
    
    // Add to list
    const newPr = {
      id: header.prNumber,
      requestor: header.requestor,
      department: header.department,
      itemsCount: items.length,
      date: header.requestDate,
      status: 'Pending Approval'
    };
    setPrList(prev => [newPr, ...prev]);

    showToastMsg(`Purchase Requisition "${header.prNumber}" submitted for Approval!`);
  };

  const handleApprove = () => {
    setHeader(prev => ({ ...prev, status: 'Approved' }));
    showToastMsg(`Purchase Requisition "${header.prNumber}" APPROVED! Converted to PO pipeline.`);
  };

  const handleReject = () => {
    setHeader(prev => ({ ...prev, status: 'Rejected' }));
    showToastMsg(`Purchase Requisition "${header.prNumber}" REJECTED.`, 'error');
  };

  const handlePrint = () => {
    showToastMsg(`Generating printable format for ${header.prNumber}...`);
    window.print();
  };

  const filteredItems = items.filter(i =>
    i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.remarks.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Top Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Requisition</h1>
          <p className="text-sm text-slate-500 mt-0.5">Raise internal requests for procurement.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <FileText size={16} />}
            {viewMode === 'form' ? 'View All Requisitions' : 'New Requisition Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Requisitions Registry Table View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Purchase Requisitions Registry ({prList.length})</h3>
            <button
              onClick={() => {
                setHeader({
                  ...initialHeaderState,
                  prNumber: 'PR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Requisition
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">PR NUMBER</th>
                  <th className="pb-3 px-3">REQUESTOR</th>
                  <th className="pb-3 px-3">DEPARTMENT</th>
                  <th className="pb-3 px-3">ITEMS</th>
                  <th className="pb-3 px-3">DATE</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {prList.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{pr.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{pr.requestor}</td>
                    <td className="py-3.5 px-3 text-slate-500">{pr.department}</td>
                    <td className="py-3.5 px-3 text-slate-700">{pr.itemsCount} items</td>
                    <td className="py-3.5 px-3 text-slate-500">{pr.date}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        pr.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        pr.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching Purchase Requisition.jpg */
        <div className="space-y-6">

          {/* CARD 1: Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Header</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                header.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                header.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {header.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PR NUMBER</label>
                <input
                  type="text"
                  name="prNumber"
                  value={header.prNumber}
                  onChange={handleHeaderChange}
                  placeholder="PR Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">REQUEST DATE</label>
                <input
                  type="date"
                  name="requestDate"
                  value={header.requestDate}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DEPARTMENT</label>
                <input
                  type="text"
                  name="department"
                  value={header.department}
                  onChange={handleHeaderChange}
                  placeholder="Department"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">REQUESTOR</label>
                <input
                  type="text"
                  name="requestor"
                  value={header.requestor}
                  onChange={handleHeaderChange}
                  placeholder="Requestor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">COST CENTER</label>
                <input
                  type="text"
                  name="costCenter"
                  value={header.costCenter}
                  onChange={handleHeaderChange}
                  placeholder="Cost Center"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  name="projectName"
                  value={header.projectName}
                  onChange={handleHeaderChange}
                  placeholder="Project Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Item Grid Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Item Grid</h3>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} records</p>
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
                <button onClick={handlePrint} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
                  <Printer size={16} />
                </button>
                <button onClick={() => showToastMsg('Refreshed data.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
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
                    <th className="py-2.5 px-3">Current Stock ⇅</th>
                    <th className="py-2.5 px-3">Required Qty ⇅</th>
                    <th className="py-2.5 px-3">UOM ⇅</th>
                    <th className="py-2.5 px-3">Expected Date ⇅</th>
                    <th className="py-2.5 px-3">Remarks ⇅</th>
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
                          value={item.productName}
                          onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                          className="w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">
                        <input
                          type="number"
                          value={item.currentStock}
                          onChange={(e) => handleItemChange(item.id, 'currentStock', Number(e.target.value))}
                          className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none text-slate-700"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <input
                          type="number"
                          value={item.requiredQty}
                          onChange={(e) => handleItemChange(item.id, 'requiredQty', Number(e.target.value))}
                          className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <input
                          type="text"
                          value={item.uom}
                          onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)}
                          className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <input
                          type="date"
                          value={item.expectedDate}
                          onChange={(e) => handleItemChange(item.id, 'expectedDate', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                          className="w-36 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
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

            {/* Pagination Controls matching Purchase Requisition.jpg */}
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

          {/* CARD 3: Bottom Action Bar matching Purchase Requisition.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Send size={15} /> Submit
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50/50 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Check size={15} /> Approve
            </button>
            <button
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHPurchaseRequisition;
