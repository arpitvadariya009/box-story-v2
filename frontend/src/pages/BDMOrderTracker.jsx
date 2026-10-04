import React, { useState, useEffect } from 'react';
import {
  Search,
  Share2,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  Check,
  Box,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Map order status to timeline steps
const buildSteps = (order) => {
  const allSteps = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'In Transit', 'Delivered'];
  const statusOrder = {
    'Draft': 0,
    'Pending Approval': 0,
    'Approved': 1,
    'In Design': 1,
    'Design Approved': 1,
    'In Production': 1,
    'Quality Check': 1,
    'Ready to Pack': 2,
    'Packed': 2,
    'Ready to Ship': 3,
    'Dispatched': 3,
    'In Transit': 4,
    'Delivered': 5,
    'Confirmed': 1,
    'Processing': 0,
  };
  const currentIdx = statusOrder[order.status] ?? 0;
  const createdDate = order.createdAt ? new Date(order.createdAt) : null;
  const etaDate = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : null;

  return allSteps.map((label, i) => ({
    label,
    done: i <= currentIdx,
    date: i === 0 && createdDate
      ? createdDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : i === 5 && etaDate && order.status === 'Delivered'
        ? etaDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        : i <= currentIdx && i > 0 ? '✓' : '—',
  }));
};

