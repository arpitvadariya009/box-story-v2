import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Stationery', 'Electronics', 'Apparel', 'Lifestyle', 'Bags', 'Office', 'Hampers'];

const mapProduct = (p) => ({
  _id: p._id,
  name: p.name,
  category: p.category || 'General',
  brand: p.brand || 'Generic',
  price: p.basePrice || p.price || 0,
  sku: p.sku || p._id?.toString().slice(-6).toUpperCase(),
  stock: p.availableQty ?? p.stock ?? p.quantity ?? 0,
  image: p.images?.[0] || p.image || '📦',
});

const BDMProductCatalogue = () => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All Prices');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [proposal, setProposal] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products');
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          setProducts(data.map(mapProduct));
        }
      } catch (_) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [api]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAddToProposal = (product) => {
    if (!proposal.find((p) => p._id === product._id)) {
      setProposal((prev) => [...prev, product]);
      setToastMsg(`"${product.name}" added to proposal`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Catalogue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse available items and build client proposals</p>
        </div>
        {proposal.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF1F2] border border-[#FECDD3] px-4 py-2 rounded-xl">
            <ShoppingCart size={16} className="text-[#D90B37]" />
            <span className="text-sm font-bold text-[#D90B37]">{proposal.length} in proposal</span>
          </div>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D90B37] focus:ring-1 focus:ring-[#D90B37]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-8 px-4 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#D90B37] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
              <div className="h-28 bg-gray-100 rounded-xl" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Package size={36} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-medium">No products found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="h-28 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-3 overflow-hidden">
                  {typeof prod.image === 'string' && prod.image.startsWith('http') ? (
                    <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                  ) : (
                    prod.image || '📦'
                  )}
                </div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{prod.brand}</div>
                <h3 className="text-xs font-bold text-gray-900 mt-0.5 line-clamp-2">{prod.name}</h3>
                <div className="text-[11px] text-gray-400 mt-0.5">SKU: {prod.sku}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-gray-900">₹{prod.price.toLocaleString('en-IN')}</div>
                  <div className={`text-[10px] font-semibold ${prod.stock <= 10 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {prod.stock} in stock
                  </div>
                </div>
                <button
                  onClick={() => handleAddToProposal(prod)}
                  className="w-7 h-7 rounded-lg bg-[#D90B37] text-white flex items-center justify-center hover:bg-[#b8082d] transition-colors"
                  title="Add to Proposal"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BDMProductCatalogue;
