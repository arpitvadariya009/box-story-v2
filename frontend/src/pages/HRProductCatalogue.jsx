import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Star,
  Info,
  Plus,
  Check,
  X,
  Package,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const HRProductCatalogue = () => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('All');
  const [addedProductIds, setAddedProductIds] = useState(new Set());
  const [infoModalProduct, setInfoModalProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (api) {
          const res = await api.get('/products');
          const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          const mapped = arr.map((p) => ({
            ...p,
            rating: p.rating || 4.5,
            minOrderQty: p.minOrderQty || p.moq || 1,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [''],
            category: p.category || 'General',
          }));
          setProducts(mapped);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [api]);

  // Load added products from localStorage or catalogue builder
  useEffect(() => {
    const saved = localStorage.getItem('hr_catalogue_builder_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddedProductIds(new Set(parsed.map((p) => p._id || p.product?._id)));
      } catch (e) {}
    }
  }, []);

  const handleToggleAdd = (product) => {
    setAddedProductIds((prev) => {
      const next = new Set(prev);
      let items = [];
      const saved = localStorage.getItem('hr_catalogue_builder_items');
      if (saved) {
        try { items = JSON.parse(saved); } catch (e) {}
      }

      if (next.has(product._id)) {
        next.delete(product._id);
        items = items.filter((item) => (item._id || item.product?._id) !== product._id);
        setToastMessage(`Removed "${product.name}" from Catalogue Builder`);
      } else {
        next.add(product._id);
        items.push({
          _id: product._id,
          product: product,
          clientPrice: product.basePrice,
          qtyLimit: product.minOrderQty * 4 || 50,
          enabled: true,
        });
        setToastMessage(`Added "${product.name}" to Catalogue Builder`);
      }

      localStorage.setItem('hr_catalogue_builder_items', JSON.stringify(items));
      setTimeout(() => setToastMessage(''), 3000);
      return next;
    });
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (selectedSort === 'Price: Low to High') return a.basePrice - b.basePrice;
    if (selectedSort === 'Price: High to Low') return b.basePrice - a.basePrice;
    if (selectedSort === 'Rating: High to Low') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E11D48]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-['Inter'] w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-in slide-in-from-bottom-5">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#E11D48] transition-all shadow-2xs"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-[130px] sm:w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-[#E11D48] appearance-none cursor-pointer shadow-2xs"
          >
            <option value="All">All Categories</option>
            <option value="Hampers">Hampers</option>
            <option value="Wellness">Wellness</option>
            <option value="Electronics">Electronics</option>
            <option value="Stationery">Stationery</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[130px] sm:w-[160px]">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-[#E11D48] appearance-none cursor-pointer shadow-2xs"
          >
            <option value="All">Sort By: Default</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Rating: High to Low">Highest Rated</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Product Grid: 4 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => {
          const isAdded = addedProductIds.has(product._id);
          const imgSrc =
            product.images?.[0] ||
            'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
            >
              {/* Product Image */}
              <div className="relative h-[155px] w-full bg-slate-100 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Content */}
              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                <div className="space-y-1.5">
                  {/* Title & Brandable Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#FCE8ED] text-[#E11D48] flex-shrink-0">
                      Brandable
                    </span>
                  </div>

                  {/* Rating & MOQ */}
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <Star size={13} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">{product.rating || '4.5'}</span>
                    <span className="text-slate-300">•</span>
                    <span>Min {product.minOrderQty || 1} qty</span>
                  </div>

                  {/* Description */}
                  <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                    {product.description}
                  </p>
                </div>

                {/* Bottom Row: Price & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <div className="text-[17px] font-bold text-slate-900">
                    ₹{(product.basePrice || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Info Button */}
                    <button
                      type="button"
                      onClick={() => setInfoModalProduct(product)}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Info size={15} />
                    </button>

                    {/* Add / Added Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAdd(product)}
                      className={`h-8 px-3.5 rounded-lg text-[12.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border-none ${
                        isAdded
                          ? 'bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]'
                          : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-2xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={infoModalProduct.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'}
                alt={infoModalProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setInfoModalProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white shadow-md border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                    {infoModalProduct.name}
                  </h3>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    Category: {infoModalProduct.category}
                  </p>
                </div>
                <span className="text-[18px] font-bold text-[#E11D48]">
                  ₹{(infoModalProduct.basePrice || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed">
                {infoModalProduct.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-[12.5px]">
                <div>
                  <span className="text-slate-400 block font-normal">Min Order Qty</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{infoModalProduct.minOrderQty || 1} Units</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal">Customization</span>
                  <span className="font-bold text-emerald-600 mt-0.5 block">Logo & Custom Branding</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal">Lead Time</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{infoModalProduct.leadTimeDays || 3} Business Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-normal">Packaging</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Premium Gift Box</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleAdd(infoModalProduct);
                    setInfoModalProduct(null);
                  }}
                  className={`w-full py-2.5 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition-all ${
                    addedProductIds.has(infoModalProduct._id)
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-md'
                  }`}
                >
                  {addedProductIds.has(infoModalProduct._id) ? (
                    <>
                      <Check size={16} />
                      <span>Remove from Catalogue Builder</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add to Catalogue Builder</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRProductCatalogue;
