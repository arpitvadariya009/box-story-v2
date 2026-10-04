import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  ShoppingBag,
  SlidersHorizontal,
  Bookmark,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WHCatalog = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [priceMax, setPriceMax] = useState(5000);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // 6 Product Catalog Items matching 1920w light-13.jpg
  const [products] = useState([
    {
      id: 'BX-CO-100',
      sku: 'BX-CO-100',
      name: 'Premium Diwali Hamper',
      category: 'Corporate',
      brand: 'Box Stories',
      price: 1499,
      moq: 50,
      isNew: true,
      stockStatus: 'In Stock', // In Stock, Low Stock, Out Of Stock
      branding: ['UV Print'],
      img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BX-FE-101',
      sku: 'BX-FE-101',
      name: 'Corporate Tech Kit',
      category: 'Festive',
      brand: 'Verve',
      price: 2299,
      moq: 25,
      isNew: true,
      stockStatus: 'Low Stock',
      branding: ['UV Print', 'Laser'],
      img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BX-WE-102',
      sku: 'BX-WE-102',
      name: 'Eco Welcome Box',
      category: 'Welcome Kits',
      brand: 'Heritage',
      price: 999,
      moq: 100,
      isNew: true,
      stockStatus: 'In Stock',
      branding: ['UV Print', 'Laser', 'Screen'],
      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BX-WE-103',
      sku: 'BX-WE-103',
      name: 'Festive Sweets Trio',
      category: 'Wellness',
      brand: 'Lumen',
      price: 749,
      moq: 50,
      isNew: true,
      stockStatus: 'Low Stock',
      branding: ['UV Print', 'Laser', 'Screen', 'Foiling'],
      img: 'https://images.unsplash.com/photo-1585336261026-875a60a1c92f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BX-TE-104',
      sku: 'BX-TE-104',
      name: 'Onboarding Essentials',
      category: 'Tech',
      brand: 'Onyx',
      price: 1899,
      moq: 30,
      isNew: false,
      stockStatus: 'In Stock',
      branding: ['UV Print'],
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BX-SU-105',
      sku: 'BX-SU-105',
      name: 'Wellness Pack Pro',
      category: 'Sustainable',
      brand: 'Box Stories',
      price: 1299,
      moq: 75,
      isNew: false,
      stockStatus: 'Out Of Stock',
      branding: ['UV Print', 'Laser'],
      img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesPrice = p.price <= priceMax;
    const matchesAvailability = availabilityFilter === 'All' ||
                                (availabilityFilter === 'In stock only' && p.stockStatus === 'In Stock') ||
                                (availabilityFilter === 'New arrivals' && p.isNew);
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesAvailability;
  });

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

      {/* Sub-nav Tabs matching 1920w light-13.jpg */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 bg-[#E21D48] text-white text-xs font-bold rounded-full shadow-sm">
          Catalog
        </button>
        <button
          onClick={() => navigate('/wh-product-detail')}
          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors"
        >
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse, filter and discover products for gifting and bundles.</p>
      </div>

      {/* Top Filter Bar Card matching 1920w light-13.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Filters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Corporate">Corporate</option>
              <option value="Festive">Festive</option>
              <option value="Welcome Kits">Welcome Kits</option>
              <option value="Wellness">Wellness</option>
              <option value="Tech">Tech</option>
              <option value="Sustainable">Sustainable</option>
            </select>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRICE RANGE</label>
            <select
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
            >
              <option value="5000">Up to ₹5,000</option>
              <option value="2000">Up to ₹2,000</option>
              <option value="1000">Up to ₹1,000</option>
            </select>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRAND</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
            >
              <option value="All">All Brands</option>
              <option value="Box Stories">Box Stories</option>
              <option value="Verve">Verve</option>
              <option value="Heritage">Heritage</option>
              <option value="Lumen">Lumen</option>
              <option value="Onyx">Onyx</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">STOCK AVAILABILITY</label>
            <select
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
            >
              <option value="All">All Stock Levels</option>
              <option value="In stock only">In Stock Only</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING AVAILABLE</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white">
              <option value="All">All Branding Types</option>
              <option value="UV Print">UV Print</option>
              <option value="Laser">Laser Engraving</option>
              <option value="Screen">Screen Printing</option>
            </select>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">NEW ARRIVALS</label>
            <select
              onChange={(e) => setAvailabilityFilter(e.target.value === 'New' ? 'New arrivals' : 'All')}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium bg-white"
            >
              <option value="All">Show All</option>
              <option value="New">New Arrivals Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Area: Sidebar Filters (Left) + Search & 6 Product Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* LEFT SIDEBAR FILTERS CARD matching 1920w light-13.jpg */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Filters</h3>
            <SlidersHorizontal size={15} className="text-slate-400" />
          </div>

          {/* Category Radio Group */}
          <div className="space-y-2">
            <p className="uppercase text-[10px] font-bold tracking-wider text-slate-400">CATEGORY</p>
            {['All', 'Corporate', 'Festive', 'Welcome Kits', 'Wellness', 'Tech', 'Sustainable'].map(cat => (
              <label key={cat} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-rose-600">
                <input
                  type="radio"
                  name="catGroup"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  className="accent-[#E21D48]"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          {/* Brand Radio Group */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <p className="uppercase text-[10px] font-bold tracking-wider text-slate-400">BRAND</p>
            {['All', 'Box Stories', 'Verve', 'Heritage', 'Lumen', 'Onyx'].map(b => (
              <label key={b} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-rose-600">
                <input
                  type="radio"
                  name="brandGroup"
                  checked={selectedBrand === b}
                  onChange={() => setSelectedBrand(b)}
                  className="accent-[#E21D48]"
                />
                <span>{b}</span>
              </label>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <p className="uppercase text-[10px] font-bold tracking-wider text-slate-400">PRICE RANGE</p>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#E21D48]"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>₹0</span>
              <span>₹{priceMax.toLocaleString()}</span>
            </div>
          </div>

          {/* Availability Options */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <p className="uppercase text-[10px] font-bold tracking-wider text-slate-400">AVAILABILITY</p>
            {['All', 'In stock only', 'Branding available', 'New arrivals'].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-rose-600">
                <input
                  type="radio"
                  name="availGroup"
                  checked={availabilityFilter === opt}
                  onChange={() => setAvailabilityFilter(opt)}
                  className="accent-[#E21D48]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT MAIN AREA: Search Bar + 6 Product Cards Grid */}
        <div className="lg:col-span-3 space-y-4">

          {/* Top Full Width Search Bar */}
          <div className="relative bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50/60 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* 3-Column Product Grid matching 1920w light-13.jpg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">

                {/* Card Image Header with Top Badges */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.isNew && (
                    <span className="absolute top-2.5 left-2.5 bg-[#E21D48] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      New
                    </span>
                  )}
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                    p.stockStatus === 'In Stock' ? 'bg-emerald-500/90 text-white' :
                    p.stockStatus === 'Low Stock' ? 'bg-amber-500/90 text-white' : 'bg-rose-600/90 text-white'
                  }`}>
                    {p.stockStatus}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{p.sku}</span>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900">₹{p.price.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold">MOQ {p.moq}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{p.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{p.category} · {p.brand}</p>

                    {/* Branding Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.branding.map(b => (
                        <span key={b} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Actions matching 1920w light-13.jpg */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate('/wh-product-detail')}
                      className="flex-1 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} /> View
                    </button>

                    <button
                      onClick={() => navigate('/wh-compare')}
                      className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
                      title="Compare"
                    >
                      <ArrowRightLeft size={14} />
                    </button>
                    <button
                      onClick={() => showToastMsg(`Saved ${p.name} to bookmarks.`)}
                      className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
                      title="Save"
                    >
                      <Bookmark size={14} />
                    </button>
                    <button
                      onClick={() => {
                        showToastMsg(`Added ${p.name} to Gift Box Creator!`);
                        navigate('/wh-gift-box-creation');
                      }}
                      className="p-2 bg-[#E21D48] text-white rounded-xl hover:bg-[#BE123C] shadow-xs"
                      title="Add to Gift Box"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default WHCatalog;
