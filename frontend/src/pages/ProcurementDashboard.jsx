import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  Wallet,
  ArrowRight,
  ShoppingCart,
  Package,
} from 'lucide-react';

const statusConfig = {
  Approved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Approved' },
  Raised: { bg: 'bg-amber-50', text: 'text-amber-500', label: 'Raised' },
  Received: { bg: 'bg-green-50', text: 'text-green-600', label: 'Received' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-500', label: 'Rejected' },
  'Pending Approval': { bg: 'bg-amber-50', text: 'text-amber-500', label: 'Pending' },
};

const ProcurementDashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openPOs: 0,
    openPOsChange: 'Live count',
    deliveriesThisWeek: 0,
    deliveriesChange: 'Scheduled',
    pendingGRN: 0,
    pendingGRNChange: 'Needs inspection',
    lowStock: 0,
    lowStockChange: 'Below reorder',
    vendorPayments: '₹0',
    vendorPaymentsChange: 'Payables balance',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [poRes, grnRes, invRes] = await Promise.allSettled([
          api.get('/purchase-orders'),
          api.get('/goods-receipts'),
          api.get('/inventory'),
        ]);

        const poData = poRes.status === 'fulfilled' ? (Array.isArray(poRes.value.data) ? poRes.value.data : (poRes.value.data?.data || [])) : [];
        const grnData = grnRes.status === 'fulfilled' ? (Array.isArray(grnRes.value.data) ? grnRes.value.data : (grnRes.value.data?.data || [])) : [];
        const invData = invRes.status === 'fulfilled' ? (Array.isArray(invRes.value.data) ? invRes.value.data : (invRes.value.data?.data || [])) : [];

        const openPOsList = poData.filter(p => ['Draft', 'Pending Approval', 'Approved', 'Sent to Vendor'].includes(p.status));
        const pendingGRNList = grnData.filter(g => ['Pending Inspection', 'Pending Approval'].includes(g.status));
        const lowStockList = invData.filter(i => (i.availableQty ?? 0) <= (i.reorderLevel ?? 0));

        const mappedPOs = poData.slice(0, 5).map(p => ({
          id: p.poNumber || 'PO-—',
          vendor: p.vendor?.name || 'Unknown Vendor',
          product: p.items?.[0]?.product?.name || (p.items?.length ? `${p.items.length} Items` : '—'),
          qty: p.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0,
          status: p.status === 'Pending Approval' ? 'Raised' : p.status,
          _id: p._id,
        }));
        setPos(mappedPOs);

        const upcoming = poData
          .filter(p => p.expectedDeliveryDate && ['Approved', 'Sent to Vendor'].includes(p.status))
          .slice(0, 5)
          .map(p => {
            const exp = new Date(p.expectedDeliveryDate);
            const isValid = !isNaN(exp.getTime());
            const today = new Date();
            const diff = isValid ? Math.ceil((exp - today) / (1000 * 60 * 60 * 24)) : 0;
            return {
              po: p.poNumber || '—',
              vendor: p.vendor?.name || 'Vendor',
              expectedDate: isValid ? exp.toISOString().split('T')[0] : String(p.expectedDeliveryDate || '—'),
              daysLeft: diff > 0 ? diff : 0,
              _id: p._id,
            };
          });
        setDeliveries(upcoming);

        // Generate dynamic alerts based on live data
        const dynamicAlerts = [];
        if (lowStockList.length > 0) {
          dynamicAlerts.push({
            text: `${lowStockList.length} items are low on stock and need reordering`,
            link: 'View Inventory',
            href: '/procurement/inventory',
          });
        }
        if (pendingGRNList.length > 0) {
          dynamicAlerts.push({
            text: `${pendingGRNList.length} GRN(s) awaiting inspection/approval`,
            link: 'Approve GRN',
            href: '/procurement/goods-receipt',
          });
        }
        if (openPOsList.length > 0) {
          dynamicAlerts.push({
            text: `${openPOsList.length} open POs in process`,
            link: 'View Purchase Orders',
            href: '/procurement/purchase-orders',
          });
        }
        setAlerts(dynamicAlerts);

        const totalPayables = poData
          .filter(p => p.status === 'Approved' || p.status === 'Received')
          .reduce((s, p) => s + (p.totalAmount || 0), 0);

        setStats({
          openPOs: openPOsList.length,
          openPOsChange: `${openPOsList.length} active`,
          deliveriesThisWeek: upcoming.length,
          deliveriesChange: `${upcoming.length} in transit`,
          pendingGRN: pendingGRNList.length,
          pendingGRNChange: `${pendingGRNList.length} pending`,
          lowStock: lowStockList.length,
          lowStockChange: `${lowStockList.length} alert(s)`,
          vendorPayments: `₹${(totalPayables / 100000).toFixed(1)}L`,
          vendorPaymentsChange: 'Active PO spend',
        });
      } catch (e) {
        // Leave defaults as zero/empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const kpiCards = [
    {
      value: stats.openPOs,
      label: 'Open POs',
      change: stats.openPOsChange,
      changeUp: true,
      icon: <Clock size={22} className="text-amber-500" />,
      iconBg: 'bg-amber-50',
    },
    {
      value: stats.deliveriesThisWeek,
      label: 'Deliveries This Week',
      change: stats.deliveriesChange,
      changeUp: false,
      icon: <Truck size={22} className="text-orange-400" />,
      iconBg: 'bg-orange-50',
    },
    {
      value: stats.pendingGRN,
      label: 'Pending GRN Approvals',
      change: stats.pendingGRNChange,
      changeUp: false,
      icon: <ClipboardCheck size={22} className="text-violet-500" />,
      iconBg: 'bg-violet-50',
    },
    {
      value: stats.lowStock,
      label: 'Low Stock Alerts',
      change: stats.lowStockChange,
      changeUp: false,
      icon: <AlertTriangle size={22} className="text-red-400" />,
      iconBg: 'bg-red-50',
    },
    {
      value: stats.vendorPayments,
      label: 'Vendor PO Spend',
      change: stats.vendorPaymentsChange,
      changeUp: true,
      icon: <Wallet size={22} className="text-teal-500" />,
      iconBg: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0F1729] leading-[28px]">Procurement Dashboard</h1>
          <p className="text-[14px] text-[#65758B] font-normal leading-[20px]">Live procurement metrics and alerts</p>
        </div>
        <button
          onClick={() => navigate('/procurement/purchase-orders')}
          className="flex items-center gap-2 h-10 px-5 bg-[#D90B37] hover:bg-[#AE032C] text-white font-semibold text-sm rounded-[10px] transition-colors border-none cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <ShoppingCart size={16} />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-[#E1E7EF] rounded-[12px] p-5 flex flex-col gap-3 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] col-span-1"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-[22px] font-bold text-[#0F1729] leading-tight">{card.value}</div>
              <div className="text-[12px] text-[#65758B] font-normal mt-0.5">{card.label}</div>
              <div className="text-[11px] font-medium mt-1 text-[#64748B]">
                {card.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders */}
        <div className="lg:col-span-2 bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E7EF]">
            <h2 className="text-[15px] font-semibold text-[#0F1729]">Recent Purchase Orders</h2>
            <button
              onClick={() => navigate('/procurement/purchase-orders')}
              className="flex items-center gap-1 text-[13px] text-[#D90B37] font-medium hover:underline bg-transparent border-none cursor-pointer"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[460px]">
              <thead>
                <tr className="border-b border-[#E1E7EF]">
                  {['PO ID', 'VENDOR', 'PRODUCT / ITEMS', 'QTY', 'STATUS'].map(h => (
                    <th key={h} className="px-6 py-3 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E7EF]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D90B37]"></div>
                      </div>
                    </td>
                  </tr>
                ) : pos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#65758B] text-sm">
                      No purchase orders recorded yet
                    </td>
                  </tr>
                ) : (
                  pos.map((po, idx) => {
                    const s = statusConfig[po.status] || statusConfig['Raised'];
                    return (
                      <tr key={po._id || idx} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => navigate('/procurement/purchase-orders')}>
                        <td className="px-6 py-3.5 text-[13px] font-semibold text-[#D90B37]">{po.id}</td>
                        <td className="px-6 py-3.5 text-[13px] text-[#0F1729]">{po.vendor}</td>
                        <td className="px-6 py-3.5 text-[13px] text-[#65758B]">{po.product}</td>
                        <td className="px-6 py-3.5 text-[13px] text-[#0F1729] font-medium">{po.qty.toLocaleString()}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Actions */}
        <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-[15px] font-semibold text-[#0F1729]">Alerts &amp; Actions</h2>
          </div>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-[#64748B]">All procurement processes are operating smoothly. No pending alerts.</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="text-[13px]">
                  <p className="text-[#0F1729] leading-snug">{alert.text}</p>
                  <button
                    onClick={() => navigate(alert.href)}
                    className="text-[#D90B37] font-medium hover:underline bg-transparent border-none cursor-pointer text-[12px] mt-0.5 flex items-center gap-1"
                  >
                    {alert.link} <ArrowRight size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expected Deliveries */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E7EF]">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-[#65758B]" />
            <h2 className="text-[15px] font-semibold text-[#0F1729]">Expected Inbound Deliveries</h2>
          </div>
          <button
            onClick={() => navigate('/procurement/inbound-shipments')}
            className="flex items-center gap-1 text-[13px] text-[#D90B37] font-medium hover:underline bg-transparent border-none cursor-pointer"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['PO', 'VENDOR', 'EXPECTED DATE', 'DAYS LEFT', 'ACTION'].map(h => (
                  <th key={h} className="px-6 py-3 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#65758B] text-sm">
                    No active deliveries scheduled
                  </td>
                </tr>
              ) : (
                deliveries.map((d, idx) => (
                  <tr key={d._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-[#D90B37]">{d.po}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#0F1729]">{d.vendor}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#65758B]">{d.expectedDate}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[13px] font-semibold ${d.daysLeft <= 3 ? 'text-amber-500' : d.daysLeft <= 7 ? 'text-amber-500' : 'text-[#10B77F]'}`}>
                        {d.daysLeft} {d.daysLeft === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => navigate('/procurement/purchase-orders')}
                        className="h-8 px-4 bg-[#D90B37] hover:bg-[#AE032C] text-white text-[12px] font-semibold rounded-lg border-none cursor-pointer transition-colors"
                      >
                        View PO
                      </button>
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

export default ProcurementDashboard;
