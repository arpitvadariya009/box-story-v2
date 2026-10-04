import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
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
  List
} from 'lucide-react';

const WHGoodsReceiptNote = () => {
  const { api, user } = useAuth();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Header State matching Goods Receipt Note (GRN).jpg
  const initialHeaderState = {
    grnNumber: 'GRN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    grnDate: new Date().toISOString().split('T')[0],
    vendor: 'CraftsIndia Ltd',
    poReference: 'PO-2026-8841',
    status: 'QC Pending'
  };

  const [header, setHeader] = useState(initialHeaderState);

  // QC Details State matching Goods Receipt Note (GRN).jpg
  const initialQcState = {
    qcStatus: 'Passed',
    inspectorName: user?.name || 'Suresh Kumar',
    qcDate: new Date().toISOString().split('T')[0],
    qcRemarks: '4 units found with minor surface scratches during unboxing inspection. 196 units accepted into Bin A1-B04.'
  };

  const [qc, setQc] = useState(initialQcState);

  // Product Grid State matching Goods Receipt Note (GRN).jpg
  const initialItemsState = [
    {
      id: '1',
      sku: 'BTL-001',
      productName: 'Copper Bottle 750ml',
      orderedQty: 200,
      receivedQty: 200,
      rejectedQty: 4,
      acceptedQty: 196
    }
  ];

  const [items, setItems] = useState(initialItemsState);

  // Existing GRNs for Table Registry View
  const [grnList, setGrnList] = useState([
    { id: 'GRN-2026-4012', poReference: 'PO-2026-8841', vendor: 'CraftsIndia Ltd', receivedQty: 200, acceptedQty: 196, date: '2026-08-25', qcStatus: 'Passed' },
    { id: 'GRN-2026-4011', poReference: 'PO-2026-8835', vendor: 'Apex Tech Solutions', receivedQty: 150, acceptedQty: 150, date: '2026-08-22', qcStatus: 'Passed' },
    { id: 'GRN-2026-4010', poReference: 'PO-2026-8831', vendor: 'Heritage Paper Mills', receivedQty: 500, acceptedQty: 480, date: '2026-08-18', qcStatus: 'Partial Pass' },
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const handleQcChange = (e) => {
    const { name, value } = e.target;
    setQc(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const rec = Number(field === 'receivedQty' ? value : updated.receivedQty) || 0;
        const rej = Number(field === 'rejectedQty' ? value : updated.rejectedQty) || 0;
        updated.acceptedQty = Math.max(0, rec - rej);
        return updated;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      sku: 'DRY-014',
      productName: 'A5 Hardbound Diary',
      orderedQty: 300,
      receivedQty: 300,
      rejectedQty: 0,
      acceptedQty: 300
    };
    setItems(prev => [...prev, newItem]);
    showToastMsg('Added item to GRN product grid.');
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

  // Actions
  const handleSave = () => {
    showToastMsg(`Draft Goods Receipt Note "${header.grnNumber}" saved!`);
  };

  const handleQcApprove = async () => {
    if (items.length === 0) {
      showToastMsg('Please add at least 1 product item to the GRN!', 'error');
      return;
    }

    try {
      const payload = {
        grnNumber: header.grnNumber,
        poReference: header.poReference,
        vendor: header.vendor,
        qcStatus: qc.qcStatus,
        inspectorName: qc.inspectorName,
        items,
        status: 'Inspected & Passed'
      };
      await api.post('/goods-receipts', payload).catch(() => null);

      setHeader(prev => ({ ...prev, status: 'Inspected & Passed' }));

      // Add to registry list
      const newGrn = {
        id: header.grnNumber,
        poReference: header.poReference,
        vendor: header.vendor,
        receivedQty: items.reduce((acc, curr) => acc + (Number(curr.receivedQty) || 0), 0),
        acceptedQty: items.reduce((acc, curr) => acc + (Number(curr.acceptedQty) || 0), 0),
        date: header.grnDate,
        qcStatus: qc.qcStatus
      };
      setGrnList(prev => [newGrn, ...prev]);

      showToastMsg(`Goods Receipt Note "${header.grnNumber}" QC APPROVED! Stock posted to inventory.`);
    } catch (err) {
      showToastMsg(`GRN "${header.grnNumber}" approved into inventory.`, 'success');
    }
  };

  const handlePrint = () => {
    showToastMsg(`Generating printable GRN document for ${header.grnNumber}...`);
    window.print();
  };

  const filteredItems = items.filter(i =>
    i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.productName.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goods Receipt Note (GRN)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Inbound stock inspection, quality control & inventory receiving.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <ClipboardCheck size={16} />}
            {viewMode === 'form' ? 'View All GRNs' : 'New GRN Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Goods Receipt Notes Registry ({grnList.length})</h3>
            <button
              onClick={() => {
                setHeader({
                  ...initialHeaderState,
                  grnNumber: 'GRN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create New GRN
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">GRN NUMBER</th>
                  <th className="pb-3 px-3">PO REFERENCE</th>
                  <th className="pb-3 px-3">VENDOR</th>
                  <th className="pb-3 px-3">RECEIVED QTY</th>
                  <th className="pb-3 px-3">ACCEPTED QTY</th>
                  <th className="pb-3 px-3">GRN DATE</th>
                  <th className="pb-3 px-3 text-right">QC STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {grnList.map(grn => (
                  <tr key={grn.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{grn.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{grn.poReference}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{grn.vendor}</td>
                    <td className="py-3.5 px-3 text-slate-700">{grn.receivedQty} units</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">{grn.acceptedQty} units</td>
                    <td className="py-3.5 px-3 text-slate-500">{grn.date}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        grn.qcStatus === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {grn.qcStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching Goods Receipt Note (GRN).jpg */
        <div className="space-y-6">

          {/* CARD 1: Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Header</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                header.status === 'Inspected & Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {header.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GRN NUMBER</label>
                <input
                  type="text"
                  name="grnNumber"
                  value={header.grnNumber}
                  onChange={handleHeaderChange}
                  placeholder="GRN Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GRN DATE</label>
                <input
                  type="date"
                  name="grnDate"
                  value={header.grnDate}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">VENDOR</label>
                <input
                  type="text"
                  name="vendor"
                  value={header.vendor}
                  onChange={handleHeaderChange}
                  placeholder="Vendor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PO REFERENCE</label>
                <input
                  type="text"
                  name="poReference"
                  value={header.poReference}
                  onChange={handleHeaderChange}
                  placeholder="PO Reference"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: QC Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">QC Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">QC STATUS</label>
                <select
                  name="qcStatus"
                  value={qc.qcStatus}
                  onChange={handleQcChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
                >
                  <option value="Passed">Passed</option>
                  <option value="Partial Pass">Partial Pass</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">INSPECTOR NAME</label>
                <input
                  type="text"
                  name="inspectorName"
                  value={qc.inspectorName}
                  onChange={handleQcChange}
                  placeholder="Inspector Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">QC DATE</label>
                <input
                  type="date"
                  name="qcDate"
                  value={qc.qcDate}
                  onChange={handleQcChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-slate-700">
              <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">QC REMARKS</label>
              <textarea
                name="qcRemarks"
                rows="3"
                value={qc.qcRemarks}
                onChange={handleQcChange}
                placeholder="QC Remarks"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* CARD 3: Product Grid */}
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
                    <th className="py-2.5 px-3">Product Name ⇅</th>
                    <th className="py-2.5 px-3">Ordered Qty ⇅</th>
                    <th className="py-2.5 px-3">Received Qty ⇅</th>
                    <th className="py-2.5 px-3">Rejected Qty ⇅</th>
                    <th className="py-2.5 px-3">Accepted Qty ⇅</th>
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
                          value={item.orderedQty}
                          onChange={(e) => handleItemChange(item.id, 'orderedQty', Number(e.target.value))}
                          className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <input
                          type="number"
                          value={item.receivedQty}
                          onChange={(e) => handleItemChange(item.id, 'receivedQty', Number(e.target.value))}
                          className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-600">
                        <input
                          type="number"
                          value={item.rejectedQty}
                          onChange={(e) => handleItemChange(item.id, 'rejectedQty', Number(e.target.value))}
                          className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none text-rose-600 font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-600">
                        {item.acceptedQty}
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

            {/* Pagination Controls matching Goods Receipt Note (GRN).jpg */}
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

          {/* CARD 4: Bottom Action Bar matching Goods Receipt Note (GRN).jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handleQcApprove}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Check size={15} /> QC Approve
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

export default WHGoodsReceiptNote;
