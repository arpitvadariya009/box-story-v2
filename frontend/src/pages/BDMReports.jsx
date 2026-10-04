import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Percent,
  Users,
} from 'lucide-react';
import api from '../services/api';

const BDMReports = () => {
  const [period, setPeriod] = useState('Last 6 Month');
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState([
    { label: 'My Revenue', value: '₹0.0L', change: '+0%', up: true, icon: DollarSign },
    { label: 'Total Orders', value: '0', change: '+0%', up: true, icon: ShoppingBag },
    { label: 'Proposal Conversion', value: '0%', change: '+0%', up: true, icon: Percent },
    { label: 'Active Clients', value: '0', change: '+0%', up: true, icon: Users },
  ]);

  const [revenueData, setRevenueData] = useState([]);
  const [conversionData, setConversionData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [returningPct, setReturningPct] = useState(0);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Fetch clients & orders dynamically
        const [clientsRes, ordersRes] = await Promise.all([
          api.get('/clients').catch(() => ({ data: [] })),
          api.get('/orders').catch(() => ({ data: [] }))
        ]);

        const clients = clientsRes.data?.data || clientsRes.data || [];
        const orders = ordersRes.data?.data || ordersRes.data || [];

        const actClients = clients.filter((c) => c.status === 'Active').length;
        const totalOrds = orders.length;

        // Calculate Revenue from delivered / confirmed orders
        const deliveredOrders = orders.filter((o) => ['Delivered', 'Confirmed', 'Dispatched'].includes(o.status));
        const revTotal = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const revLakhs = (revTotal / 100000).toFixed(1);

        // Calculate Proposal Conversion rate
        const approvedOrDelivered = orders.filter((o) => ['Approved', 'Delivered', 'Packed', 'Ready to Ship', 'Dispatched'].includes(o.status)).length;
        const conversionRate = totalOrds > 0 ? Math.round((approvedOrDelivered / totalOrds) * 100) : 0;

        setKpis([
          { label: 'My Revenue', value: `₹${revLakhs}L`, change: `${deliveredOrders.length} delivered`, up: true, icon: DollarSign },
          { label: 'Total Orders', value: totalOrds.toString(), change: `${orders.length} total`, up: true, icon: ShoppingBag },
          { label: 'Proposal Conversion', value: `${conversionRate}%`, change: `${approvedOrDelivered} approved`, up: true, icon: Percent },
          { label: 'Active Clients', value: actClients.toString(), change: `${clients.length} registered`, up: true, icon: Users },
        ]);

        // Build monthly breakdown from real orders
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const last6MonthIndices = Array.from({ length: 6 }, (_, i) => (currentMonthIdx - 5 + i + 12) % 12);

        const dynamicRev = last6MonthIndices.map((mIdx) => {
          const mOrders = orders.filter(o => new Date(o.createdAt || Date.now()).getMonth() === mIdx);
          const mTotal = mOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          return {
            label: months[mIdx],
            value: Math.max(0, Number((mTotal / 100000).toFixed(1)))
          };
        });
        setRevenueData(dynamicRev);

        const dynamicConv = last6MonthIndices.map((mIdx) => {
          const mOrders = orders.filter(o => new Date(o.createdAt || Date.now()).getMonth() === mIdx);
          const approved = mOrders.filter(o => ['Approved', 'Delivered', 'Packed'].includes(o.status)).length;
          return {
            label: months[mIdx],
            sent: mOrders.length,
            approved
          };
        });
        setConversionData(dynamicConv);

        // Calculate top clients based on real order amounts
        if (clients.length > 0) {
          const clientStats = clients.map((client) => {
            const clientOrders = orders.filter((o) => (o.client?._id === client._id || o.client === client._id));
            const revenueSum = clientOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            return {
              name: client.companyName || client.name,
              orders: clientOrders.length,
              tag: clientOrders.length > 1 ? 'Returning' : 'New',
              revenueVal: revenueSum,
              revenue: `₹${(revenueSum / 100000).toFixed(1)}L`,
              change: '+100%',
              up: true
            };
          });

          const sorted = clientStats.sort((a, b) => b.revenueVal - a.revenueVal);
          setTopClients(sorted.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1 })));

          const returningCount = clientStats.filter(c => c.tag === 'Returning').length;
          const totalClientCount = clientStats.length;
          const retPct = totalClientCount > 0 ? Math.round((returningCount / totalClientCount) * 100) : 0;
          setReturningPct(retPct);
        }

      } catch (err) {
        console.error('Failed to load dynamic report details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  return (
    <div className="space-y-6 pb-12 font-['Inter'] bg-[#F8FAFC] min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F1729]">BD Reports</h1>
          <p className="text-[14px] text-[#64748B] mt-0.5">Performance data for your assigned clients</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none pl-3.5 pr-9 py-2 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] font-semibold bg-white cursor-pointer focus:outline-none"
            >
              {['Last 6 Month', 'Last 3 Month', 'Last Month', 'This Year'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] hover:bg-[#F8FAFC] font-semibold transition-colors cursor-pointer bg-white">
            <Download size={14} />
            PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] hover:bg-[#F8FAFC] font-semibold transition-colors cursor-pointer bg-white">
            <FileSpreadsheet size={14} />
            Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#64748B] font-semibold">
          Loading report calculations...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-[#F1F5F9] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-[#878787] uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-[28px] font-bold text-[#1A1A1A] mt-1 leading-tight">{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-2.5">
                        {kpi.up ? <TrendingUp size={14} color="#10B981" /> : <TrendingDown size={14} color="#EF4444" />}
                        <span className={`text-[12px] font-semibold ${kpi.up ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {kpi.change}
                        </span>
                        <span className="text-[11px] text-[#94A3B8] font-medium">vs prev period</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#FDEDEE] flex items-center justify-center shrink-0">
                      <Icon size={20} color="#D90B37" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#0F1729]">My Clients Revenue</h3>
              <p className="text-[13px] text-[#94A3B8] mt-0.5">Monthly revenue from assigned clients (in Lakhs)</p>
              <div className="h-[220px] mt-6">
                <SmoothLineChart data={revenueData} />
              </div>
            </div>

            {/* Proposal Conversion */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F1729]">Proposal Conversion Rate</h3>
                  <p className="text-[13px] text-[#94A3B8] mt-0.5">Proposals sent vs approved per month</p>
                </div>
                <div className="flex items-center gap-4 text-[12px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#E2E8F0]" />
                    <span className="text-[#64748B]">Sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#D90B37]" />
                    <span className="text-[#64748B]">Approved</span>
                  </div>
                </div>
              </div>
              <div className="h-[220px] mt-6">
                <DoubleBarChart data={conversionData} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            {/* Donut Chart */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#0F1729]">New vs Returning Clients</h3>
                <p className="text-[13px] text-[#94A3B8] mt-0.5">Client distribution breakdown</p>
              </div>
              <div className="my-6">
                <DonutChart returningPct={returningPct} />
              </div>
              <div className="flex items-center justify-center gap-6 border-t border-[#F8FAFC] pt-4 text-[13px] font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D90B37]" />
                  <span className="text-[#64748B]">Returning: {returningPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E2E8F0]" />
                  <span className="text-[#64748B]">New: {100 - returningPct}%</span>
                </div>
              </div>
            </div>

            {/* Top Performing Clients */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#0F1729]">Top Performing Clients</h3>
              <p className="text-[13px] text-[#94A3B8] mt-0.5">Ranked by revenue contribution</p>
              <div className="space-y-4 mt-6">
                {topClients.map((client) => (
                  <div key={client.rank} className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#FDEDEE] flex items-center justify-center text-[13px] font-bold text-[#D90B37] shrink-0">
                        {client.rank}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#0F1729]">{client.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[12px] text-[#94A3B8] font-medium">{client.orders} orders</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              background: client.tag === 'New' ? '#EAF8F2' : '#FFF3EB',
                              color: client.tag === 'New' ? '#10B981' : '#FF852D',
                            }}
                          >
                            {client.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-extrabold text-[#0F1729]">{client.revenue}</p>
                      <p className={`text-[12px] font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                        client.up === true ? 'text-[#10B981]' : client.up === false ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                      }`}>
                        {client.up === true ? '↑' : client.up === false ? '↓' : ''} {client.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BDMReports;
