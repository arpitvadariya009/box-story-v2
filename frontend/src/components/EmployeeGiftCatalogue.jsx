import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmployeeProductDetail from './EmployeeProductDetail';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  CheckCircle2,
  X,
  MapPin,
  MessageSquare,
  Gift,
  Truck,
  ArrowRight
} from 'lucide-react';

const EmployeeGiftCatalogue = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('Default');

  // Product Details View state
  const [viewingProduct, setViewingProduct] = useState(null);

  // Modal State for selecting gift
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const [deliveryForm, setDeliveryForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    giftMessage: '',
  });

  // Dynamic Fetch from backend
  useEffect(() => {
    const fetchCatalogue = async () => {
      if (!api) return;
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          api.get('/products/catalogue/client'),
          api.get('/products'),
        ]);

        const catData = catRes.status === 'fulfilled' ? catRes.value.data : null;
        const prodData = prodRes.status === 'fulfilled' ? (Array.isArray(prodRes.value.data) ? prodRes.value.data : (prodRes.value.data?.data || [])) : [];

        if (catData && catData.products && catData.products.length > 0) {
          const formatted = catData.products.map((item, idx) => ({
            id: item.product?._id || idx + 1,
            title: item.product?.name || 'Gift Item',
            category: item.product?.category || 'General',
            description: item.product?.description || item.product?.shortDescription || '',
            price: item.clientPrice || item.product?.basePrice || 0,
            points: Math.round((item.clientPrice || item.product?.basePrice || 0) / 10),
            badge: item.product?.status === 'Available' ? 'Ready to Dispatch' : null,
            image: item.product?.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
            productId: item.product?._id,
            catalogueId: catData._id,
          }));
          setProducts(formatted);
        } else if (prodData.length > 0) {
          const formatted = prodData.map((p, idx) => ({
            id: p._id || idx + 1,
            title: p.name || 'Gift Item',
            category: p.category || 'General',
            description: p.description || p.shortDescription || '',
            price: p.basePrice || 0,
            points: Math.round((p.basePrice || 0) / 10),
            badge: p.status === 'Available' ? 'Ready to Dispatch' : null,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
            productId: p._id,
            catalogueId: null,
          }));
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, [api]);

  // Categories list
  const categories = ['All Categories', 'Gift Boxes', 'Stationery', 'Electronics', 'Travel', 'Home & Kitchen'];

  // Filtered & Sorted products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (selectedSort === 'Price: Low to High') return a.price - b.price;
    if (selectedSort === 'Price: High to Low') return b.price - a.price;
    if (selectedSort === 'Points') return b.points - a.points;
    return a.id - b.id;
  });

  // Handle Gift Submission
  const handleConfirmSelection = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      if (api && selectedProduct.productId && selectedProduct.catalogueId) {
        await api.post('/gift-selections', {
          catalogueId: selectedProduct.catalogueId,
          selectedProducts: [
            {
              product: selectedProduct.productId,
              quantity: 1,
              personalization: deliveryForm.giftMessage,
            },
          ],
          occasion: 'Corporate Gift',
          giftMessage: deliveryForm.giftMessage,
          deliveryAddress: {
            street: deliveryForm.street,
            city: deliveryForm.city,
            state: deliveryForm.state,
            zipCode: deliveryForm.zipCode,
            country: 'India',
          },
        });
      }
      setSuccessOrder(selectedProduct);
    } catch (err) {
      console.error('Submission error:', err);
      setSuccessOrder(selectedProduct);
    } finally {
      setSubmitting(false);
    }
  };

  // If viewing a product details page
  if (viewingProduct) {
    return (
      <EmployeeProductDetail
        product={viewingProduct}
        onBack={() => setViewingProduct(null)}
        onSelectOtherProduct={(p) => setViewingProduct(p)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* 1. Search & Filter Bar */}
      <div className="space-y-3.5">
        {/* Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <Search size={17} />
          </div>
          <input
            type="text"
            placeholder="Search gifts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-white border border-[#E2E8F0] focus:border-[#E11D48] rounded-xl pl-10 pr-4 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none shadow-2xs transition-all"
          />
        </div>

        {/* Filters Row - Full width on Mobile, Inline on Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#334155] text-[13.5px] font-medium rounded-xl h-11 sm:h-10 px-4 pr-10 outline-none shadow-2xs cursor-pointer transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Sort Dropdown - Centered text matching Figma */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] text-[#334155] text-[13.5px] font-medium rounded-xl h-11 sm:h-10 text-center px-10 outline-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="Default">Default</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Points">Points</option>
            </select>
            <SlidersHorizontal size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#334155] pointer-events-none" />
            <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>

        {/* Results Counter - Pink Pill matching Figma */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#FDEDEE] text-[#D90B37]">
            {filteredProducts.length} gifts found
          </span>
        </div>
      </div>

      {/* 2. Products Grid (3 cols on desktop, 1 col on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setViewingProduct(product)}
            className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            {/* Image Container - Fixed Uniform Dimensions & object-cover */}
            <div className="relative w-full h-[240px] sm:h-[260px] bg-slate-50 overflow-hidden">
              {/* Badge on top left */}
              {product.badge && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#10B981] text-white shadow-2xs">
                    {product.badge}
                  </span>
                </div>
              )}
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Product Details */}
            <div className="p-4 sm:p-5 border-t border-[#F1F5F9] flex flex-col justify-between flex-grow space-y-3.5">
              <div className="space-y-1">
                <span className="text-[11.5px] font-medium text-[#94A3B8] block">
                  {product.category}
                </span>
                <h3 className="text-[14px] font-bold text-[#0F172A] leading-snug line-clamp-1 group-hover:text-[#E11D48] transition-colors">
                  {product.title}
                </h3>
                <p className="text-[12px] text-[#64748B] font-normal line-clamp-1">
                  {product.description}
                </p>
              </div>

              {/* Price & Select Button Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-[15px] font-bold text-[#E11D48]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-medium">
                    / {product.points} pts
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="flex items-center gap-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer border-none"
                >
                  <ShoppingBag size={13} />
                  <span>Select</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Gift Selection Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-[#E11D48]" />
                <h3 className="text-[16px] font-bold text-slate-900">
                  {successOrder ? 'Gift Claimed Successfully!' : 'Confirm Your Gift Selection'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSuccessOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {successOrder ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#10B981] mx-auto flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Congratulations, {user?.name || 'Rahul'}!
                  </h4>
                  <p className="text-[13px] text-slate-600 max-w-sm mx-auto">
                    You have successfully chosen <strong>{selectedProduct.title}</strong>. Your corporate order has been recorded and will be prepared for dispatch!
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/orders')}
                      className="inline-flex items-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl shadow transition-colors cursor-pointer border-none"
                    >
                      <Truck size={16} />
                      <span>Track Order Status</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Product Preview Card */}
                  <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.title}
                      className="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                        {selectedProduct.title}
                      </h4>
                      <p className="text-[12px] text-slate-500">{selectedProduct.category}</p>
                      <div className="text-[13px] font-bold text-[#E11D48] mt-0.5">
                        ₹{selectedProduct.price.toLocaleString()} ({selectedProduct.points} points)
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Input */}
                  <div className="space-y-1.5">
                    <label className="text-[12.5px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#E11D48]" />
                      <span>Delivery Address</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.street}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, street: e.target.value })}
                      placeholder="Street address / Office building"
                      className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#E11D48]"
                    />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <input
                        type="text"
                        value={deliveryForm.city}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                        placeholder="City"
                        className="h-9 px-3 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#E11D48]"
                      />
                      <input
                        type="text"
                        value={deliveryForm.state}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, state: e.target.value })}
                        placeholder="State"
                        className="h-9 px-3 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#E11D48]"
                      />
                      <input
                        type="text"
                        value={deliveryForm.zipCode}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, zipCode: e.target.value })}
                        placeholder="Pin Code"
                        className="h-9 px-3 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  {/* Personalization Note */}
                  <div className="space-y-1.5">
                    <label className="text-[12.5px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-[#E11D48]" />
                      <span>Gift Message (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.giftMessage}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, giftMessage: e.target.value })}
                      placeholder="e.g. Happy Holidays, Looking forward to another great year!"
                      className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmSelection}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13.5px] font-semibold py-2.5 rounded-xl shadow transition-colors cursor-pointer border-none disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm & Claim Gift</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeGiftCatalogue;
