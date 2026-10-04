import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Lock,
  XCircle,
  AlertTriangle,
  FileText,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const WarehouseDashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();

  // 8 KPI Cards State
  const [stats, setStats] = useState({
    totalInventoryValue: '₹ 0.0 L',
    totalInventoryTrend: '0%',
    availableStock: '0',
    availableStockTrend: '0 items',
    reservedStock: '0',
    reservedStockTrend: '0 orders',
    damagedStock: '0',
    damagedStockTrend: 'review',
    lowStockItems: '0',
    lowStockTrend: 'needs PO',
    pendingPOs: '0',
    pendingPOTrend: '₹ 0.0 L',
    pendingDispatch: '0',
    pendingDispatchTrend: 'live',
    revenueMTD: '₹ 0.0 L',
    revenueMTDTrend: '0%'
  });

  // Low Stock Alerts State
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Recent Orders State
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, inventoryRes, ordersRes] = await Promise.all([
          api.get('/inventory/stats').catch(() => null),
          api.get('/inventory').catch(() => null),
          api.get('/orders').catch(() => null)
        ]);

        if (statsRes && statsRes.data) {
          setStats(prev => ({
            ...prev,
            totalInventoryValue: statsRes.data.totalValue ? `₹ ${(statsRes.data.totalValue / 100000).toFixed(1)} L` : prev.totalInventoryValue,
            availableStock: statsRes.data.availableStock ? statsRes.data.availableStock.toLocaleString() : prev.availableStock,
            reservedStock: statsRes.data.reservedStock ? statsRes.data.reservedStock.toLocaleString() : prev.reservedStock,
            damagedStock: statsRes.data.damagedStock || '0',
            lowStockItems: statsRes.data.lowStockItems || '0',
            pendingPOs: statsRes.data.pendingPOs || '0',
            pendingDispatch: statsRes.data.pendingDispatch || '0',
            revenueMTD: statsRes.data.revenueMTD || '₹ 0.0 L',
          }));
        }

        if (inventoryRes && inventoryRes.data) {
          const invList = Array.isArray(inventoryRes.data) ? inventoryRes.data : inventoryRes.data?.data || [];
          const lowStock = invList
            .filter(item => (item.availableQty || item.quantity || 0) <= (item.reorderLevel || 0) && (item.reorderLevel || 0) > 0)
            .map((item, idx) => ({
              id: item._id || idx,
              name: item.product?.name || item.name || 'Product',
              sku: item.product?.sku || item.sku || 'SKU-000',
              reorder: item.reorderLevel || 0,
              left: item.availableQty || item.quantity || 0,
              isUrgent: (item.availableQty || item.quantity || 0) === 0
            }));

          setLowStockAlerts(lowStock.slice(0, 5));
        }

        if (ordersRes && ordersRes.data) {
          const ordList = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
          const formattedOrders = ordList.slice(0, 5).map(o => ({
            id: o.orderNumber || o._id?.substring(0, 8) || 'SO-000',
            client: o.client?.companyName || o.client?.name || 'Client',
            event: o.eventName || 'Corporate Order',
            value: `₹ ${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
            status: o.status || 'Confirmed',
            statusBg: o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
              o.status === 'Dispatched' ? 'bg-amber-50 text-amber-600' :
              o.status === 'Packed' ? 'bg-purple-50 text-purple-600' :
              'bg-blue-50 text-blue-600'
          }));
          setRecentOrders(formattedOrders);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };

    fetchDashboardData();
  }, [api]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header matching Dashboard.jpg */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Operational overview · inventory, sales & dispatch posture.</p>
        </div>
        <button
          onClick={() => navigate('/wh-sales-order')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Order
        </button>
      </div>

      {/* KPI Grid - 2 Rows x 4 Columns matching Dashboard.jpg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {stats.totalInventoryTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">TOTAL INVENTORY VALUE</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalInventoryValue}</p>
        </div>

        {/* Available Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {stats.availableStockTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">AVAILABLE STOCK</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.availableStock}</p>
        </div>

        {/* Reserved Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <Lock size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {stats.reservedStockTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">RESERVED STOCK</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.reservedStock}</p>
        </div>

        {/* Damaged Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDownRight size={13} /> {stats.damagedStockTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">DAMAGED STOCK</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.damagedStock}</p>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDownRight size={13} /> {stats.lowStockTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">LOW STOCK ITEMS</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.lowStockItems}</p>
        </div>

        {/* Pending Purchase Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <FileText size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {stats.pendingPOTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">PENDING PURCHASE ORDERS</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.pendingPOs}</p>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <Send size={20} />
            </div>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDownRight size={13} /> {stats.pendingDispatchTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">PENDING DISPATCH</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.pendingDispatch}</p>
        </div>

        {/* Revenue MTD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E21D48] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight size={13} /> {stats.revenueMTDTrend}
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4">REVENUE (MTD)</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.revenueMTD}</p>
        </div>
      </div>

      {/* Middle Charts Section matching Dashboard.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Revenue vs Cost Dual Bar Chart matching Dashboard.jpg */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue vs Cost</h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 6 months (₹ in Lakhs)</p>
          </div>

          <div className="h-64 flex pt-6 pb-2 border-b border-slate-100 relative">
            {/* Y Axis Labels */}
            <div className="flex flex-col justify-between text-[11px] font-semibold text-slate-400 pr-3 pb-6">
              <span>60</span>
              <span>45</span>
              <span>30</span>
              <span>15</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end justify-between gap-4 px-4 border-l border-slate-100">
              {[
                { month: 'Jan', revenue: 28, cost: 19 },
                { month: 'Feb', revenue: 31, cost: 21 },
                { month: 'Mar', revenue: 34, cost: 22 },
                { month: 'Apr', revenue: 38, cost: 23 },
                { month: 'May', revenue: 41, cost: 26 },
                { month: 'Jun', revenue: 42, cost: 27 },
              ].map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="flex items-end gap-1.5 w-full justify-center h-full">
                    <div
                      style={{ height: `${(item.revenue / 60) * 100}%` }}
                      className="w-1/2 max-w-[32px] bg-[#E21D48] rounded-t-sm transition-all duration-300 hover:brightness-110"
                      title={`Revenue: ₹${item.revenue}L`}
                    />
                    <div
                      style={{ height: `${(item.cost / 60) * 100}%` }}
                      className="w-1/2 max-w-[32px] bg-rose-100/80 rounded-t-sm transition-all duration-300 hover:bg-rose-200"
                      title={`Cost: ₹${item.cost}L`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#E21D48]"></span>
              <span className="text-xs font-bold text-slate-700">revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-rose-100/80"></span>
              <span className="text-xs font-bold text-slate-700">cost</span>
            </div>
          </div>
        </div>

        {/* Category Mix Donut Chart matching Dashboard.jpg */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category Mix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Share of inventory value</p>
          </div>

          <div className="my-4 flex items-center justify-center relative">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#E21D48" strokeWidth="14" fill="transparent" strokeDasharray="95 144" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="38" stroke="#3B82F6" strokeWidth="14" fill="transparent" strokeDasharray="60 179" strokeDashoffset="-95" />
              <circle cx="50" cy="50" r="38" stroke="#EC4899" strokeWidth="14" fill="transparent" strokeDasharray="45 194" strokeDashoffset="-155" />
              <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="14" fill="transparent" strokeDasharray="30 209" strokeDashoffset="-200" />
              <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="14" fill="transparent" strokeDasharray="15 224" strokeDashoffset="-230" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E21D48]"></span>
              <span>Drinkware</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span>Stationery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]"></span>
              <span>Tech</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
              <span>Bags</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span>Other</span>
            </div>
          </div>
        </div>

      </div>

      {/* Stock Trend & Low Stock Alerts Section matching Dashboard.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Stock Trend Smooth Line Chart matching Dashboard.jpg */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Stock Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Available stock — last 7 days</p>
          </div>

          <div className="h-56 relative pt-4 flex">
            {/* Y Axis Labels matching Dashboard.jpg */}
            <div className="flex flex-col justify-between text-[11px] font-semibold text-slate-400 pr-3 pb-6">
              <span>14000</span>
              <span>10500</span>
              <span>7000</span>
              <span>3500</span>
              <span>0</span>
            </div>

            <div className="flex-1 flex flex-col justify-between border-l border-slate-100 pl-2">
              <div className="h-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E21D48" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#E21D48" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 Q100,30 200,38 T400,28 T600,32 T700,25"
                    fill="none"
                    stroke="#E21D48"
                    strokeWidth="3"
                  />
                  <path
                    d="M0,35 Q100,30 200,38 T400,28 T600,32 T700,25 L700,180 L0,180 Z"
                    fill="url(#stockGradient)"
                  />
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-xs font-semibold text-slate-400 pt-2 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Card matching Dashboard.jpg */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Low Stock Alerts</h3>
            <button
              onClick={() => navigate('/wh-purchase-requisition')}
              className="text-xs font-bold text-slate-700 border border-slate-200 px-3 py-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Reorder
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {lowStockAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-pink-100 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{alert.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{alert.sku} · reorder @ {alert.reorder}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  alert.isUrgent ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {alert.left} left
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Card matching Dashboard.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
          <button
            onClick={() => navigate('/wh-sales-order')}
            className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">ORDER #</th>
                <th className="pb-3 px-3">CLIENT</th>
                <th className="pb-3 px-3">EVENT</th>
                <th className="pb-3 px-3">VALUE</th>
                <th className="pb-3 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#E21D48] cursor-pointer hover:underline" onClick={() => navigate('/wh-sales-order')}>
                    {order.id}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{order.client}</td>
                  <td className="py-3.5 px-3 text-slate-500">{order.event}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{order.value}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${order.statusBg}`}>
                      {order.status}
                    </span>
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

export default WarehouseDashboard;
