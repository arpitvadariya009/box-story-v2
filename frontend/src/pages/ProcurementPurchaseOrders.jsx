import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, Send, CheckCircle, Plus } from 'lucide-react';

const STATUS_TABS = ['All', 'Raised', 'Approved', 'Received', 'Rejected'];

const STATUS_MAP = {
  'Approved': { label: 'Approved', bg: 'bg-green-50', text: 'text-green-600' },
  'Pending Approval': { label: 'Raised', bg: 'bg-amber-50', text: 'text-amber-500' },
  'Draft': { label: 'Raised', bg: 'bg-amber-50', text: 'text-amber-500' },
  'Received': { label: 'Received', bg: 'bg-green-50', text: 'text-green-600' },
  'Partially Received': { label: 'Received', bg: 'bg-green-50', text: 'text-green-600' },
  'Cancelled': { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-500' },
  'Sent to Vendor': { label: 'Raised', bg: 'bg-amber-50', text: 'text-amber-500' },
};

const fmt = (amount) => '₹' + Number(amount || 0).toLocaleString('en-IN');
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toISOString().split('T')[0];
  } catch (e) {
    return String(d);
  }
};

const ProcurementPurchaseOrders = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [pos, setPos] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [drawerPO, setDrawerPO] = useState(null);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchase-orders');
      setPos(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching purchase orders:', e);
      setPos([]);
    } finally {
      setLoading(false);
    }
  };

  const tabCount = (tab) => {
    if (tab === 'All') return pos.length;
    return pos.filter(p => {
      const mapped = STATUS_MAP[p.status]?.label || p.status;
      return mapped === tab;
    }).length;
  };

  const filtered = pos.filter(p => {
    const matchSearch = !search ||
      (p.poNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.vendor?.name || '').toLowerCase().includes(search.toLowerCase());
    const mappedStatus = STATUS_MAP[p.status]?.label || p.status;
    const matchTab = activeTab === 'All' || mappedStatus === activeTab;
    return matchSearch && matchTab;
  });

  const raised = pos.filter(p => ['Pending Approval', 'Draft', 'Sent to Vendor'].includes(p.status)).length;
  const approved = pos.filter(p => p.status === 'Approved').length;
  const received = pos.filter(p => ['Received', 'Partially Received'].includes(p.status)).length;
  const rejected = pos.filter(p => p.status === 'Cancelled').length;

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0F1729]">Purchase Orders</h1>
          <p className="text-[13px] text-[#65758B] mt-0.5">{pos.length} total orders · Track PO lifecycle</p>
        </div>
        <button
          onClick={() => navigate('/purchase-orders/new')}
          className="flex items-center gap-2 h-10 px-5 bg-[#D90B37] hover:bg-[#AE032C] text-white font-semibold text-sm rounded-[10px] transition-colors border-none cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Create PO
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Raised', count: raised, color: 'text-[#D90B37]' },
          { label: 'Approved', count: approved, color: 'text-green-600' },
          { label: 'Received', count: received, color: 'text-green-600' },
          { label: 'Rejected', count: rejected, color: 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[#E1E7EF] rounded-[12px] p-5 text-center shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
            <div className={`text-[28px] font-bold ${c.color}`}>{c.count}</div>
            <div className="text-[13px] text-[#65758B] mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-4 pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787]" />
            <input
              type="text"
              placeholder="Search PO, vendor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all border-none cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#D90B37] text-white'
                    : 'bg-[#F1F5F9] text-[#65758B] hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['PO ID', 'VENDOR', 'ITEMS', 'AMOUNT', 'RAISED', 'EXPECTED', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-6 py-3 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-[#878787] text-sm">No purchase orders found.</td></tr>
              ) : filtered.map((po, idx) => {
                const s = STATUS_MAP[po.status] || { label: po.status, bg: 'bg-[#F1F5F9]', text: 'text-[#65758B]' };
                return (
                  <tr key={po._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-[#D90B37]">{po.poNumber}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#0F1729]">{po.vendor?.name || '—'}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#65758B]">{(po.items || []).length}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#0F1729] font-medium">{fmt(po.totalAmount)}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#65758B]">{fmtDate(po.createdAt)}</td>
                    <td className="px-6 py-3.5 text-[13px] text-[#65758B]">{fmtDate(po.expectedDeliveryDate)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDrawerPO(po)}
                          className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {s.label === 'Approved' && (
                          <button className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer" title="Send to Vendor">
                            <Send size={16} />
                          </button>
                        )}
                        {s.label === 'Raised' && (
                          <button className="p-1.5 text-[#65758B] hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer" title="Mark as Approved">
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Drawer */}
      {drawerPO && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerPO(null)}>
          <div className="fixed inset-0 bg-black/30" />
          <div
            className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[#E1E7EF] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#0F1729]">{drawerPO.poNumber}</h3>
                <p className="text-[12px] text-[#65758B]">{drawerPO.vendor?.name}</p>
              </div>
              <button onClick={() => setDrawerPO(null)} className="text-[#878787] hover:text-[#0F1729] bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div><span className="text-[#65758B]">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${(STATUS_MAP[drawerPO.status] || {}).bg} ${(STATUS_MAP[drawerPO.status] || {}).text}`}>
                      {(STATUS_MAP[drawerPO.status] || {}).label || drawerPO.status}
                    </span>
                  </div>
                </div>
                <div><span className="text-[#65758B]">Total Amount</span><div className="font-semibold text-[#0F1729] mt-1">{fmt(drawerPO.totalAmount)}</div></div>
                <div><span className="text-[#65758B]">Raised On</span><div className="font-medium text-[#0F1729] mt-1">{fmtDate(drawerPO.createdAt)}</div></div>
                <div><span className="text-[#65758B]">Expected Delivery</span><div className="font-medium text-[#0F1729] mt-1">{fmtDate(drawerPO.expectedDeliveryDate)}</div></div>
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-[#0F1729] mb-2">Line Items</h4>
                <div className="space-y-2">
                  {(drawerPO.items || []).map((item, i) => (
                    <div key={i} className="bg-[#F8FAFC] rounded-xl p-3 text-[13px]">
                      <div className="font-medium text-[#0F1729]">{item.product?.name || `Item ${i + 1}`}</div>
                      <div className="text-[#65758B] mt-0.5">Qty: {item.quantity || 0} · Unit Price: {fmt(item.unitPrice)} · Total: {fmt(item.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
              {drawerPO.notes && (
                <div>
                  <h4 className="text-[13px] font-semibold text-[#0F1729] mb-1">Notes</h4>
                  <p className="text-[13px] text-[#65758B]">{drawerPO.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPurchaseOrders;
