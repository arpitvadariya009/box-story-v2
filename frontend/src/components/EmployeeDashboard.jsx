import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gift,
  Star,
  Clock,
  TrendingUp,
  Package,
  Sparkles,
  MapPin,
  Truck,
  ArrowRight
} from 'lucide-react';

// Custom exact SVG icons matching Figma screenshot 1 & 2
const WalletIcon = ({ size = 20, className = 'text-[#D90B37]' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2" />
    <path d="M15 7h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <circle cx="18" cy="12" r="1" fill="currentColor" />
  </svg>
);

const CheckCircleIcon = ({ size = 20, className = 'text-[#D90B37]' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="9 12 11.5 14.5 15.5 9.5" />
  </svg>
);

const EmployeeDashboard = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    budget: 0,
    points: 0,
    status: 'Open',
    availableGifts: 0,
    deadline: 'Active',
  });

  const [activeOrder, setActiveOrder] = useState(null);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [popularPicks, setPopularPicks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!api) return;
      try {
        const [dashRes, prodRes] = await Promise.allSettled([
          api.get('/dashboard'),
          api.get('/products')
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.data) {
          const resData = dashRes.value.data;
          if (resData.metrics) {
            setMetrics((prev) => ({ ...prev, ...resData.metrics }));
          }
          if (resData.timeLeft) {
            setTimeLeft(resData.timeLeft);
          }
          if (resData.popularPicks && resData.popularPicks.length > 0) {
            setPopularPicks(resData.popularPicks);
          }
          if (resData.activeOrder) {
            setActiveOrder(resData.activeOrder);
          }
        }

        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          const pList = Array.isArray(prodRes.value.data) ? prodRes.value.data : (prodRes.value.data?.data || []);
          if (pList.length > 0) {
            setPopularPicks(pList.slice(0, 3).map((p, idx) => ({
              id: p._id || idx + 1,
              title: p.name || 'Gift Item',
              category: p.category || 'General',
              price: `₹${Number(p.basePrice || 0).toLocaleString('en-IN')}`,
              badge: p.status === 'Available' ? 'Ready' : null,
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
            })));
            setMetrics(prev => ({ ...prev, availableGifts: pList.length }));
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic employee dashboard data', err);
      }
    };

    fetchDashboardData();
  }, [api]);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Employee';

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* 1. Welcome Banner - Solid #E11D48 matching Figma */}
      <div className="relative overflow-hidden bg-[#E11D48] rounded-[22px] p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Text & CTA */}
          <div className="max-w-2xl space-y-2">
            <h1 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold tracking-tight text-white flex items-center gap-2">
              Welcome back, {displayName}! <span>🎁</span>
            </h1>
            <p className="text-[13px] sm:text-[14px] text-white/95 font-normal leading-relaxed">
              Your company has a special gift waiting for you. Browse the curated catalogue and pick your favourite!
            </p>
            <div className="pt-2">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2.5 bg-white text-[#E11D48] hover:bg-rose-50 text-[13px] sm:text-[14px] font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 group no-underline"
              >
                <Gift size={17} className="text-[#E11D48] transition-transform group-hover:scale-110" />
                <span>Browse Gifts</span>
                <ArrowRight size={15} className="text-[#E11D48] transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: Countdown Box - Hidden on mobile/small screens (hidden md:block) */}
          <div className="hidden md:block flex-shrink-0 bg-white/10 border border-white/20 rounded-[12px] p-2.5 sm:px-3 sm:py-2.5 self-start lg:self-auto min-w-[175px]">
            <div className="text-[9.5px] font-semibold tracking-wider text-white/90 uppercase text-center mb-1">
              TIME LEFT
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[19px] sm:text-[20px] font-bold text-white leading-none">{timeLeft.days}</div>
                <div className="text-[9.5px] text-white/80 font-medium mt-1">days</div>
              </div>
              <div>
                <div className="text-[19px] sm:text-[20px] font-bold text-white leading-none">{timeLeft.hours}</div>
                <div className="text-[9.5px] text-white/80 font-medium mt-1">hours</div>
              </div>
              <div>
                <div className="text-[19px] sm:text-[20px] font-bold text-white leading-none">{timeLeft.minutes}</div>
                <div className="text-[9.5px] text-white/80 font-medium mt-1">minutes</div>
              </div>
              <div>
                <div className="text-[19px] sm:text-[20px] font-bold text-white leading-none">{timeLeft.seconds}</div>
                <div className="text-[9.5px] text-white/80 font-medium mt-1">seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI / Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: My Budget */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FDEDEE] flex items-center justify-center flex-shrink-0">
            <WalletIcon size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <span className="text-[12px] sm:text-[13px] font-medium text-[#64748B] block">My Budget</span>
            <span className="text-[17px] sm:text-[20px] font-bold text-[#0F172A] leading-tight block mt-0.5">
              ₹{metrics.budget?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Points */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FDEDEE] text-[#E11D48] flex items-center justify-center flex-shrink-0">
            <Star size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <span className="text-[12px] sm:text-[13px] font-medium text-[#64748B] block">Points</span>
            <span className="text-[17px] sm:text-[20px] font-bold text-[#0F172A] leading-tight block mt-0.5">
              {metrics.points}
            </span>
          </div>
        </div>

        {/* Card 3: Status */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FDEDEE] flex items-center justify-center flex-shrink-0">
            <CheckCircleIcon size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <span className="text-[12px] sm:text-[13px] font-medium text-[#64748B] block">Status</span>
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#10B981] text-white">
                {metrics.status}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Available (Desktop) / Deadline (Mobile) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          {/* Mobile view icon & text */}
          <div className="flex sm:hidden items-center gap-3.5 w-full">
            <div className="w-11 h-11 rounded-xl bg-[#FDEDEE] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-[#E11D48]" />
            </div>
            <div>
              <span className="text-[12px] font-medium text-[#64748B] block">Deadline</span>
              <span className="text-[17px] font-bold text-[#0F172A] leading-tight block mt-0.5">
                {metrics.deadline}
              </span>
            </div>
          </div>

          {/* Desktop view icon & text */}
          <div className="hidden sm:flex items-center gap-3.5 w-full">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FDEDEE] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <Gift size={20} className="text-[#E11D48]" />
            </div>
            <div>
              <span className="text-[12px] sm:text-[13px] font-medium text-[#64748B] block">Available</span>
              <span className="text-[17px] sm:text-[20px] font-bold text-[#0F172A] leading-tight block mt-0.5">
                {metrics.availableGifts} Gifts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Section Grid: Popular Picks (Left) + Order & Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Popular Picks (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#E11D48]" />
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[#0F172A]">Popular Picks</h2>
            </div>
            <Link
              to="/catalogue"
              className="text-[13px] font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors no-underline"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularPicks.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/catalogue')}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative w-full h-[200px] bg-slate-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-[13.5px] font-bold text-[#0F172A] group-hover:text-[#E11D48] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[#94A3B8] font-medium mt-0.5">
                      {item.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[15px] font-bold text-[#E11D48]">
                      {item.price}
                    </span>
                    {item.badge && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#E6F8F0] text-[#10B981]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: My Order & Quick Actions (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Widget 1: My Order */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0F172A]">My Order</h3>
              <Link
                to="/orders"
                className="text-[12px] sm:text-[13px] font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1 transition-colors no-underline"
              >
                <span>Track</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#94A3B8] flex items-center justify-center flex-shrink-0">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#334155] leading-snug">
                  No active orders yet
                </p>
                <p className="text-[12px] text-[#94A3B8] font-normal mt-0.5">
                  Select a gift to get started
                </p>
              </div>
            </div>
          </div>

          {/* Widget 2: Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#E11D48]" />
              <h3 className="text-[15px] font-bold text-[#0F172A]">Quick Actions</h3>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/catalogue"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#334155] transition-all duration-150 no-underline group"
              >
                <Gift size={16} className="text-[#E11D48] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Browse Gift Catalogue</span>
              </Link>

              <Link
                to="/settings"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#334155] transition-all duration-150 no-underline group"
              >
                <MapPin size={16} className="text-[#E11D48] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Update Delivery Address</span>
              </Link>

              <Link
                to="/orders"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#334155] transition-all duration-150 no-underline group"
              >
                <Truck size={16} className="text-[#E11D48] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Track My Order</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
