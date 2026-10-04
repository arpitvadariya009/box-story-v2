import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  'Approved': { bg: 'bg-green-50', text: 'text-green-600', label: 'Approved' },
  'Accepted': { bg: 'bg-green-50', text: 'text-green-600', label: 'Approved' },
  'Pending Approval': { bg: 'bg-amber-50', text: 'text-amber-500', label: 'Pending Approval' },
  'Pending Inspection': { bg: 'bg-amber-50', text: 'text-amber-500', label: 'Pending Inspection' },
  'Partially Accepted': { bg: 'bg-orange-50', text: 'text-orange-500', label: 'Partially Accepted' },
  'Rejected': { bg: 'bg-red-50', text: 'text-red-500', label: 'Rejected' },
};

const ProcurementGoodsReceipt = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRNs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/goods-receipts');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = data.map(g => {
          const orderedTotal = (g.receivedItems || []).reduce((s, i) => s + (i.orderedQty || 0), 0);
          const receivedTotal = (g.receivedItems || []).reduce((s, i) => s + (i.receivedQty || 0), 0);
          const diff = orderedTotal - receivedTotal;
          return {
            _id: g._id,
            grnNumber: g.grnNumber || 'GRN-—',
            poRef: g.purchaseOrder?.poNumber || '—',
            poId: g.purchaseOrder?._id,
            vendor: g.vendor?.name || '—',
            ordered: orderedTotal,
            received: receivedTotal,
            discrepancy: diff === 0 ? 'Match' : `⚠ Short by ${diff}`,
            discrepancyType: diff === 0 ? 'match' : 'short',
            status: g.status || 'Pending Inspection',
            rawItems: g.receivedItems,
          };
        });
        setGrns(mapped);
      } catch (e) {
        setGrns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGRNs();
  }, [api]);

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-[#0F1729]">Goods Receipt Notes (GRN)</h1>
        <p className="text-[13px] text-[#65758B] mt-0.5">Verify and inspect received materials</p>
      </div>

      {/* GRN Table */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['GRN #', 'PO REF', 'VENDOR', 'ORDERED QTY', 'RECEIVED QTY', 'DISCREPANCY', 'STATUS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : grns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#65758B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardCheck size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">No Goods Receipt Notes found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                grns.map((g, idx) => {
                  const sc = STATUS_CONFIG[g.status] || STATUS_CONFIG['Pending Inspection'];
                  return (
                    <tr key={g._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#D90B37]">{g.grnNumber}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1729] font-medium">{g.poRef}</td>
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{g.vendor}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1729] font-medium">{g.ordered}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1729] font-medium">{g.received}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[13px] font-medium ${g.discrepancyType === 'short' ? 'text-amber-500 font-semibold' : 'text-[#10B77F]'}`}>
                          {g.discrepancy}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${sc.bg} ${sc.text}`}>
                          {sc.label}
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
    </div>
  );
};

export default ProcurementGoodsReceipt;
