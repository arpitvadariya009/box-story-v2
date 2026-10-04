import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Check,
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
  AlertCircle
} from 'lucide-react';

const WHBrandingMatrix = () => {
  const { api } = useAuth();
  const [toast, setToast] = useState(null);

  // Card 1 State: Supported Branding Methods matching Background-1.jpg
  const [supportedMethods, setSupportedMethods] = useState([
    { id: '1', name: 'UV Printing', active: true },
    { id: '2', name: 'Screen Printing', active: true },
    { id: '3', name: 'Laser Engraving', active: true },
    { id: '4', name: 'Embroidery', active: true },
    { id: '5', name: 'Foiling', active: true }
  ]);

  // Card 2 State: Branding Area Table matching Background-1.jpg
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedAreaRows, setSelectedAreaRows] = useState([]);
  const [brandingAreas, setBrandingAreas] = useState([
    { id: '1', width: '60 mm', height: '20 mm', location: 'Bottle body' },
    { id: '2', width: '120 mm', height: '40 mm', location: 'Diary cover' }
  ]);

  // Card 3 State: Branding Cost Matrix Table matching Background-1.jpg
  const [costSearch, setCostSearch] = useState('');
  const [selectedCostRows, setSelectedCostRows] = useState([]);
  const [costMatrix, setCostMatrix] = useState([
    { id: '1', qtyRange: '1 – 50', cost: 45 },
    { id: '2', qtyRange: '51 – 200', cost: 32 },
    { id: '3', qtyRange: '201 – 500', cost: 24 },
    { id: '4', qtyRange: '500+', cost: 18 }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleMethod = (id) => {
    setSupportedMethods(prev => prev.map(m =>
      m.id === id ? { ...m, active: !m.active } : m
    ));
    showToastMsg('Updated supported branding method posture.');
  };

  // Branding Area Actions
  const handleAddArea = () => {
    const newArea = {
      id: Date.now().toString(),
      width: '80 mm',
      height: '30 mm',
      location: 'Mug Surface'
    };
    setBrandingAreas(prev => [...prev, newArea]);
    showToastMsg('Added new branding area specification.');
  };

  const handleDeleteArea = (id) => {
    setBrandingAreas(prev => prev.filter(a => a.id !== id));
    showToastMsg('Branding area removed.', 'info');
  };

  const handleSelectAllAreas = (e) => {
    if (e.target.checked) {
      setSelectedAreaRows(brandingAreas.map(a => a.id));
    } else {
      setSelectedAreaRows([]);
    }
  };

  const handleSelectAreaRow = (id) => {
    setSelectedAreaRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Cost Matrix Actions
  const handleAddCostTier = () => {
    const newTier = {
      id: Date.now().toString(),
      qtyRange: '1000+',
      cost: 12
    };
    setCostMatrix(prev => [...prev, newTier]);
    showToastMsg('Added new branding cost tier.');
  };

  const handleDeleteCostTier = (id) => {
    setCostMatrix(prev => prev.filter(c => c.id !== id));
    showToastMsg('Cost tier removed.', 'info');
  };

  const handleSelectAllCosts = (e) => {
    if (e.target.checked) {
      setSelectedCostRows(costMatrix.map(c => c.id));
    } else {
      setSelectedCostRows([]);
    }
  };

  const handleSelectCostRow = (id) => {
    setSelectedCostRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAreas = brandingAreas.filter(a =>
    a.location.toLowerCase().includes(areaSearch.toLowerCase()) ||
    a.width.toLowerCase().includes(areaSearch.toLowerCase()) ||
    a.height.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const filteredCosts = costMatrix.filter(c =>
    c.qtyRange.toLowerCase().includes(costSearch.toLowerCase())
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

      {/* Header matching Background-1.jpg */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Branding Matrix</h1>
        <p className="text-sm text-slate-500 mt-0.5">Supported methods, areas and costs per product.</p>
      </div>

      {/* CARD 1: Supported Branding (Top Card) matching Background-1.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Supported Branding</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {supportedMethods.map(m => (
            <button
              key={m.id}
              onClick={() => toggleMethod(m.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                m.active
                  ? 'bg-rose-50/80 text-[#E21D48] border-rose-200 shadow-xs'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Check size={14} className={m.active ? 'text-[#E21D48]' : 'text-slate-300'} />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM 2 CARDS GRID matching Background-1.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 2: Branding Area (Left Card) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Branding Area</h3>
              <p className="text-xs text-slate-400 mt-0.5">{brandingAreas.length} records</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Filter size={13} /> Filter
              </button>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Columns size={13} /> Columns
              </button>
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
              <button onClick={() => showToastMsg('Exporting Branding Area Excel...')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={15} /></button>
              <button onClick={() => showToastMsg('Exporting Branding Area PDF...')} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={15} /></button>
              <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={15} /></button>
              <button onClick={() => window.print()} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={15} /></button>
              <button onClick={() => showToastMsg('Refreshed branding areas.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={15} /></button>
              <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={15} /></button>
              <button
                onClick={handleAddArea}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] ml-1"
              >
                <Plus size={13} /> Add New
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-2 px-2.5 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllAreas}
                      checked={selectedAreaRows.length === brandingAreas.length && brandingAreas.length > 0}
                      className="rounded text-[#E21D48] focus:ring-rose-500"
                    />
                  </th>
                  <th className="py-2 px-2.5">Width ⇅</th>
                  <th className="py-2 px-2.5">Height ⇅</th>
                  <th className="py-2 px-2.5">Location ⇅</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredAreas.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5">
                      <input
                        type="checkbox"
                        checked={selectedAreaRows.includes(a.id)}
                        onChange={() => handleSelectAreaRow(a.id)}
                        className="rounded text-[#E21D48] focus:ring-rose-500"
                      />
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">{a.width}</td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">{a.height}</td>
                    <td className="py-2 px-2.5 font-semibold text-slate-700">{a.location}</td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        onClick={() => handleDeleteArea(a.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Showing <strong>1-{filteredAreas.length}</strong> of <strong>{filteredAreas.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;&lt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;</button>
              <span className="px-1">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;&gt;</button>
            </div>
          </div>
        </div>

        {/* CARD 3: Branding Cost Matrix (Right Card) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Branding Cost Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">{costMatrix.length} records</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={costSearch}
                  onChange={(e) => setCostSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Filter size={13} /> Filter
              </button>
              <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50">
                <Columns size={13} /> Columns
              </button>
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
              <button onClick={() => showToastMsg('Exporting Cost Matrix Excel...')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={15} /></button>
              <button onClick={() => showToastMsg('Exporting Cost Matrix PDF...')} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={15} /></button>
              <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={15} /></button>
              <button onClick={() => window.print()} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={15} /></button>
              <button onClick={() => showToastMsg('Refreshed cost matrix.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={15} /></button>
              <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={15} /></button>
              <button
                onClick={handleAddCostTier}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] ml-1"
              >
                <Plus size={13} /> Add New
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-2 px-2.5 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllCosts}
                      checked={selectedCostRows.length === costMatrix.length && costMatrix.length > 0}
                      className="rounded text-[#E21D48] focus:ring-rose-500"
                    />
                  </th>
                  <th className="py-2 px-2.5">Qty Range ⇅</th>
                  <th className="py-2 px-2.5">Cost ⇅</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCosts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCostRows.includes(c.id)}
                        onChange={() => handleSelectCostRow(c.id)}
                        className="rounded text-[#E21D48] focus:ring-rose-500"
                      />
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">{c.qtyRange}</td>
                    <td className="py-2 px-2.5 font-extrabold text-[#E21D48]">
                      ₹ {c.cost}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        onClick={() => handleDeleteCostTier(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Showing <strong>1-{filteredCosts.length}</strong> of <strong>{filteredCosts.length}</strong></span>
            <div className="flex items-center gap-1">
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;&lt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;</button>
              <span className="px-1">Page <strong>1</strong> of <strong>1</strong></span>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;</button>
              <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WHBrandingMatrix;
