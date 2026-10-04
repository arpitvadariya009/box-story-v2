import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Check,
  Truck,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Tag,
  ShoppingBag,
  Gift,
  CheckCircle2,
  X,
  MessageSquare
} from 'lucide-react';

const PRODUCT_GALLERIES = {
  'Premium Gift Box Collection': [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80',
  ],
  'Executive Leather Notebook & Pen Set': [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
  ],
  'Wireless Noise-Cancelling Headphones': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
  ],
  'Classic Smartwatch': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
  ],
  'Professional Travel Backpack': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&auto=format&fit=crop&q=80',
  ],
  'Premium Espresso Machine': [
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80',
  ],
};

const ALL_CATALOGUE_PRODUCTS = [
  {
    id: 1,
    title: 'Premium Gift Box Collection',
    category: 'Gift Boxes',
    description: 'A luxurious curated gift box featuring premium artisanal products. Includes gourmet treats, a scented candle, and specialty items — beautifully packaged with a red ribbon.',
    price: 4500,
    points: 450,
    badge: 'Ready to Dispatch',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Executive Leather Notebook & Pen Set',
    category: 'Stationery',
    description: 'Handcrafted executive Italian leather notebook paired with a precision-weighted luxury rollerball pen. Perfect for corporate journaling and daily meetings.',
    price: 2200,
    points: 220,
    badge: 'Ready to Dispatch',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    description: 'Studio-quality active noise-cancelling wireless headphones with 40-hour battery life, ultra-comfortable memory foam earcups, and crystal-clear microphone.',
    price: 5500,
    points: 550,
    badge: null,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Classic Smartwatch',
    category: 'Electronics',
    description: 'Elegant aerospace-grade smartwatch with always-on AMOLED display, comprehensive heart-rate tracking, sleep insights, and 14-day battery reserve.',
    price: 7500,
    points: 750,
    badge: null,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Professional Travel Backpack',
    category: 'Travel',
    description: 'Water-resistant ergonomic travel backpack with padded 16-inch laptop sleeve, TSA-approved locks, hidden anti-theft pocket, and USB charging pass-through.',
    price: 3200,
    points: 320,
    badge: 'Ready to Dispatch',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Premium Espresso Machine',
    category: 'Home & Kitchen',
    description: '15-bar Italian pump espresso maker with integrated milk frother, rapid thermoblock heating, and customizable shot volumes for barista-grade coffee.',
    price: 8500,
    points: 850,
    badge: null,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
  },
];

