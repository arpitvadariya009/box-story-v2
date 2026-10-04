import React, { useState } from 'react';
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
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WHInventoryLevels = () => {
  const { api } = useAuth();
  const [toast, setToast] = useState(null);

  // Level 1: Individual Product Inventory State matching 1920w light-12.jpg
  const [level1, setLevel1] = useState([
    { id: '1', sku: 'Bottle', stock: '1,000' },
    { id: '2', sku: 'Diary', stock: '1,500' },
    { id: '3', sku: 'Speaker', stock: '500' }
  ]);
  const [search1, setSearch1] = useState('');
  const [selected1, setSelected1] = useState([]);

  // Level 2: Packaging Inventory State matching 1920w light-12.jpg
  const [level2, setLevel2] = useState([
    { id: '1', sku: 'Gift Box Large', stock: '300' },
    { id: '2', sku: 'Gift Box Medium', stock: '500' },
    { id: '3', sku: 'Ribbon', stock: '5,000' }
  ]);
  const [search2, setSearch2] = useState('');
  const [selected2, setSelected2] = useState([]);

  // Level 3: Finished Gift Box Inventory State matching 1920w light-12.jpg
  const [level3, setLevel3] = useState([
    { id: '1', sku: 'Diwali Hamper', stock: '200' },
    { id: '2', sku: 'Welcome Kit', stock: '150' }
  ]);
  const [search3, setSearch3] = useState('');
  const [selected3, setSelected3] = useState([]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Add Item Handlers
  const handleAddLevel1 = () => {
    const newItem = { id: Date.now().toString(), sku: 'Mug Ceramic', stock: '450' };
    setLevel1(prev => [...prev, newItem]);
    showToastMsg('Added Level 1 product inventory item.');
  };

  const handleAddLevel2 = () => {
    const newItem = { id: Date.now().toString(), sku: 'Crinkle Paper Gold', stock: '2,500' };
    setLevel2(prev => [...prev, newItem]);
    showToastMsg('Added Level 2 packaging inventory item.');
  };

  const handleAddLevel3 = () => {
    const newItem = { id: Date.now().toString(), sku: 'Executive Tech Hamper', stock: '80' };
    setLevel3(prev => [...prev, newItem]);
    showToastMsg('Added Level 3 finished gift box inventory item.');
  };

  // Remove Item Handlers
  const handleDeleteLevel1 = (id) => {
    setLevel1(prev => prev.filter(i => i.id !== id));
    showToastMsg('Removed Level 1 product item.', 'info');
  };

  const handleDeleteLevel2 = (id) => {
    setLevel2(prev => prev.filter(i => i.id !== id));
    showToastMsg('Removed Level 2 packaging item.', 'info');
  };

  const handleDeleteLevel3 = (id) => {
    setLevel3(prev => prev.filter(i => i.id !== id));
    showToastMsg('Removed Level 3 finished box item.', 'info');
  };

  const filtered1 = level1.filter(i => i.sku.toLowerCase().includes(search1.toLowerCase()));
  const filtered2 = level2.filter(i => i.sku.toLowerCase().includes(search2.toLowerCase()));
  const filtered3 = level3.filter(i => i.sku.toLowerCase().includes(search3.toLowerCase()));

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Levels</h1>
        <p className="text-sm text-slate-500 mt-0.5">Instead of maintaining stock only at the gift-box level, maintain inventory at three tiers.</p>
      </div>

      {/* CARD 1: Level 1 — Individual Product Inventory matching 1920w light-12.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Level 1 — Individual Product Inventory</h3>
          <p className="text-xs text-slate-400 mt-0.5">Raw sellable SKUs that can ship standalone or be consumed by a gift box.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={search1}
                onChange={(e) => setSearch1(e.target.value)}
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
            <button onClick={() => showToastMsg('Exporting Level 1 Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={16} /></button>
            <button onClick={() => showToastMsg('Exporting Level 1 PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={16} /></button>
            <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={16} /></button>
            <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={16} /></button>
            <button onClick={() => showToastMsg('Refreshed Level 1 stock.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={16} /></button>
            <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={16} /></button>
            <button
              onClick={handleAddLevel1}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors ml-2"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-2.5 px-3 w-10">
                  <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                </th>
                <th className="py-2.5 px-3">SKU ⇅</th>
                <th className="py-2.5 px-3 text-right">Stock ⇅</th>
                <th className="py-2.5 px-3 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filtered1.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.sku}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.stock}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button onClick={() => handleDeleteLevel1(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-1 gap-3">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
              <option value="10">10</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>Showing <strong>1-{filtered1.length}</strong> of <strong>{filtered1.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;&lt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;</button>
              <span className="px-2 font-medium">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Level 2 — Packaging Inventory matching 1920w light-12.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Level 2 — Packaging Inventory</h3>
          <p className="text-xs text-slate-400 mt-0.5">Boxes, ribbons, inserts and other packaging consumables.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={search2}
                onChange={(e) => setSearch2(e.target.value)}
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
            <button onClick={() => showToastMsg('Exporting Level 2 Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={16} /></button>
            <button onClick={() => showToastMsg('Exporting Level 2 PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={16} /></button>
            <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={16} /></button>
            <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={16} /></button>
            <button onClick={() => showToastMsg('Refreshed Level 2 stock.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={16} /></button>
            <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={16} /></button>
            <button
              onClick={handleAddLevel2}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors ml-2"
            >
              <Plus size={14} /> Add Packaging
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-2.5 px-3 w-10">
                  <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                </th>
                <th className="py-2.5 px-3">SKU ⇅</th>
                <th className="py-2.5 px-3 text-right">Stock ⇅</th>
                <th className="py-2.5 px-3 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filtered2.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.sku}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.stock}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button onClick={() => handleDeleteLevel2(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-1 gap-3">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
              <option value="10">10</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>Showing <strong>1-{filtered2.length}</strong> of <strong>{filtered2.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;&lt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;</button>
              <span className="px-2 font-medium">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Level 3 — Finished Gift Box Inventory matching 1920w light-12.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Level 3 — Finished Gift Box Inventory</h3>
          <p className="text-xs text-slate-400 mt-0.5">Pre-assembled hampers and kits ready for dispatch.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={search3}
                onChange={(e) => setSearch3(e.target.value)}
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
            <button onClick={() => showToastMsg('Exporting Level 3 Excel...')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={16} /></button>
            <button onClick={() => showToastMsg('Exporting Level 3 PDF...')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={16} /></button>
            <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={16} /></button>
            <button onClick={() => window.print()} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={16} /></button>
            <button onClick={() => showToastMsg('Refreshed Level 3 stock.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={16} /></button>
            <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={16} /></button>
            <button
              onClick={handleAddLevel3}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors ml-2"
            >
              <Plus size={14} /> Add Finished Box
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-2.5 px-3 w-10">
                  <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                </th>
                <th className="py-2.5 px-3">SKU ⇅</th>
                <th className="py-2.5 px-3 text-right">Stock ⇅</th>
                <th className="py-2.5 px-3 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filtered3.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <input type="checkbox" className="rounded text-[#E21D48] focus:ring-rose-500" />
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.sku}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.stock}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button onClick={() => handleDeleteLevel3(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-1 gap-3">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
              <option value="10">10</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>Showing <strong>1-{filtered3.length}</strong> of <strong>{filtered3.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;&lt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&lt;</button>
              <span className="px-2 font-medium">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">&gt;&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: This Allows matching 1920w light-12.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">This Allows</h3>
        <p className="text-xs text-slate-400">Business outcomes enabled by the three-tier model.</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80">
            Selling products individually.
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80">
            Selling products as part of a gift box.
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80">
            Creating custom kits from existing inventory.
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80">
            Maintaining accurate stock consumption.
          </span>
        </div>
      </div>
    </div>
  );
};

export default WHInventoryLevels;
