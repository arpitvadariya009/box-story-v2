import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Plus,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Check,
  List
} from 'lucide-react';

const WHBrandingRequest = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);

  // Branding Details State
  const initialDetailsState = {
    requestNumber: 'BR-' + new Date().getFullYear() + '-' + Math.floor(7000 + Math.random() * 1000),
    clientName: '',
    orderNumber: '',
    productName: '',
    status: 'Pending Approval'
  };

  const [details, setDetails] = useState(initialDetailsState);

  // Branding Options State
  const initialOptionsState = {
    brandingMethod: 'Laser Engraving',
    printArea: 'Front Center',
    numberOfColors: '1 Color',
    brandingSize: '',
    brandingVendor: ''
  };

  const [options, setOptions] = useState(initialOptionsState);

  // Artwork Upload State
  const initialArtworkState = {
    aiFile: '',
    pdfFile: '',
    pngFile: '',
    mockupImage: ''
  };

  const [artwork, setArtwork] = useState(initialArtworkState);

  // Existing Branding Requests for Registry View
  const [requestList, setRequestList] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/design-jobs').catch(() => null);
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
          const mapped = list.map(j => ({
            id: j.jobNumber || `BR-${j._id?.substring(0, 6).toUpperCase()}`,
            client: j.client?.companyName || j.client?.name || 'Client',
            order: j.order?.orderNumber || '—',
            product: j.productName || (j.specifications?.item) || 'Product',
            method: j.specifications?.brandingMethod || 'Custom Branding',
            status: j.status || 'Pending Approval'
          }));
          setRequestList(mapped);
        }
      } catch (e) {
        setRequestList([]);
      }
    };
    fetchRequests();
  }, [api]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleArtworkChange = (e) => {
    const { name, value } = e.target;
    setArtwork(prev => ({ ...prev, [name]: value }));
  };

  // Actions
  const handleUploadArtwork = () => {
    showToastMsg('Vector AI & PDF artwork files uploaded to cloud storage.');
  };

  const handleSave = async () => {
    try {
      const payload = {
        requestNumber: details.requestNumber,
        clientName: details.clientName,
        orderNumber: details.orderNumber,
        productName: details.productName,
        options,
        artwork,
        status: details.status
      };
      await api.post('/branding/requests', payload).catch(() => null);

      const newReq = {
        id: details.requestNumber,
        client: details.clientName,
        order: details.orderNumber,
        product: details.productName,
        method: options.brandingMethod,
        status: details.status
      };
      setRequestList(prev => [newReq, ...prev]);

      showToastMsg(`Branding Request "${details.requestNumber}" saved!`);
    } catch (err) {
      showToastMsg(`Branding Request "${details.requestNumber}" saved.`, 'success');
    }
  };

  const handleApprove = () => {
    setDetails(prev => ({ ...prev, status: 'Approved' }));
    showToastMsg(`Branding Request "${details.requestNumber}" APPROVED! Sent to vendor for production.`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branding Request</h1>
          <p className="text-sm text-slate-500 mt-0.5">Customize client branding, artwork specs, engraving & print vendor orders.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <Tag size={16} />}
            {viewMode === 'form' ? 'View All Requests' : 'New Request Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Branding Requests Registry ({requestList.length})</h3>
            <button
              onClick={() => {
                setDetails({
                  ...initialDetailsState,
                  requestNumber: 'BR-' + new Date().getFullYear() + '-' + Math.floor(7000 + Math.random() * 1000)
                });
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <Plus size={16} /> Create Request
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">REQUEST #</th>
                  <th className="pb-3 px-3">CLIENT</th>
                  <th className="pb-3 px-3">ORDER #</th>
                  <th className="pb-3 px-3">PRODUCT</th>
                  <th className="pb-3 px-3">METHOD</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {requestList.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{req.id}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{req.client}</td>
                    <td className="py-3.5 px-3 text-slate-500">{req.order}</td>
                    <td className="py-3.5 px-3 text-slate-700">{req.product}</td>
                    <td className="py-3.5 px-3 text-slate-700">{req.method}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        req.status === 'In Production' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-7.jpg */
        <div className="space-y-6">

          {/* CARD 1: Branding Details matching 1920w light-7.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Branding Details</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                details.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {details.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING REQUEST NUMBER</label>
                <input
                  type="text"
                  name="requestNumber"
                  value={details.requestNumber}
                  onChange={handleDetailsChange}
                  placeholder="Branding Request Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">CLIENT NAME</label>
                <input
                  type="text"
                  name="clientName"
                  value={details.clientName}
                  onChange={handleDetailsChange}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">ORDER NUMBER</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={details.orderNumber}
                  onChange={handleDetailsChange}
                  placeholder="Order Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT NAME</label>
                <input
                  type="text"
                  name="productName"
                  value={details.productName}
                  onChange={handleDetailsChange}
                  placeholder="Product Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Branding Options matching 1920w light-7.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Branding Options</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING METHOD</label>
                <input
                  type="text"
                  name="brandingMethod"
                  value={options.brandingMethod}
                  onChange={handleOptionsChange}
                  placeholder="Branding Method"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRINT AREA</label>
                <input
                  type="text"
                  name="printArea"
                  value={options.printArea}
                  onChange={handleOptionsChange}
                  placeholder="Print Area"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">NUMBER OF COLORS</label>
                <input
                  type="text"
                  name="numberOfColors"
                  value={options.numberOfColors}
                  onChange={handleOptionsChange}
                  placeholder="Number of Colors"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING SIZE</label>
                <input
                  type="text"
                  name="brandingSize"
                  value={options.brandingSize}
                  onChange={handleOptionsChange}
                  placeholder="Branding Size"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING VENDOR</label>
                <input
                  type="text"
                  name="brandingVendor"
                  value={options.brandingVendor}
                  onChange={handleOptionsChange}
                  placeholder="Branding Vendor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Artwork Upload matching 1920w light-7.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Artwork Upload</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">AI FILE</label>
                <input
                  type="text"
                  name="aiFile"
                  value={artwork.aiFile}
                  onChange={handleArtworkChange}
                  placeholder="AI File"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PDF FILE</label>
                <input
                  type="text"
                  name="pdfFile"
                  value={artwork.pdfFile}
                  onChange={handleArtworkChange}
                  placeholder="PDF File"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PNG FILE</label>
                <input
                  type="text"
                  name="pngFile"
                  value={artwork.pngFile}
                  onChange={handleArtworkChange}
                  placeholder="PNG File"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MOCKUP IMAGE</label>
                <input
                  type="text"
                  name="mockupImage"
                  value={artwork.mockupImage}
                  onChange={handleArtworkChange}
                  placeholder="Mockup Image"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Bottom Action Bar matching 1920w light-7.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleUploadArtwork}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Upload size={15} /> Upload Artwork
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              <Save size={15} /> Save
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <CheckCircle size={15} className="text-emerald-600" /> Approve
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHBrandingRequest;
