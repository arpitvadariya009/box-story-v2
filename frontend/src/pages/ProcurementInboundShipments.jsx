import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  'In Transit': { bg: 'bg-amber-50', text: 'text-amber-500', dot: 'bg-amber-400' },
  'Scheduled': { bg: 'bg-amber-50', text: 'text-amber-500', dot: 'bg-amber-400' },
  'Delivered': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
};

const ProcurementInboundShipments = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/purchase-orders');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = data
          .filter(p => ['Approved', 'Sent to Vendor', 'Partially Received', 'Received'].includes(p.status))
          .map((p, i) => ({
            _id: p._id,
            shipmentNumber: `SH-${String(i + 1).padStart(4, '0')}`,
            po: p.poNumber,
            poId: p._id,
            vendor: p.vendor?.name || 'Unknown Vendor',
            expected: (() => {
              if (!p.expectedDeliveryDate) return '—';
              try {
                const dt = new Date(p.expectedDeliveryDate);
                return isNaN(dt.getTime()) ? String(p.expectedDeliveryDate) : dt.toISOString().split('T')[0];
              } catch (e) {
                return String(p.expectedDeliveryDate);
              }
            })(),
            dock: `Dock A - ${9 + (i % 6)}:00 AM`,
            vehicle: '—',
            status: ['Received', 'Partially Received'].includes(p.status) ? 'Delivered' : 'Scheduled',
          }));
        setShipments(mapped);
      } catch (e) {
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [api]);

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-[#0F1729]">Inbound Shipments</h1>
        <p className="text-[13px] text-[#65758B] mt-0.5">Track and receive incoming vendor shipments</p>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['SHIPMENT #', 'PO REF', 'VENDOR', 'EXPECTED ARRIVAL', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#65758B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">No inbound shipments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shipments.map((s, idx) => {
                  const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG['Scheduled'];
                  return (
                    <tr key={s._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#D90B37]">{s.shipmentNumber}</td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1729] font-medium">{s.po}</td>
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{s.vendor}</td>
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{s.expected}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.poId && (
                          <button
                            onClick={() => navigate(`/purchase-orders`)}
                            className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer"
                            title="View PO"
                          >
                            <Eye size={15} />
                          </button>
                        )}
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

export default ProcurementInboundShipments;
