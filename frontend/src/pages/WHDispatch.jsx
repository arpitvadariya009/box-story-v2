import React, { useState } from 'react';
import {
  Send,
  Printer,
  ExternalLink
} from 'lucide-react';

const WHDispatch = () => {
  const [dispatchInfo, setDispatchInfo] = useState({
    dispatchNumber: 'DSP-2026-0312',
    dispatchDate: '2026-06-24',
    clientName: 'Infosys Pvt Ltd',
    orderNumber: 'SO-2039'
  });

  const [shipmentInfo, setShipmentInfo] = useState({
    courierName: 'Blue Dart Express',
    awbNumber: 'BD748291048IN',
    trackingLink: 'https://bluedart.com/track/BD748291048IN',
    shipmentWeight: '14.5 kg',
    numberOfPackages: '3 Boxes'
  });

  const handleDispatch = () => {
    alert('Dispatch initiated and shipment status updated to Dispatched!');
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleTrackShipment = () => {
    if (shipmentInfo.trackingLink) {
      window.open(shipmentInfo.trackingLink, '_blank');
    } else {
      alert('Tracking link not provided');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispatch</h1>
      </div>

      {/* Dispatch Information Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Dispatch Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">DISPATCH NUMBER</label>
            <input
              type="text"
              value={dispatchInfo.dispatchNumber}
              onChange={(e) => setDispatchInfo({ ...dispatchInfo, dispatchNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">DISPATCH DATE</label>
            <input
              type="date"
              value={dispatchInfo.dispatchDate}
              onChange={(e) => setDispatchInfo({ ...dispatchInfo, dispatchDate: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">CLIENT NAME</label>
            <input
              type="text"
              value={dispatchInfo.clientName}
              onChange={(e) => setDispatchInfo({ ...dispatchInfo, clientName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ORDER NUMBER</label>
            <input
              type="text"
              value={dispatchInfo.orderNumber}
              onChange={(e) => setDispatchInfo({ ...dispatchInfo, orderNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Shipment Information Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Shipment Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">COURIER NAME</label>
            <input
              type="text"
              value={shipmentInfo.courierName}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, courierName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">AWB NUMBER</label>
            <input
              type="text"
              value={shipmentInfo.awbNumber}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, awbNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">TRACKING LINK</label>
            <input
              type="text"
              value={shipmentInfo.trackingLink}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, trackingLink: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">SHIPMENT WEIGHT</label>
            <input
              type="text"
              value={shipmentInfo.shipmentWeight}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, shipmentWeight: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">NUMBER OF PACKAGES</label>
            <input
              type="text"
              value={shipmentInfo.numberOfPackages}
              onChange={(e) => setShipmentInfo({ ...shipmentInfo, numberOfPackages: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleDispatch}
          className="px-5 py-2.5 bg-[#E21D48] text-white text-xs font-semibold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Send size={14} /> Dispatch
        </button>
        <button
          onClick={handlePrintLabel}
          className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <Printer size={14} /> Print Label
        </button>
        <button
          onClick={handleTrackShipment}
          className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <ExternalLink size={14} /> Track Shipment
        </button>
      </div>
    </div>
  );
};

export default WHDispatch;
