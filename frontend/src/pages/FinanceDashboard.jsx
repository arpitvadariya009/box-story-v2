import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Clock, AlertCircle, DollarSign } from 'lucide-react';

const STATUS_COLORS = {
  Paid: 'bg-[#E2FBE9] text-[#10B77F]',
  Pending: 'bg-[#FFF3E0] text-[#FF9900]',
  Overdue: 'bg-[#FCE8ED] text-[#E21D48]',
  Draft: 'bg-slate-100 text-slate-500',
  Sent: 'bg-[#FFF3E0] text-[#FF9900]',
};

const FinanceDashboard = () => {
  const { api } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [payablesTotal, setPayablesTotal] = useState(0);
  const [payablesCount, setPayablesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [invRes, poRes] = await Promise.all([
        api.get('/invoices').catch(() => ({ data: [] })),
        api.get('/purchase-orders').catch(() => ({ data: [] })),
      ]);

      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);

      if (Array.isArray(poRes.data)) {
        const pendingPOs = poRes.data.filter((po) =>
          ['Pending Approval', 'Approved', 'Sent to Vendor'].includes(po.status)
        );
        const totalP = pendingPOs.reduce((acc, po) => acc + (po.totalAmount || 0), 0);
        setPayablesTotal(totalP);
        setPayablesCount(pendingPOs.length);
      }
    } catch (error) {
      console.error('Error fetching financial dashboard:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  /* Dynamic Computations */
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Sent' || i.status === 'Unpaid');
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');

  const totalRevenueVal = paidInvoices.reduce((acc, i) => acc + (i.totalAmount || i.amount || i.amountDue || 0), 0);
  const receivablesVal = pendingInvoices.reduce((acc, i) => acc + (i.totalAmount || i.amount || i.amountDue || 0), 0);
  const overdueVal = overdueInvoices.reduce((acc, i) => acc + (i.totalAmount || i.amount || i.amountDue || 0), 0);

  const formatLakhs = (num) => {
    if (!num) return '₹0';
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatINR = (val) =>
    val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0';

  /* Donut Chart Percentages */
  const totalCount = paidInvoices.length + pendingInvoices.length + overdueInvoices.length || 0;
  const paidPct = totalCount > 0 ? Math.round((paidInvoices.length / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingInvoices.length / totalCount) * 100) : 0;
  const overduePct = totalCount > 0 ? Math.max(0, 100 - paidPct - pendingPct) : 0;

  /* SVG Donut Calculations (Circumference ~314) */
  const circumference = 314;
  const paidStroke = totalCount > 0 ? (paidPct / 100) * circumference : 0;
  const pendingStroke = totalCount > 0 ? (pendingPct / 100) * circumference : 0;
  const overdueStroke = totalCount > 0 ? (overduePct / 100) * circumference : 0;

  // State for Chart Hover Tooltips
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const paymentStats = {
    Paid: {
      label: 'Paid',
      count: paidInvoices.length,
      percentage: paidPct,
      amount: totalRevenueVal,
      color: '#10B77F',
      bgClass: 'bg-[#10B77F]',
    },
    Pending: {
      label: 'Pending',
      count: pendingInvoices.length,
      percentage: pendingPct,
      amount: receivablesVal,
      color: '#FF9900',
      bgClass: 'bg-[#FF9900]',
    },
    Overdue: {
      label: 'Overdue',
      count: overdueInvoices.length,
      percentage: overduePct,
      amount: overdueVal,
      color: '#E11D48',
      bgClass: 'bg-[#E11D48]',
    },
  };
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyFinanceData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    const mYear = d.getFullYear();
    const mMonth = d.getMonth();

    const mRevenue = paidInvoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt || inv.issueDate || inv.date);
        return invDate.getFullYear() === mYear && invDate.getMonth() === mMonth;
      })
      .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

    const mExpenses = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt || inv.issueDate || inv.date);
        return invDate.getFullYear() === mYear && invDate.getMonth() === mMonth;
      })
      .reduce((sum, inv) => sum + (inv.amountDue || 0), 0);

    monthlyFinanceData.push({
      month: mName,
      revenue: mRevenue,
      expenses: mExpenses,
    });
  }

  const maxMonthlyVal = Math.max(
    ...monthlyFinanceData.map((d) => Math.max(d.revenue, d.expenses)),
    50000
  );

  return (
    <div className="space-y-6 pb-12 font-['Inter']">

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* 1. Total Revenue (FY) */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-wider block">
              Total Revenue (FY)
            </span>
            <span className="text-3xl font-bold text-[#0F1729] mt-1 block">
              {formatLakhs(totalRevenueVal)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1.5 block">
              {paidInvoices.length} paid invoices
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D90B37] font-bold text-lg flex-shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        {/* 2. Receivables */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-wider block">
              Receivables
            </span>
            <span className="text-3xl font-bold text-[#0F1729] mt-1 block">
              {formatLakhs(receivablesVal)}
            </span>
            <span className="text-[11px] font-semibold text-[#878787] mt-1.5 block">
              {pendingInvoices.length} pending invoices
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* 3. Payables */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-wider block">
              Payables
            </span>
            <span className="text-3xl font-bold text-[#0F1729] mt-1 block">
              {formatLakhs(payablesTotal)}
            </span>
            <span className="text-[11px] font-semibold text-[#878787] mt-1.5 block">
              {payablesCount} vendor payments due
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* 4. Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEDED] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-wider block">
              Overdue
            </span>
            <span className="text-3xl font-bold text-[#0F1729] mt-1 block">
              {formatLakhs(overdueVal)}
            </span>
            <span className="text-[11px] font-semibold text-[#D90B37] mt-1.5 block">
              {overdueInvoices.length} invoices overdue
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <AlertCircle size={20} />
          </div>
        </div>

      </div>

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Column 1: Revenue vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EDEDED] p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-[#0F1729]">Revenue vs Expenses</h3>
          </div>

          <div className="relative w-full flex items-start gap-4">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-[200px] text-[11px] font-semibold text-[#878787] w-14 text-right pr-2">
              <span>{formatLakhs(maxMonthlyVal)}</span>
              <span>{formatLakhs(maxMonthlyVal * 0.75)}</span>
              <span>{formatLakhs(maxMonthlyVal * 0.5)}</span>
              <span>{formatLakhs(maxMonthlyVal * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Grid & Bars Container */}
            <div className="flex-grow relative h-[218px]">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-x-0 top-0 bottom-[18px] flex flex-col justify-between pointer-events-none">
                <div className="border-t border-dashed border-[#F0F0F0] w-full"></div>
                <div className="border-t border-dashed border-[#F0F0F0] w-full"></div>
                <div className="border-t border-dashed border-[#F0F0F0] w-full"></div>
                <div className="border-t border-dashed border-[#F0F0F0] w-full"></div>
                <div className="border-b border-[#E3E3E3] w-full"></div>
              </div>

              {/* Bars container */}
              <div className="relative z-10 w-full h-[200px] flex items-end justify-around">
                {monthlyFinanceData.map((d, i) => {
                  const revHeight = maxMonthlyVal > 0 ? `${Math.min(100, (d.revenue / maxMonthlyVal) * 100)}%` : '0%';
                  const expHeight = maxMonthlyVal > 0 ? `${Math.min(100, (d.expenses / maxMonthlyVal) * 100)}%` : '0%';
                  const isHovered = hoveredBarIndex === i;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center w-20 cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      <div className="flex items-end justify-center gap-1.5 h-[180px] w-full">
                        {/* Revenue Bar */}
                        <div
                          style={{ height: revHeight }}
                          className={`w-[26px] bg-[#E11D48] hover:bg-[#D90B37] transition-all rounded-t-sm ${isHovered ? 'brightness-110 shadow-md ring-2 ring-[#E11D48]/30' : ''}`}
                        />

                        {/* Expenses Bar */}
                        <div
                          style={{ height: expHeight }}
                          className={`w-[26px] bg-[#E5E7EB] hover:bg-[#CBD5E1] transition-all rounded-t-sm ${isHovered ? 'brightness-95 shadow-md' : ''}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Tooltip Box (Exact Dashboard Style) */}
              {hoveredBarIndex !== null && monthlyFinanceData[hoveredBarIndex] && (
                <div
                  className="absolute z-30 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3.5 text-[12px] min-w-[210px] pointer-events-none transition-all duration-75 ease-out"
                  style={{
                    left: `${((hoveredBarIndex + 0.5) / monthlyFinanceData.length) * 100}%`,
                    top: '10%',
                    transform: hoveredBarIndex >= (monthlyFinanceData.length / 2)
                      ? 'translate(-105%, -10%)'
                      : 'translate(5%, -10%)',
                  }}
                >
                  <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2">
                    {monthlyFinanceData[hoveredBarIndex].month} Financial Overview
                  </div>
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between items-center text-[#64748B]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E11D48]"></span>
                        Revenue
                      </span>
                      <span className="font-bold text-[#E21D48] text-[13px]">
                        {formatINR(monthlyFinanceData[hoveredBarIndex].revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#64748B]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>
                        Expenses
                      </span>
                      <span className="font-semibold text-[#0F1729]">
                        {formatINR(monthlyFinanceData[hoveredBarIndex].expenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                      <span>Net Balance</span>
                      <span className={`font-semibold ${monthlyFinanceData[hoveredBarIndex].revenue - monthlyFinanceData[hoveredBarIndex].expenses >= 0 ? 'text-[#10B77F]' : 'text-[#E11D48]'}`}>
                        {formatINR(monthlyFinanceData[hoveredBarIndex].revenue - monthlyFinanceData[hoveredBarIndex].expenses)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* X-Axis labels */}
              <div className="absolute inset-x-0 bottom-0 h-[18px] flex justify-around items-center text-[11px] font-semibold text-[#878787]">
                {monthlyFinanceData.map((d) => (
                  <span key={d.month} className="w-20 text-center">{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Payment Status Donut Chart with Interactive Hover Tooltip */}
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-6 shadow-sm flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-[#0F1729]">Payment Status</h3>
            {hoveredSegment && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0F1729] animate-fade-in">
                {hoveredSegment}: {paymentStats[hoveredSegment].count} ({paymentStats[hoveredSegment].percentage}%)
              </span>
            )}
          </div>

          {/* Donut chart container with interactive hover tooltip */}
          <div className="flex items-center justify-center h-48 relative my-1">
            
            {/* Floating Hover Tooltip Box (Exact Dashboard Style) */}
            {hoveredSegment && (
              <div className="absolute -top-3 z-30 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3 text-[12px] min-w-[200px] pointer-events-none transition-all duration-75 ease-out animate-fade-in">
                <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: paymentStats[hoveredSegment].color }}></span>
                  <span>{paymentStats[hoveredSegment].label} Invoices</span>
                </div>
                <div className="space-y-1 font-medium">
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Invoices Count</span>
                    <span className="font-semibold text-[#0F1729]">{paymentStats[hoveredSegment].count} ({paymentStats[hoveredSegment].percentage}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B] pt-1 border-t border-[#F1F5F9]">
                    <span>Total Value</span>
                    <span className="font-bold text-[#E21D48]">
                      {formatINR(paymentStats[hoveredSegment].amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
              {/* Paid: Green (#10B77F) */}
              <circle
                cx="85"
                cy="85"
                r="50"
                fill="transparent"
                stroke="#10B77F"
                strokeWidth={hoveredSegment === 'Paid' ? '24' : '18'}
                strokeDasharray={`${paidStroke} ${circumference}`}
                strokeDashoffset="0"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('Paid')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              {/* Pending: Orange (#FF9900) */}
              <circle
                cx="85"
                cy="85"
                r="50"
                fill="transparent"
                stroke="#FF9900"
                strokeWidth={hoveredSegment === 'Pending' ? '24' : '18'}
                strokeDasharray={`${pendingStroke} ${circumference}`}
                strokeDashoffset={`-${paidStroke}`}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('Pending')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              {/* Overdue: Red (#E11D48) */}
              <circle
                cx="85"
                cy="85"
                r="50"
                fill="transparent"
                stroke="#E11D48"
                strokeWidth={hoveredSegment === 'Overdue' ? '24' : '18'}
                strokeDasharray={`${overdueStroke} ${circumference}`}
                strokeDashoffset={`-${paidStroke + pendingStroke}`}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('Overdue')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              {/* Inner white circle for donut hole */}
              <circle cx="85" cy="85" r="38" fill="#FFFFFF" />
            </svg>

            {/* Dynamic Center Label inside Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {hoveredSegment ? (
                <>
                  <span className="text-[10px] font-semibold text-[#878787] uppercase tracking-wider">
                    {hoveredSegment}
                  </span>
                  <span className="text-base font-bold text-[#0F1729] leading-none mt-0.5">
                    {paymentStats[hoveredSegment].percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {paymentStats[hoveredSegment].count} inv
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold text-[#878787] uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#0F1729] leading-none mt-0.5">
                    {totalCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Invoices
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend matching Figma with hover highlighting & tooltips */}
          <div className="flex items-center justify-center gap-4 mt-3 pb-1 text-[12px] font-semibold text-[#545454]">
            {['Paid', 'Pending', 'Overdue'].map((statusKey) => {
              const stat = paymentStats[statusKey];
              const isHovered = hoveredSegment === statusKey;
              return (
                <div
                  key={statusKey}
                  onMouseEnter={() => setHoveredSegment(statusKey)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    isHovered ? 'bg-slate-100 shadow-sm scale-105' : 'hover:bg-slate-50'
                  }`}
                  title={`${stat.label}: ${stat.count} (${stat.percentage}%) - ${formatINR(stat.amount)}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-transform"
                    style={{ backgroundColor: stat.color }}
                  ></span>
                  <span className={isHovered ? 'text-[#0F1729] font-bold' : 'text-[#545454]'}>
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-[#878787] font-normal">
                    ({stat.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Transactions Table â€” Strictly matching Image 36 */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F6F6F9]">
          <h3 className="text-[15px] font-bold text-[#0F1729]">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F1F5F9] text-[11px] font-semibold uppercase tracking-wider text-[#878787]">
                {['CLIENT', 'INVOICE', 'AMOUNT', 'STATUS', 'DATE'].map((h) => (
                  <th key={h} className="px-6 py-3.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13.5px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#878787]">
                    No recent transactions found
                  </td>
                </tr>
              ) : (
                invoices.map((item) => (
                  <tr key={item._id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* CLIENT */}
                    <td className="px-6 py-4 font-semibold text-[#0F1729]">
                      {item.client?.companyName || item.client || 'â€”'}
                    </td>
                    {/* INVOICE */}
                    <td className="px-6 py-4 font-semibold text-[#D90B37] cursor-pointer hover:underline">
                      {item.invoiceNumber || 'â€”'}
                    </td>
                    {/* AMOUNT */}
                    <td className="px-6 py-4 font-bold text-[#0F1729]">
                      {formatINR(item.totalAmount || item.amount)}
                    </td>
                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    {/* DATE */}
                    <td className="px-6 py-4 text-[#878787]">
                      {item.date || (item.issueDate ? new Date(item.issueDate).toLocaleDateString('en-CA') : 'â€”')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboard;
