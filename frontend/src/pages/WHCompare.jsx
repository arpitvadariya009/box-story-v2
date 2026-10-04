import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Columns,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WHCompare = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Product Comparison List matching 1920w light-15.jpg
  const [compareItems, setCompareItems] = useState([
    {
      id: '1',
      productName: 'Copper Bottle 750ml',
      category: 'Drinkware',
      brandingMethod: 'UV / Laser',
      moq: 50,
      leadTime: '10 days',
      cost: 320,
      margin: '32%'
    },
    {
      id: '2',
      productName: 'A5 Hardbound Diary',
      category: 'Stationery',
      brandingMethod: 'Foiling',
      moq: 100,
      leadTime: '12 days',
      cost: 280,
      margin: '28%'
    },
    {
      id: '3',
      productName: 'Bluetooth Speaker Mini',
      category: 'Tech',
      brandingMethod: 'UV',
      moq: 25,
      leadTime: '15 days',
      cost: 1890,
      margin: '22%'
    }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddProduct = () => {
    const newItem = {
      id: Date.now().toString(),
      productName: 'Ceramic Mug 320ml',
      category: 'Drinkware',
      brandingMethod: 'Screen Printing',
      moq: 75,
      leadTime: '7 days',
      cost: 190,
      margin: '35%'
    };
    setCompareItems(prev => [...prev, newItem]);
    showToastMsg('Added Ceramic Mug to comparison list.');
  };

  const handleDeleteItem = (id) => {
    setCompareItems(prev => prev.filter(item => item.id !== id));
    showToastMsg('Product removed from comparison.', 'info');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(compareItems.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredItems = compareItems.filter(item =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brandingMethod.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Sub-nav Pill Tabs matching 1920w light-15.jpg */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/wh-catalog')}
          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors"
        >
          Catalog
        </button>
        <button
          onClick={() => navigate('/wh-product-detail')}
          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors"
        >
          Product Detail
        </button>
        <button className="px-4 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-full shadow-sm">
          Compare
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Comparison</h1>
        <p className="text-sm text-slate-500 mt-0.5">Side-by-side comparison for sourcing decisions.</p>
      </div>

      {/* Main Full-Width Grid Table Card matching 1920w light-15.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">

        {/* Toolbar matching 1920w light-15.jpg */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
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
            <button onClick={() => showToastMsg('Exporting Comparison Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Export Excel">
              <FileSpreadsheet size={16} />
            </button>
            <button onClick={() => showToastMsg('Exporting Comparison PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Export PDF">
              <FileText size={16} />
            </button>
            <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Download">
              <Download size={16} />
            </button>
            <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Print">
              <Printer size={16} />
            </button>
            <button onClick={() => showToastMsg('Refreshed comparison matrix.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Fullscreen">
              <Maximize2 size={16} />
            </button>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors ml-2"
            >
              <Plus size={14} /> Add New
            </button>
          </div>
        </div>

        {/* Table matching 1920w light-15.jpg */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === compareItems.length && compareItems.length > 0}
                    className="rounded text-[#E21D48] focus:ring-rose-500"
                  />
                </th>
                <th className="py-2.5 px-3">Product Name ⇅</th>
                <th className="py-2.5 px-3">Category ⇅</th>
                <th className="py-2.5 px-3">Branding Method ⇅</th>
                <th className="py-2.5 px-3">MOQ ⇅</th>
                <th className="py-2.5 px-3">Lead Time ⇅</th>
                <th className="py-2.5 px-3">Cost ⇅</th>
                <th className="py-2.5 px-3">Margin ⇅</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="rounded text-[#E21D48] focus:ring-rose-500"
                    />
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-3 px-3 text-slate-700">{item.category}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{item.brandingMethod}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{item.moq}</td>
                  <td className="py-3 px-3 text-slate-600">{item.leadTime}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹ {item.cost.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{item.margin}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls matching 1920w light-15.jpg */}
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
    </div>
  );
};

export default WHCompare;