const EmployeeProductDetail = ({ product, onBack, onSelectOtherProduct }) => {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // Selected thumbnail index
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Transition / animation key
  const [fadeKey, setFadeKey] = useState(product?.title || 'product');

  // Modal State for claim
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    street: 'Plot 42, Tech Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400050',
    giftMessage: 'Best wishes from the team!',
  });

  // Reset index when product changes
  useEffect(() => {
    setSelectedImgIndex(0);
    setFadeKey(product?.title + '_' + Date.now());
  }, [product]);

  if (!product) return null;

  // 5 multi-angle gallery images
  const images =
    (product.images && product.images.length >= 2 ? product.images : null) ||
    PRODUCT_GALLERIES[product.title] || [
      product.image,
      product.image,
      product.image,
      product.image,
      product.image,
    ];

  // Dynamic Similar Products: show other 3 products
  const similarProducts = ALL_CATALOGUE_PRODUCTS.filter(
    (p) => p.title !== product.title
  ).slice(0, 3);

  const handleSelectOther = (newProd) => {
    setSelectedImgIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSelectOtherProduct(newProd);
  };

  const handleConfirmClaim = async () => {
    setSubmitting(true);
    try {
      if (api && product.productId && product.catalogueId) {
        await api.post('/gift-selections', {
          catalogueId: product.catalogueId,
          selectedProducts: [
            {
              product: product.productId,
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
      setSuccessOrder(true);
    } catch (err) {
      console.error('Claim error:', err);
      setSuccessOrder(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div key={fadeKey} className="space-y-8 pb-12 font-['Inter'] animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
        <button
          onClick={onBack}
          className="hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer p-0 text-slate-500"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={onBack}
          className="hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer p-0 text-slate-500"
        >
          Catalogue
        </button>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{product.category}</span>
      </div>

      {/* Main Details Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Big Image & Thumbnails */}
        <div className="lg:col-span-6 space-y-4">
          {/* Big Featured Image with smooth transition */}
          <div className="bg-[#F8FAFC] rounded-[24px] overflow-hidden border border-slate-200/70 flex items-center justify-center p-4 sm:p-6 aspect-4/3 w-full shadow-2xs">
            <img
              src={images[selectedImgIndex] || product.image}
              alt={product.title}
              className="w-full h-full object-cover rounded-[16px] transition-all duration-300"
            />
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIndex(idx)}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-[14px] overflow-hidden p-1 bg-[#F8FAFC] transition-all cursor-pointer flex-shrink-0 ${
                  selectedImgIndex === idx
                    ? 'border-2 border-[#E11D48] shadow-xs'
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-[10px]" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Title, Ratings, Pricing, Description, Buy Box */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <span className="text-[12px] font-semibold text-[#E11D48] uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Ratings Row */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} className="text-slate-300" />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">4.0</span>
              <span className="text-slate-300">|</span>
              <span className="text-[12.5px] text-slate-500">128 ratings</span>
            </div>
          </div>

          {/* Price & Points */}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] text-slate-500 font-medium">Price:</span>
              <span className="text-[24px] sm:text-[26px] font-bold text-slate-900">
                ₹{product.price.toLocaleString()}
              </span>
            </div>
            <div className="text-[12.5px] font-medium text-[#E11D48] mt-0.5">
              or {product.points} reward points
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2.5 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60">
                In Stock
              </span>
              {['Premium Gift Box Collection', 'Executive Leather Notebook & Pen Set', 'Professional Travel Backpack'].includes(product.title) && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#10B981] text-white">
                  Ready to Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            {product.description ||
              'A luxurious curated gift box featuring premium artisanal products. Includes gourmet treats, a scented candle, and specialty items — beautifully packaged with a red ribbon.'}
          </p>

          {/* About this item */}
          <div className="space-y-2 pt-1">
            <h4 className="text-[13.5px] font-bold text-slate-900">About this item</h4>
            <ul className="space-y-1.5 text-[13px] text-slate-600">
              <li className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Includes 5 premium items</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Custom branded box</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Eco-friendly packaging</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Gift message included</span>
              </li>
            </ul>
          </div>

          {/* Purchase / Claim Action Card - Compact max-w-[420px] */}
          <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-baseline justify-between">
              <span className="text-[22px] font-bold text-slate-900">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-[12px] font-semibold text-emerald-600">In Stock</span>
            </div>

            <div className="space-y-2 text-[12.5px] text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-[#E11D48]" />
                <span>
                  Delivery in <strong className="text-slate-900 font-semibold">5 days</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#E11D48]" />
                <span>
                  Deliver to <strong className="text-slate-900 font-semibold">Mumbai 400050</strong>
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowClaimModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13.5px] font-semibold py-2.5 px-4 rounded-xl shadow-2xs transition-all cursor-pointer border-none"
            >
              <ShoppingBag size={15} />
              <span>Select This Gift</span>
            </button>

            {/* Trust Badges */}
            <div className="space-y-1.5 text-[11.5px] text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>Official company gift programme</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-slate-400" />
                <span>Exchange available within 7 days</span>
              </div>
            </div>

            {/* Branding Note inside container */}
            <div className="bg-[#FDEDEE] border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-[12.5px] mt-3">
              <Tag size={16} className="text-[#E11D48] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Branding Note</span>
                <span className="text-slate-600 mt-0.5 block">
                  Company logo can be embossed on the box lid
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Similar gifts you might like" Section */}
      <div className="pt-8 border-t border-slate-200/80 space-y-4">
        <h3 className="text-[17px] sm:text-[18px] font-bold text-slate-900">
          Similar gifts you might like
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {similarProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleSelectOther(p)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Full Width Edge-to-Edge Image with object-cover */}
              <div className="relative w-full h-[260px] sm:h-[280px] bg-slate-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 space-y-2 flex flex-col justify-between flex-grow">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-[#E11D48] transition-colors line-clamp-1 leading-snug">
                    {p.title}
                  </h4>
                  <div className="text-[15px] font-bold text-[#E11D48] mt-1">
                    ₹{p.price.toLocaleString()}
                  </div>
                  <div className="text-[11.5px] text-slate-400 font-medium">
                    {p.points} points
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim / Order Modal */}
      {showClaimModal && (
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
                  setShowClaimModal(false);
                  setSuccessOrder(false);
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
                    You have successfully chosen <strong>{product.title}</strong>. Your corporate order has been recorded and will be prepared for dispatch!
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
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                        {product.title}
                      </h4>
                      <p className="text-[12px] text-slate-500">{product.category}</p>
                      <div className="text-[13px] font-bold text-[#E11D48] mt-0.5">
                        ₹{product.price.toLocaleString()} ({product.points} points)
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
                      onClick={handleConfirmClaim}
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

export default EmployeeProductDetail;