// Map a DB order to display format
const mapOrder = (o) => ({
  _id: o._id,
  orderId: o.orderNumber || o._id?.toString().slice(-8).toUpperCase(),
  status: mapStatus(o.status),
  client: o.client?.companyName || o.client?.name || (typeof o.client === 'string' ? o.client : 'Client'),
  items: Array.isArray(o.items) ? o.items.reduce((sum, i) => sum + (i.quantity || 1), 0) : (o.items || 0),
  amount: o.totalAmount
    ? '₹' + Number(o.totalAmount).toLocaleString('en-IN')
    : '—',
  eta: o.expectedDeliveryDate
    ? new Date(o.expectedDeliveryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—',
  steps: buildSteps(o),
});

// Normalise DB status → display status
const mapStatus = (s) => {
  if (!s) return 'Processing';
  if (s === 'Delivered') return 'Delivered';
  if (s === 'In Transit' || s === 'Dispatched') return 'In Transit';
  if (s === 'Packed' || s === 'Ready to Ship' || s === 'Ready to Pack') return 'Confirmed';
  return 'Processing';
};

const statusConfig = {
  'In Transit': { bg: '#F1F5F9', color: '#64748B' },
  Processing: { bg: '#FFF3EB', color: '#FF852D' },
  Delivered: { bg: '#EAF8F2', color: '#10B981' },
  Confirmed: { bg: '#E0E7FF', color: '#4338CA' },
};

const filterTabs = ['All', 'Processing', 'Confirmed', 'In Transit', 'Delivered'];

const BDMOrderTracker = () => {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders');
        const raw = res.data?.data || res.data || [];
        if (Array.isArray(raw)) {
          setOrders(raw.map(mapOrder));
        }
      } catch (_) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [api]);

  const toggleExpand = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const kpi = {
    total: orders.length,
    inTransit: orders.filter((o) => o.status === 'In Transit').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      (o.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.client || '').toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || o.status === activeTab;
    return matchSearch && matchTab;
  });

  // Step Icon mapping exactly matching 11.jpg
  const getStepIcon = (idx, isDone) => {
    const icons = [Package, Check, Box, Truck, MapPin, Check];
    const IconComponent = icons[idx] || Check;
    return <IconComponent size={16} className={isDone ? 'text-white' : 'text-[#94A3B8]'} />;
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter'] bg-[#F8FAFC] min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-[#0F1729]">Order Tracker</h1>
        <p className="text-[14px] text-[#64748B] mt-0.5">Track and manage all client orders</p>
      </div>

      {/* KPI Cards (Matches 11.jpg icons and colors) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: kpi.total, icon: Package, iconColor: '#D90B37', iconBg: '#FDEDEE' },
          { label: 'In Transit', value: kpi.inTransit, icon: Truck, iconColor: '#1E75FF', iconBg: '#EAF2FF' },
          { label: 'Processing', value: kpi.processing, icon: Clock, iconColor: '#FF852D', iconBg: '#FFF3EB' },
          { label: 'Delivered', value: kpi.delivered, icon: CheckCircle2, iconColor: '#10B981', iconBg: '#EAF8F2' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-[#F1F5F9] p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: stat.iconBg }}
              >
                <Icon size={22} color={stat.iconColor} />
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#0F1729] leading-tight">{stat.value}</p>
                <p className="text-[12px] text-[#64748B] font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters (Matches 11.jpg layout) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#F1F5F9]">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by order ID or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer border-none ${
                activeTab === tab
                  ? 'bg-[#D90B37] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#D90B37] hover:text-[#D90B37]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List (Matches 11.jpg card design) */}
      {loading ? (
        <div className="text-center py-16 text-[#64748B]">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#64748B]">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const sc = statusConfig[order.status] || { bg: '#F1F5F9', color: '#64748B' };
            const isOpen = expanded[order._id];
            const steps = order.steps || [];
            const doneCount = steps.filter((s) => s.done).length;
            const progressPct = steps.length > 0 ? ((doneCount - 1) / (steps.length - 1)) * 100 : 0;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden shadow-sm"
              >
                {/* Order Header */}
                <div
                  className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Red Hexagon/Circular Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-[#D90B37] flex items-center justify-center shrink-0 shadow-md shadow-[#D90B37]/10">
                      <Package size={22} color="white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-[#0F1729]">
                          {order.orderId}
                        </span>
                        <span
                          className="text-[12px] font-semibold px-3 py-1 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] text-[#64748B] mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Building2 size={14} className="text-[#94A3B8]" />
                          {order.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Box size={14} className="text-[#94A3B8]" />
                          {order.items} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block">
                      <p className="text-[18px] font-extrabold text-[#D90B37]">{order.amount}</p>
                      <p className="text-[12px] text-[#94A3B8] flex items-center justify-end gap-1 mt-0.5">
                        <Calendar size={13} />
                        ETA: {order.eta}
                      </p>
                    </div>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors border-none bg-transparent cursor-pointer text-[#94A3B8]"
                    >
                      <Share2 size={16} />
                    </button>
                    {isOpen ? (
                      <ChevronUp size={18} color="#94A3B8" />
                    ) : (
                      <ChevronDown size={18} color="#94A3B8" />
                    )}
                  </div>
                </div>

                {/* Progress Accent Bar (divider style) */}
                <div className="w-full h-1 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#D90B37] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Expanded Timeline */}
                {isOpen && steps.length > 0 && (
                  <div className="px-6 py-8 overflow-x-auto bg-[#FCFCFD]">
                    <div className="flex items-start justify-between relative min-w-[700px] px-8">
                      {/* Connecting Line (Completed segment) */}
                      <div className="absolute top-5 left-12 right-12 h-1 bg-[#F1F5F9] z-0" />
                      <div
                        className="absolute top-5 left-12 h-1 bg-[#D90B37] z-0 transition-all duration-500"
                        style={{ width: `calc(${progressPct}% - ${progressPct > 0 ? '12px' : '0px'})` }}
                      />

                      {steps.map((step, idx) => (
                        <div
                          key={step.label}
                          className="flex flex-col items-center gap-3.5 z-10 flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              step.done
                                ? 'bg-[#D90B37] border-[#D90B37] text-white shadow-md shadow-[#D90B37]/15'
                                : 'bg-white border-[#E2E8F0] text-[#94A3B8]'
                            }`}
                          >
                            {getStepIcon(idx, step.done)}
                          </div>
                          <div className="text-center">
                            <p className="text-[12px] font-bold text-[#0F1729] leading-tight">
                              {step.label}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BDMOrderTracker;
