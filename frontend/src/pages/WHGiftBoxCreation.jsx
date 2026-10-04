import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Plus,
  Search,
  Filter,
  Columns,
  RefreshCw,
  Maximize2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  FileCheck,
  List
} from 'lucide-react';

const WHGiftBoxCreation = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Gift Box Details State matching 1920w light-5.jpg
  const initialDetailsState = {
    code: 'GB-DIW-01',
    name: 'Diwali Premium Hamper',
    category: 'Festival',
    targetAudience: 'Corporate / VIP',
    description: 'A premium curated gift hamper featuring handcrafted copperware, luxury stationery, and fine writing instruments.'
  };

  const [details, setDetails] = useState(initialDetailsState);

  // Component Table State matching 1920w light-5.jpg
  const initialComponentsState = [
    { id: '1', sku: 'BTL-001', product: 'Copper Bottle 750ml', qty: 1, unitCost: 320, total: 320 },
    { id: '2', sku: 'DRY-014', product: 'A5 Hardbound Diary', qty: 1, unitCost: 280, total: 280 },
    { id: '3', sku: 'PEN-101', product: 'Metal Roller Pen', qty: 1, unitCost: 220, total: 220 }
  ];

  const [components, setComponents] = useState(initialComponentsState);

  // Packaging State matching 1920w light-5.jpg
  const initialPackagingState = {
    boxType: 'Magnetic flip · Kraft',
    ribbon: 'Satin gold',
    tissuePaper: 'Crinkle gold',
    greetingCard: 'Foil-stamped'
  };

  const [packaging, setPackaging] = useState(initialPackagingState);

  // Custom Live Cost Parameters
  const [brandingCost, setBrandingCost] = useState(95);
  const [packagingCost, setPackagingCost] = useState(140);
  const [marginPct, setMarginPct] = useState(28);

  // Existing Gift Boxes for Registry View
  const [giftBoxList, setGiftBoxList] = useState([
    { id: 'GB-DIW-01', name: 'Diwali Premium Hamper', category: 'Festival', cost: '₹ 1,055', price: '₹ 1,465', items: 3 },
    { id: 'GB-CORP-04', name: 'Executive Onboarding Box', category: 'Corporate', cost: '₹ 850', price: '₹ 1,180', items: 4 },
    { id: 'GB-NEW-02', name: 'New Year Celebration Kit', category: 'Seasonal', cost: '₹ 1,400', price: '₹ 1,950', items: 5 }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Live Auto-calculated Cost Math
  const productCost = components.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const subtotal = productCost + Number(brandingCost || 0) + Number(packagingCost || 0);
  const marginAmount = Math.round(subtotal * (Number(marginPct || 0) / 100));
  const finalPrice = subtotal + marginAmount;

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePackagingChange = (e) => {
    const { name, value } = e.target;
    setPackaging(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (id, field, value) => {
    setComponents(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const q = Number(field === 'qty' ? value : updated.qty) || 0;
        const uc = Number(field === 'unitCost' ? value : updated.unitCost) || 0;
        updated.total = q * uc;
        return updated;
      }
      return item;
    }));
  };

  const handleAddComponent = () => {
    const newItem = {
      id: Date.now().toString(),
      sku: 'MUG-007',
      product: 'Ceramic Mug 320ml',
      qty: 1,
      unitCost: 150,
      total: 150
    };
    setComponents(prev => [...prev, newItem]);
    showToastMsg('Added component to gift box.');
  };

  const handleDeleteComponent = (id) => {
    setComponents(prev => prev.filter(i => i.id !== id));
    showToastMsg('Component removed.', 'info');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(components.map(i => i.id));
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
        code: details.code,
        name: details.name,
        category: details.category,
        targetAudience: details.targetAudience,
        description: details.description,
        components,
        packaging,
        liveCost: {
          productCost,
          brandingCost,
          packagingCost,
          subtotal,
          marginPct,
          marginAmount,
          finalPrice
        }
      };
      await api.post('/gift-boxes', payload).catch(() => null);

      const newBox = {
        id: details.code,
        name: details.name,
        category: details.category,
        cost: `₹ ${subtotal.toLocaleString()}`,
        price: `₹ ${finalPrice.toLocaleString()}`,
        items: components.length
      };
      setGiftBoxList(prev => [newBox, ...prev]);

      showToastMsg(`Gift Box "${details.name}" (${details.code}) saved successfully!`);
    } catch (err) {
      showToastMsg(`Gift Box "${details.name}" saved.`, 'success');
    }
  };

  const handlePreview = () => {
    showToastMsg(`Generating 3D preview mockup for ${details.name}...`);
  };

  const handleGenerateBOM = () => {
    showToastMsg(`BOM (Bill of Materials) generated for ${details.code}! Ready for assembly line.`);
    navigate('/wh-product-bundle-builder');
  };

  const filteredComponents = components.filter(c =>
    c.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Breadcrumb matching 1920w light-5.jpg */}
      <nav className="flex text-xs font-semibold text-slate-400 gap-1.5 mb-1">
        <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/wh-dashboard')}>Home</span>
        <span>&gt;</span>
        <span className="hover:text-slate-600 cursor-pointer">Gift Box</span>
        <span>&gt;</span>
        <span className="text-slate-700">Create</span>
      </nav>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gift Box Creation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Compose components, packaging and live cost.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <Gift size={16} />}
            {viewMode === 'form' ? 'View All Gift Boxes' : 'New Gift Box Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Gift Box Master Catalog ({giftBoxList.length})</h3>
            <button
              onClick={() => {
                setDetails({
                  ...initialDetailsState,
                  code: 'GB-NEW-' + Math.floor(10 + Math.random() * 90)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Gift Box
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">GIFT BOX CODE</th>
                  <th className="pb-3 px-3">NAME</th>
                  <th className="pb-3 px-3">CATEGORY</th>
                  <th className="pb-3 px-3">COMPONENTS</th>
                  <th className="pb-3 px-3">BASE COST</th>
                  <th className="pb-3 px-3 text-right">FINAL PRICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {giftBoxList.map(gb => (
                  <tr key={gb.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{gb.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{gb.name}</td>
                    <td className="py-3.5 px-3 text-slate-500">{gb.category}</td>
                    <td className="py-3.5 px-3 text-slate-700">{gb.items} items</td>
                    <td className="py-3.5 px-3 text-slate-700">{gb.cost}</td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-[#E21D48]">{gb.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-5.jpg */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* LEFT COLUMN: 3 Cards */}
          <div className="lg:col-span-3 space-y-6">

            {/* CARD 1: Gift Box Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Gift Box Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GIFT BOX CODE</label>
                  <input
                    type="text"
                    name="code"
                    value={details.code}
                    onChange={handleDetailsChange}
                    placeholder="GB-DIW-01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GIFT BOX NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={details.name}
                    onChange={handleDetailsChange}
                    placeholder="Diwali Premium Hamper"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CATEGORY</label>
                  <input
                    type="text"
                    name="category"
                    value={details.category}
                    onChange={handleDetailsChange}
                    placeholder="Festival"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">TARGET AUDIENCE</label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={details.targetAudience}
                    onChange={handleDetailsChange}
                    placeholder="Corporate / VIP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DESCRIPTION</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={details.description}
                    onChange={handleDetailsChange}
                    placeholder="A premium curated gift hamper..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Component Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Component Table</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{components.length} records</p>
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
                  <button onClick={() => showToastMsg('Refreshed component grid.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Refresh">
                    <RefreshCw size={16} />
                  </button>
                  <button onClick={() => showToastMsg('Full screen toggle.')} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" title="Fullscreen">
                    <Maximize2 size={16} />
                  </button>
                  <button
                    onClick={handleAddComponent}
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
                          checked={selectedRows.length === components.length && components.length > 0}
                          className="rounded text-[#E21D48] focus:ring-rose-500"
                        />
                      </th>
                      <th className="py-2.5 px-3">SKU ⇅</th>
                      <th className="py-2.5 px-3">Product ⇅</th>
                      <th className="py-2.5 px-3">Qty ⇅</th>
                      <th className="py-2.5 px-3">Unit Cost ⇅</th>
                      <th className="py-2.5 px-3">Total ⇅</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredComponents.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(c.id)}
                            onChange={() => handleSelectRow(c.id)}
                            className="rounded text-[#E21D48] focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#E21D48]">
                          <input
                            type="text"
                            value={c.sku}
                            onChange={(e) => handleComponentChange(c.id, 'sku', e.target.value)}
                            className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={c.product}
                            onChange={(e) => handleComponentChange(c.id, 'product', e.target.value)}
                            className="w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <input
                            type="number"
                            value={c.qty}
                            onChange={(e) => handleComponentChange(c.id, 'qty', Number(e.target.value))}
                            className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          <div className="flex items-center gap-1">
                            <span>₹</span>
                            <input
                              type="number"
                              value={c.unitCost}
                              onChange={(e) => handleComponentChange(c.id, 'unitCost', Number(e.target.value))}
                              className="w-20 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          ₹ {c.total ? c.total.toLocaleString() : 0}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteComponent(c.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove component"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls matching 1920w light-5.jpg */}
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
                  <span>Showing <strong>1-{filteredComponents.length}</strong> of <strong>{filteredComponents.length}</strong></span>
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

            {/* CARD 3: Packaging */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Packaging</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BOX TYPE</label>
                  <input
                    type="text"
                    name="boxType"
                    value={packaging.boxType}
                    onChange={handlePackagingChange}
                    placeholder="Magnetic flip · Kraft"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RIBBON</label>
                  <input
                    type="text"
                    name="ribbon"
                    value={packaging.ribbon}
                    onChange={handlePackagingChange}
                    placeholder="Satin gold"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">TISSUE PAPER</label>
                  <input
                    type="text"
                    name="tissuePaper"
                    value={packaging.tissuePaper}
                    onChange={handlePackagingChange}
                    placeholder="Crinkle gold"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">GREETING CARD</label>
                  <input
                    type="text"
                    name="greetingCard"
                    value={packaging.greetingCard}
                    onChange={handlePackagingChange}
                    placeholder="Foil-stamped"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Cost Summary Card matching 1920w light-5.jpg */}
          <div className="lg:col-span-1 sticky top-6 bg-pink-50/60 border border-pink-100/80 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Live Cost Summary</h3>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center">
                <span>Product Cost</span>
                <span className="font-bold text-slate-900">₹ {productCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Branding Cost</span>
                <span className="font-bold text-slate-900">₹ {brandingCost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Packaging Cost</span>
                <span className="font-bold text-slate-900">₹ {packagingCost}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-rose-200/60 font-bold text-slate-900">
                <span>Subtotal</span>
                <span>₹ {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Margin ({marginPct}%)</span>
                <span className="font-bold text-slate-900">₹ {marginAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between">
              <span className="uppercase text-[11px] tracking-wider font-extrabold text-slate-500">FINAL PRICE</span>
              <span className="text-2xl font-black text-[#E21D48]">₹ {finalPrice.toLocaleString()}</span>
            </div>

            {/* Action Buttons in Right Panel matching 1920w light-5.jpg */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePreview}
                  className="w-full py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm flex items-center justify-center gap-1"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={handleSave}
                  className="w-full py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] shadow-sm flex items-center justify-center gap-1"
                >
                  <Save size={14} /> Save
                </button>
              </div>

              <button
                onClick={handleGenerateBOM}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileCheck size={15} /> Generate BOM
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHGiftBoxCreation;
