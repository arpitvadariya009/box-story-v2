import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  IndianRupee,
  Package,
  Clock,
  CheckCircle2,
  Gift,
  Truck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

const CorporateHRDashboard = () => {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (api) {
          const res = await api.get('/dashboard');
          if (res.data) {
            setData(res.data);
          }
        }
      } catch (err) {
        console.warn('Using fallback data for Corporate HR Manager dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E11D48]"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalEmployees: 0,
    employeesChange: '0 Registered',
    participationRate: 0,
    participationChange: '0 submitted',
    budgetUtilised: '₹0',
    budgetAllocated: '₹0 allocated',
    budgetUsedAmount: 0,
    budgetTotalAmount: 0,
    budgetPercentage: 0,
    avgPerEmployee: '₹0',
    budgetRemaining: '₹0',
    productsSelected: 0,
    productsPending: 0,
    ordersPlacedCount: 0,
  };

  const participationTrend = data?.participationTrend || [];
  const productBreakdown = data?.productBreakdown || [];
  const notifications = data?.notifications || [];
  const recentOrders = data?.recentOrders || [];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('ship') || s.includes('transit') || s.includes('dispatch')) {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-[12px] font-semibold bg-[#FCE8ED] text-[#9B112E] tracking-normal">
          Shipped
        </span>
      );
    }
    if (s.includes('deliver')) {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-[12px] font-semibold bg-[#E11D48] text-white tracking-normal">
          Delivered
        </span>
      );
    }
    if (s.includes('process') || s.includes('pack') || s.includes('prod') || s.includes('design')) {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827] tracking-normal">
          Processing
        </span>
      );
    }
    if (s.includes('pend') || s.includes('draft') || s.includes('approv')) {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827] tracking-normal">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827] tracking-normal">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter'] w-full">
      {/* 1. Top Row: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-500">Total Employees</span>
            <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[26px] font-bold text-slate-900 leading-tight">
              {metrics.totalEmployees}
            </h3>
            <p className="text-[12px] font-medium text-[#10B77F] mt-1">
              {metrics.employeesChange}
            </p>
          </div>
        </div>

        {/* Card 2: Participation Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-500">Participation Rate</span>
            <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[26px] font-bold text-slate-900 leading-tight">
              {metrics.participationRate}%
            </h3>
            <p className="text-[12px] font-medium text-[#10B77F] mt-1">
              {metrics.participationChange}
            </p>
          </div>
        </div>

        {/* Card 3: Budget Utilised */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-500">Budget Utilised</span>
            <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <span className="text-[18px] font-bold">₹</span>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[26px] font-bold text-slate-900 leading-tight">
              {metrics.budgetUtilised}
            </h3>
            <p className="text-[12px] font-normal text-slate-500 mt-1">
              {metrics.budgetAllocated}
            </p>
          </div>
        </div>

        {/* Card 4: Products Selected */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-500">Products Selected</span>
            <div className="w-10 h-10 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[26px] font-bold text-slate-900 leading-tight">
              {metrics.productsSelected}
            </h3>
            <p className="text-[12px] font-normal text-slate-500 mt-1">
              {metrics.productsPending} pending
            </p>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Participation Trend (Bar Chart) & Product Breakdown (Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Employee Participation Trend (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
          <h3 className="text-[15px] font-bold text-slate-900">
            Employee Participation Trend
          </h3>

          <div className="w-full h-[240px] mt-4 relative">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 210"
              preserveAspectRatio="none"
              className="overflow-visible text-[11px] text-slate-400 font-sans"
            >
              {/* Vertical dotted grid lines between columns */}
              {[1, 2, 3].map((colIdx) => {
                const dividerX = 42 + colIdx * 137;
                return (
                  <line
                    key={colIdx}
                    x1={dividerX}
                    y1="20"
                    x2={dividerX}
                    y2="180"
                    stroke="#E2E8F0"
                    strokeDasharray="2 3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Horizontal Grid lines and Y labels */}
              {[
                { val: 160, y: 20 },
                { val: 120, y: 60 },
                { val: 80, y: 100 },
                { val: 40, y: 140 },
                { val: 0, y: 180 },
              ].map((item) => (
                <g key={item.val}>
                  {/* Y-Axis Label */}
                  <text
                    x="32"
                    y={item.y + 4}
                    textAnchor="end"
                    fill="#64748B"
                    className="text-[11.5px] font-normal"
                  >
                    {item.val}
                  </text>
                  {/* Tick Mark on Y-Axis */}
                  <line
                    x1="38"
                    y1={item.y}
                    x2="42"
                    y2={item.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                  {/* Horizontal Grid Line (only for grid above baseline) */}
                  {item.val > 0 && (
                    <line
                      x1="42"
                      y1={item.y}
                      x2="590"
                      y2={item.y}
                      stroke="#E2E8F0"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                    />
                  )}
                </g>
              ))}

              {/* Solid Left Y-Axis line */}
              <line
                x1="42"
                y1="20"
                x2="42"
                y2="180"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* Solid Bottom Baseline X-Axis line */}
              <line
                x1="42"
                y1="180"
                x2="590"
                y2="180"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* Bars with Flat Bottom and subtle top-only border-radius */}
              {participationTrend.map((item, index) => {
                const slotWidth = 137;
                const barWidth = 98;
                const x = 42 + index * slotWidth + (slotWidth - barWidth) / 2;
                const baseline = 180;
                const maxVal = 160;
                const barHeight = Math.max((item.count / maxVal) * 160, 4);
                const y = baseline - barHeight;
                const r = 4; // Top corner radius only

                // SVG Path with flat bottom (0 radius at baseline) and rounded top
                const pathData = `
                  M ${x} ${baseline}
                  L ${x} ${y + r}
                  Q ${x} ${y} ${x + r} ${y}
                  L ${x + barWidth - r} ${y}
                  Q ${x + barWidth} ${y} ${x + barWidth} ${y + r}
                  L ${x + barWidth} ${baseline}
                  Z
                `;

                return (
                  <g key={item.week}>
                    {/* Bar Path */}
                    <path
                      d={pathData}
                      fill="#E11D48"
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    />
                    {/* X-Axis Label */}
                    <text
                      x={42 + index * slotWidth + slotWidth / 2}
                      y="198"
                      textAnchor="middle"
                      fill="#64748B"
                      className="text-[12px] font-normal"
                    >
                      {item.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Product Breakdown (Donut Chart) (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
          <h3 className="text-[15px] font-bold text-slate-900">
            Product Breakdown
          </h3>

          {/* Donut Chart SVG */}
          <div className="flex items-center justify-center my-auto py-2">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F8FAFC"
                  strokeWidth="16"
                />
                {/* Segment 1: Hampers (35%) -> strokeDasharray="77 220" */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E11D48"
                  strokeWidth="16"
                  strokeDasharray="83.5 238.7"
                  strokeDashoffset="0"
                />
                {/* Segment 2: Electronics (25%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F43F5E"
                  strokeWidth="16"
                  strokeDasharray="59.6 238.7"
                  strokeDashoffset="-83.5"
                />
                {/* Segment 3: Wellness (20%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FDA4AF"
                  strokeWidth="16"
                  strokeDasharray="47.7 238.7"
                  strokeDashoffset="-143.1"
                />
                {/* Segment 4: Stationery (20%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FFE4E6"
                  strokeWidth="16"
                  strokeDasharray="47.7 238.7"
                  strokeDashoffset="-190.8"
                />
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-[13px] pt-2 border-t border-slate-100">
            {productBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium">{item.category}</span>
                </div>
                <span className="font-bold text-slate-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Lower Row: Budget Utilisation & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Budget Utilisation (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Budget Utilisation
            </h3>
            <div className="flex items-center justify-between text-[13px] mt-2.5">
              <span className="text-slate-500 font-normal">
                ₹{metrics.budgetUsedAmount ? metrics.budgetUsedAmount.toLocaleString('en-IN') : '4,20,000'} of ₹{metrics.budgetTotalAmount ? metrics.budgetTotalAmount.toLocaleString('en-IN') : '5,50,000'} used
              </span>
              <span className="font-bold text-slate-900">
                {metrics.budgetPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#FCE8ED] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#E11D48] rounded-full transition-all duration-500"
                style={{ width: `${metrics.budgetPercentage}%` }}
              />
            </div>
          </div>

          {/* 3 Summary Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-[#FDEDEE]/70 border border-rose-100/50 rounded-xl p-3.5 text-center">
              <span className="text-[16px] font-bold text-slate-900 block leading-tight">
                {metrics.avgPerEmployee}
              </span>
              <span className="text-[11.5px] text-slate-500 font-medium block mt-1">
                Avg. per employee
              </span>
            </div>

            <div className="bg-[#FDEDEE]/70 border border-rose-100/50 rounded-xl p-3.5 text-center">
              <span className="text-[16px] font-bold text-slate-900 block leading-tight">
                {metrics.budgetRemaining}
              </span>
              <span className="text-[11.5px] text-slate-500 font-medium block mt-1">
                Remaining
              </span>
            </div>

            <div className="bg-[#FDEDEE]/70 border border-rose-100/50 rounded-xl p-3.5 text-center">
              <span className="text-[16px] font-bold text-slate-900 block leading-tight">
                {metrics.ordersPlacedCount}
              </span>
              <span className="text-[11.5px] text-slate-500 font-medium block mt-1">
                Orders placed
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-900">
              Notifications
            </h3>
            <Link
              to="/notifications"
              className="text-[12px] font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors no-underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Notification 1 */}
            <div className="bg-[#FFF8F8] border border-rose-100/80 rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-rose-50/40">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={14} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[12.5px] font-semibold text-slate-900 leading-tight">
                  12 employees haven't selected gifts yet
                </p>
                <span className="text-[11px] text-slate-400 block mt-0.5">2h ago</span>
              </div>
            </div>

            {/* Notification 2 */}
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package size={14} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[12.5px] font-semibold text-slate-900 leading-tight">
                  New products added to catalogue
                </p>
                <span className="text-[11px] text-slate-400 block mt-0.5">5h ago</span>
              </div>
            </div>

            {/* Notification 3 */}
            <div className="bg-[#F0FDF4]/70 border border-emerald-100 rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-emerald-50/50">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck size={14} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[12.5px] font-semibold text-slate-900 leading-tight">
                  Order #1042 has been shipped
                </p>
                <span className="text-[11px] text-slate-400 block mt-0.5">1d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-[15px] font-bold text-slate-900">
          Recent Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[12px] font-medium">
                <th className="pb-3 font-medium text-left">Order ID</th>
                <th className="pb-3 font-medium text-left">Employee</th>
                <th className="pb-3 font-medium text-left">Product</th>
                <th className="pb-3 font-medium text-left">Status</th>
                <th className="pb-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {recentOrders.map((order, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 font-bold text-slate-900">
                    {order.id}
                  </td>
                  <td className="py-3.5 text-slate-700 font-medium">
                    {order.employee}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {order.product}
                  </td>
                  <td className="py-3.5">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3.5 text-right text-slate-500 font-medium text-[12.5px]">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CorporateHRDashboard;
