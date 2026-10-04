import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  Send,
  X,
  Phone,
  Check,
  Hash,
  Calendar
} from 'lucide-react';

const EmployeeOrderTracking = () => {
  const { user, api } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Report Issue Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!api) return;
      try {
        const res = await api.get('/gift-selections');
        if (res.data && res.data.length > 0) {
          const myOrder = res.data[0];
          setOrder(myOrder);
        }
      } catch (err) {
        console.warn('Using default employee tracking info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [api]);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIssueSubmitted(true);
    setTimeout(() => {
      setIssueSubmitted(false);
      setShowReportModal(false);
      setIssueText('');
    }, 2000);
  };

  const currentStatus = order?.status || 'Submitted';
  const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

  const statusIndexMap = {
    'Submitted': 1,
    'Pending Approval': 1,
    'Approved': 2,
    'Processing': 2,
    'In Progress': 2,
    'Shipped': 3,
    'Dispatched': 3,
    'Out for Delivery': 4,
    'Delivered': 5,
  };
  const activeStepIdx = statusIndexMap[currentStatus] || 1;

  const steps = [
    {
      id: 1,
      title: 'Order Confirmed',
      date: orderDate,
      status: activeStepIdx >= 1 ? 'Completed' : 'Pending',
      icon: CheckCircle2,
      completed: activeStepIdx >= 1,
    },
    {
      id: 2,
      title: 'Being Prepared',
      date: activeStepIdx >= 2 ? 'In Progress' : 'Pending',
      status: activeStepIdx >= 2 ? 'Completed' : 'Pending',
      icon: Package,
      completed: activeStepIdx >= 2,
    },
    {
      id: 3,
      title: 'Shipped',
      date: activeStepIdx >= 3 ? 'Shipped' : 'Pending',
      status: activeStepIdx >= 3 ? 'Completed' : 'Pending',
      icon: Truck,
      completed: activeStepIdx >= 3,
    },
    {
      id: 4,
      title: 'Out for Delivery',
      date: activeStepIdx >= 4 ? 'Out for Delivery' : 'Pending',
      status: activeStepIdx >= 4 ? 'Completed' : 'Pending',
      icon: MapPin,
      completed: activeStepIdx >= 4,
    },
    {
      id: 5,
      title: 'Delivered',
      date: activeStepIdx >= 5 ? 'Delivered' : 'Pending',
      status: activeStepIdx >= 5 ? 'Completed' : 'Pending',
      icon: Check,
      completed: activeStepIdx >= 5,
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* 1. Top Status Banner */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <Package size={22} />
          </div>
          <div>
            <h2 className="text-[15.5px] font-bold text-slate-900 leading-tight">
              {currentStatus}
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              {order?.selectedProducts?.[0]?.product?.name ? `Gift: ${order.selectedProducts[0].product.name}` : 'Your gift order is in process'}
            </p>
          </div>
        </div>

        <div className="bg-[#EA580C] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-2xs flex-shrink-0">
          Step {activeStepIdx} of 5
        </div>
      </div>

      {/* 2. Main Tracking Grid (2 Columns on Desktop, 1 Column on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Delivery Timeline */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
          <h3 className="text-[15.5px] font-bold text-slate-900">
            Delivery Timeline
          </h3>

          <div className="relative pl-1">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
                  {/* Connecting Vertical Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-4 top-8 -bottom-1 w-[2px] -translate-x-1/2 ${
                        step.completed && steps[idx + 1].completed
                          ? 'bg-[#E11D48]'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Step Icon Circle */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      step.completed
                        ? 'bg-[#E11D48] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Step Info & Status */}
                  <div className="flex items-center justify-between w-full pt-0.5">
                    <div>
                      <h4
                        className={`text-[13.5px] leading-tight ${
                          step.completed
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-600'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <span className="text-[12px] text-slate-400 block mt-0.5">
                        {step.date}
                      </span>
                    </div>

                    {step.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/60 shadow-2xs">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Details, Delivery Address & Need Help */}
        <div className="lg:col-span-5 space-y-5">
          {/* Order Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-slate-900 mb-4">
              Order Details
            </h3>

            <div className="divide-y divide-slate-100 text-[14px]">
              <div className="flex items-center justify-between py-3.5 first:pt-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Hash size={18} className="stroke-[1.75]" />
                  <span className="text-slate-500 font-normal">Reference:</span>
                </div>
                <span className="font-semibold text-slate-900 tracking-wide">
                  {order?._id ? `GFT-${order._id.substring(order._id.length - 6).toUpperCase()}` : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Calendar size={18} className="stroke-[1.75]" />
                  <span className="text-slate-500 font-normal">Order Date:</span>
                </div>
                <span className="font-semibold text-slate-900">{orderDate}</span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Truck size={18} className="stroke-[1.75]" />
                  <span className="text-slate-500 font-normal">Courier:</span>
                </div>
                <span className="font-semibold text-slate-900">{order?.courier || 'Awaiting dispatch'}</span>
              </div>

              <div className="flex items-center justify-between py-3.5 last:pb-1">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <Package size={18} className="stroke-[1.75]" />
                  <span className="text-slate-500 font-normal">Tracking:</span>
                </div>
                <span className="font-semibold text-slate-900">{order?.trackingNumber || '—'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2.5">
            <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin size={15} className="text-[#E11D48]" />
              <span>Delivery Address</span>
            </h4>
            <div className="text-[13px] text-slate-600 leading-relaxed pl-5">
              {order?.deliveryAddress?.street ? (
                <>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} {order.deliveryAddress.zipCode ? `- ${order.deliveryAddress.zipCode}` : ''}</p>
                </>
              ) : (
                <p className="text-slate-400 italic">No delivery address specified yet</p>
              )}
              {user?.phone && (
                <p className="text-slate-500 text-[12px] mt-1.5 flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Need Help? Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div>
              <h4 className="text-[14px] font-bold text-slate-900">
                Need Help?
              </h4>
              <p className="text-[12.5px] text-slate-500 mt-1 leading-snug">
                Facing any issues with your order? Report it and our team will assist you.
              </p>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50/60 border border-[#E11D48] text-[#E11D48] text-[13px] font-semibold py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <AlertTriangle size={15} />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-[#E11D48]" />
                <h3 className="text-[15px] font-bold text-slate-900">Report an Issue</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              {issueSubmitted ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900">Issue Reported</h4>
                  <p className="text-[12.5px] text-slate-500">
                    Our support team has received your ticket and will update you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[12.5px] font-semibold text-slate-700">
                      Describe what happened:
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                      placeholder="e.g. Address change request, delivery timeframe inquiry..."
                      className="w-full p-3 text-[13px] border border-slate-200 rounded-xl outline-none focus:border-[#E11D48] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13px] font-semibold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer border-none"
                  >
                    <Send size={15} />
                    <span>Submit Issue Report</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeOrderTracking;
