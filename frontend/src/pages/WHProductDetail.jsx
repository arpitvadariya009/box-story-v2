import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Search,
  Filter,
  Columns,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
  Maximize2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WHProductDetail = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [matrixSearch, setMatrixSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Pricing Matrix State matching 1920w light-14.jpg
  const [pricingTiers, setPricingTiers] = useState([
    { id: '1', quantity: '1 – 50', price: 360 },
    { id: '2', quantity: '51 – 200', price: 320 },
    { id: '3', quantity: '201 – 500', price: 290 },
    { id: '4', quantity: '500+', price: 265 }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddTier = () => {
    const newTier = {
      id: Date.now().toString(),
      quantity: '1000+',
      price: 240
    };
    setPricingTiers(prev => [...prev, newTier]);
    showToastMsg('Added new pricing tier.');
  };

  const handleDeleteTier = (id) => {
    setPricingTiers(prev => prev.filter(t => t.id !== id));
    showToastMsg('Pricing tier removed.', 'info');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(pricingTiers.map(t => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredTiers = pricingTiers.filter(t =>
    t.quantity.toLowerCase().includes(matrixSearch.toLowerCase())
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

      {/* Sub-nav Pill Tabs matching 1920w light-14.jpg */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/wh-catalog')}
          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors"
        >
          Catalog
        </button>
        <button className="px-4 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-full shadow-sm">
          Product Detail
        </button>
        <button
          onClick={() => navigate('/wh-compare')}
          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors"
        >
          Compare
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Tech Kit</h1>
        <p className="text-sm text-slate-500 mt-0.5">SKU: BTL-001 • Drinkware</p>
      </div>

      {/* Main 2-Column Grid Layout matching 1920w light-14.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT COLUMN: Large Product Image Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-[520px] bg-slate-100 rounded-xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80"
              alt="Corporate Tech Kit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Stacked Cards */}
        <div className="space-y-6">

          {/* CARD 1: Product Information matching 1920w light-14.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Product Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">PRODUCT NAME</p>
                <p className="font-bold text-slate-900 mt-0.5">Corporate Tech Kit</p>
              </div>
              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">SKU</p>
                <p className="font-bold text-slate-900 mt-0.5">BTL-001</p>
              </div>

              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">MATERIAL</p>
                <p className="font-bold text-slate-900 mt-0.5">Copper</p>
              </div>
              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">COLOUR OPTIONS</p>
                <p className="font-bold text-slate-900 mt-0.5">Hammered, Matte</p>
              </div>

              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">DIMENSIONS</p>
                <p className="font-bold text-slate-900 mt-0.5">Ø 7cm × 24cm</p>
              </div>
              <div>
                <p className="uppercase text-[10px] tracking-wider text-slate-400">WEIGHT</p>
                <p className="font-bold text-slate-900 mt-0.5">320 g</p>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
              Premium pure copper bottle with leak-proof lid. Naturally antimicrobial and ideal for daily use, corporate gifting and wellness hampers. <strong>Features:</strong> hand-finished, food-grade, 750ml capacity.
            </div>
          </div>

          {/* CARD 2: Branding Options matching 1920w light-14.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Branding Options</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {['UV Printing', 'Screen Printing', 'Laser Engraving', 'Embroidery', 'Foiling'].map(b => (
                <span key={b} className="px-3 py-1 bg-rose-50/70 text-[#E21D48] border border-rose-200 rounded-full text-xs font-bold">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* CARD 3: Pricing Matrix matching 1920w light-14.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pricing Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">{pricingTiers.length} records</p>
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
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
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
                <button onClick={() => showToastMsg('Exporting Pricing Matrix Excel...')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><FileSpreadsheet size={15} /></button>
                <button onClick={() => showToastMsg('Exporting Pricing Matrix PDF...')} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"><FileText size={15} /></button>
                <button onClick={() => showToastMsg('Downloading dataset...')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Download size={15} /></button>
                <button onClick={() => window.print()} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Printer size={15} /></button>
                <button onClick={() => showToastMsg('Refreshed matrix.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><RefreshCw size={15} /></button>
                <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1 text-slate-600 hover:bg-slate-50 rounded-lg"><Maximize2 size={15} /></button>
                <button
                  onClick={handleAddTier}
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
                        onChange={handleSelectAll}
                        checked={selectedRows.length === pricingTiers.length && pricingTiers.length > 0}
                        className="rounded text-[#E21D48] focus:ring-rose-500"
                      />
                    </th>
                    <th className="py-2 px-2.5">Quantity ⇅</th>
                    <th className="py-2 px-2.5">Price ⇅</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredTiers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(t.id)}
                          onChange={() => handleSelectRow(t.id)}
                          className="rounded text-[#E21D48] focus:ring-rose-500"
                        />
                      </td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">{t.quantity}</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">₹ {t.price}</td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          onClick={() => handleDeleteTier(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove tier"
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
              <span>Showing <strong>1-{filteredTiers.length}</strong> of <strong>{filteredTiers.length}</strong></span>
              <div className="flex items-center gap-1">
                <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;&lt;</button>
                <button className="p-0.5 border border-slate-200 rounded text-slate-400">&lt;</button>
                <span className="px-1">Page <strong>1</strong> of <strong>1</strong></span>
                <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;</button>
                <button className="p-0.5 border border-slate-200 rounded text-slate-400">&gt;&gt;</button>
              </div>
            </div>
          </div>

          {/* CARD 4: Downloads matching 1920w light-14.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Downloads</h3>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => showToastMsg('Downloading Product Catalogue PDF...')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Download size={15} /> Product Catalogue PDF
              </button>
              <button
                onClick={() => showToastMsg('Downloading Branding Template AI/PDF...')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Download size={15} /> Branding Template
              </button>
              <button
                onClick={() => showToastMsg('Downloading Product High-Res Images Zip...')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Download size={15} /> Product Images
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default WHProductDetail;
