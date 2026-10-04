import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  ExternalLink,
  X,
  MapPin,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

const HROrderTracking = () => {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [trackModalOrder, setTrackModalOrder] = useState(null);
  const [timelineModalOrder, setTimelineModalOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (api) {
        const res = await api.get('/orders');
        const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = arr.map((o, idx) => {
          const num = o.orderNumber ? (o.orderNumber.startsWith('ORD-') ? o.orderNumber : `ORD-${o.orderNumber}`) : `ORD-${1040 + idx}`;
          let status = 'Processing';
          if (['Dispatched', 'Ready to Ship', 'Shipped', 'In Transit'].includes(o.status)) status = 'Shipped';
          else if (['Delivered'].includes(o.status)) status = 'Delivered';
          else if (['Pending Approval', 'Draft', 'Pending'].includes(o.status)) status = 'Pending';

          const prod = o.items?.[0]?.product;
          const empName = o.orderedBy?.name || 'Employee';

          return {
            _id: o._id,
            orderNumber: num,
            employee: empName,
            productName: prod?.name || (o.items?.length ? `${o.items.length} Items` : 'Gift Selection'),
            productImage: prod?.images?.[0] || '',
            status: status,
            eta: o.estimatedDeliveryDate ? new Date(o.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            courier: o.courier || 'Standard Courier',
            trackingNumber: o.trackingNumber || '—',
            timeline: [
              { label: 'Order Placed', time: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), done: true },
              { label: 'Processing & QC', time: 'In Progress', done: ['Shipped', 'Delivered'].includes(status) },
              { label: 'Shipped', time: 'In Transit', done: ['Shipped', 'Delivered'].includes(status) },
              { label: 'Delivered', time: status === 'Delivered' ? 'Completed' : 'Pending', done: status === 'Delivered' },
            ],
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [api]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shipped':
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#FCE8ED] text-[#9B112E]">
            Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#E11D48] text-white">
            Delivered
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827]">
            Processing
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827]">
            Pending
          </span>
        );
    }
  };

  // KPI Metrics counts
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filter Logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.employee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'All' || o.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
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
      {/* Top 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <Clock size={22} className="text-slate-400 flex-shrink-0" />
          <div>
            <div className="text-[20px] font-bold text-slate-900 leading-tight">
              {pendingCount}
            </div>
            <div className="text-[12.5px] text-slate-400 font-medium">Pending</div>
          </div>
        </div>

        {/* Card 2: Processing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <Package size={22} className="text-slate-400 flex-shrink-0" />
          <div>
            <div className="text-[20px] font-bold text-slate-900 leading-tight">
              {processingCount}
            </div>
            <div className="text-[12.5px] text-slate-400 font-medium">Processing</div>
          </div>
        </div>

        {/* Card 3: Shipped */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <Truck size={22} className="text-slate-400 flex-shrink-0" />
          <div>
            <div className="text-[20px] font-bold text-slate-900 leading-tight">
              {shippedCount}
            </div>
            <div className="text-[12.5px] text-slate-400 font-medium">Shipped</div>
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <CheckCircle2 size={22} className="text-slate-400 flex-shrink-0" />
          <div>
            <div className="text-[20px] font-bold text-slate-900 leading-tight">
              {deliveredCount}
            </div>
            <div className="text-[12.5px] text-slate-400 font-medium">Delivered</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or employee..."
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#E11D48] transition-all shadow-2xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[130px] sm:w-[150px]">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-[#E11D48] appearance-none cursor-pointer shadow-2xs"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders List matching Figma cards */}
      <div className="space-y-3.5">
        {filteredOrders.map((order) => {
          const hasCourier = Boolean(order.courier);
          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200"
            >
              {/* Left Side: Thumbnail & Details */}
              <div className="flex items-center gap-4 min-w-0">
                {order.productImage && (
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-[14.5px]">
                      #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">
                    {order.employee} • {order.productName}
                  </div>
                  <div className="text-[12px] text-slate-400">
                    ETA: {order.eta} {order.courier ? `• ${order.courier}` : ''}
                  </div>
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                {hasCourier && (
                  <button
                    type="button"
                    onClick={() => setTrackModalOrder(order)}
                    className="h-9 px-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[12.5px] font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ExternalLink size={14} className="text-slate-600" />
                    <span>Track</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTimelineModalOrder(order)}
                  className="h-9 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[12.5px] font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Timeline
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Track Modal */}
      {trackModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#E11D48]" />
                <h3 className="text-[16px] font-bold text-slate-900">Courier Tracking</h3>
              </div>
              <button
                onClick={() => setTrackModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-slate-900">#{trackModalOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Courier Partner:</span>
                <span className="font-bold text-[#E11D48]">{trackModalOrder.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AWB Tracking Number:</span>
                <span className="font-mono font-semibold text-slate-800">{trackModalOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Delivery:</span>
                <span className="font-bold text-emerald-600">{trackModalOrder.eta}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTrackModalOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] rounded-xl border-none cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Order Status Timeline</h3>
                <p className="text-[12px] text-slate-500">#{timelineModalOrder.orderNumber} • {timelineModalOrder.employee}</p>
              </div>
              <button
                onClick={() => setTimelineModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2 space-y-4">
              {timelineModalOrder.timeline?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        step.done
                          ? 'bg-[#E11D48] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    {idx < timelineModalOrder.timeline.length - 1 && (
                      <div className={`w-0.5 h-7 mt-1 ${step.done ? 'bg-[#E11D48]' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div>
                    <div className={`text-[13px] font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-[11.5px] text-slate-400 mt-0.5">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTimelineModalOrder(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] rounded-xl border-none cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HROrderTracking;
