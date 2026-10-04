import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Download,
  Eye,
  X,
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Clock,
  ChevronDown
} from 'lucide-react';

const HRGiftSelections = () => {
  const { api } = useAuth();
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchSelections = async () => {
    setLoading(true);
    try {
      if (api) {
        const res = await api.get('/gift-selections');
        const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = arr.map((item, idx) => {
          const hasProduct = item.selectedProducts && item.selectedProducts.length > 0;
          const p = hasProduct ? item.selectedProducts[0].product : null;
          const statusFormatted =
            item.status === 'Approved' || item.status === 'Approved by HR' || item.status === 'Processed'
              ? 'Processed'
              : item.status === 'Submitted' || item.status === 'Selected'
              ? 'Submitted'
              : 'Pending';

          const d = item.submittedAt || item.createdAt;
          const dateFormatted = d
            ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '-';

          return {
            _id: item._id,
            employee: {
              name: item.employee?.name || `Employee ${idx + 1}`,
              email: item.employee?.email || `employee${idx + 1}@company.com`,
            },
            product: p
              ? {
                  name: p.name || 'Gift Hamper',
                  image: p.images?.[0] || '',
                  price: p.basePrice || 0,
                  category: p.category || 'General',
                }
              : null,
            address: item.shippingAddress
              ? `${item.shippingAddress.street || ''}, ${item.shippingAddress.city || ''} ${item.shippingAddress.zipCode || ''}`.trim()
              : 'Corporate Delivery',
            status: statusFormatted,
            date: dateFormatted,
          };
        });
        setSelections(mapped);
      }
    } catch (err) {
      setSelections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelections();
  }, [api]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getInitials = (name) => {
    if (!name) return 'EM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('submit')) {
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#E11D48] text-white">
          Submitted
        </span>
      );
    }
    if (s.includes('process') || s.includes('approv')) {
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#FCE8ED] text-[#9B112E]">
          Processed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827]">
        Pending
      </span>
    );
  };

  // KPI Counts
  const submittedCount = selections.filter((s) => s.status === 'Submitted').length;
  const pendingCount = selections.filter((s) => s.status === 'Pending').length;
  const processedCount = selections.filter((s) => s.status === 'Processed').length;

  // Export to Excel / CSV
  const handleExportToExcel = () => {
    let csv = 'data:text/csv;charset=utf-8,Employee Name,Email,Selected Product,Address,Status,Date\n';
    selections.forEach((s) => {
      const pName = s.product?.name ? `"${s.product.name}"` : 'Not selected';
      const addr = `"${s.address}"`;
      csv += `"${s.employee?.name}","${s.employee?.email}",${pName},${addr},"${s.status}","${s.date}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gift_selections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Gift Selections exported to Excel CSV!');
  };

  // Filter Logic
  const filteredSelections = selections.filter((s) => {
    const matchesSearch =
      s.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employee?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === 'All' || s.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E11D48]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-['Inter'] w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-[13.5px] font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 3 Summary KPI Cards Matching Screenshot 3 & 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Submitted */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#E11D48] text-white font-bold text-[18px] flex items-center justify-center flex-shrink-0 shadow-2xs">
            {submittedCount}
          </div>
          <span className="text-[14px] font-bold text-slate-800">Submitted</span>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#F59E0B] text-white font-bold text-[18px] flex items-center justify-center flex-shrink-0 shadow-2xs">
            {pendingCount}
          </div>
          <span className="text-[14px] font-bold text-slate-800">Pending</span>
        </div>

        {/* Card 3: Processed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#10B981] text-white font-bold text-[18px] flex items-center justify-center flex-shrink-0 shadow-2xs">
            {processedCount}
          </div>
          <span className="text-[14px] font-bold text-slate-800">Processed</span>
        </div>
      </div>

      {/* Search & Export Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee..."
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#E11D48] transition-all shadow-2xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[130px] sm:w-[150px]">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-[#E11D48] appearance-none cursor-pointer shadow-2xs"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Export to Excel Button */}
        <button
          type="button"
          onClick={handleExportToExcel}
          className="h-11 px-4.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs flex-shrink-0"
        >
          <Download size={15} className="text-slate-600" />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Gift Selections Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-[12px] font-medium bg-[#FFF5F7]/60">
                <th className="py-3.5 pl-6 font-medium text-left">Employee</th>
                <th className="py-3.5 font-medium text-left">Selected Product</th>
                <th className="py-3.5 font-medium text-left hidden md:table-cell">Address</th>
                <th className="py-3.5 font-medium text-left">Status</th>
                <th className="py-3.5 font-medium text-left hidden sm:table-cell">Date</th>
                <th className="py-3.5 pr-6 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filteredSelections.map((sel) => (
                <tr
                  key={sel._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Employee with Initials Circle */}
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FCE8ED] text-[#9B112E] font-bold text-[11.5px] flex items-center justify-center flex-shrink-0">
                        {getInitials(sel.employee?.name)}
                      </div>
                      <span className="font-bold text-slate-900 text-[13.5px] truncate">
                        {sel.employee?.name}
                      </span>
                    </div>
                  </td>

                  {/* Selected Product */}
                  <td className="py-3.5">
                    {sel.product ? (
                      <div className="flex items-center gap-2.5">
                        <img
                          src={sel.product.image}
                          alt={sel.product.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                        />
                        <span className="font-medium text-slate-800 text-[13px] truncate max-w-[180px]">
                          {sel.product.name}
                        </span>
                      </div>
                    ) : (
                      <span className="italic text-slate-400 text-[13px]">
                        Not selected
                      </span>
                    )}
                  </td>

                  {/* Address */}
                  <td className="py-3.5 text-slate-600 text-[12.5px] hidden md:table-cell max-w-[220px] truncate">
                    {sel.address}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5">
                    {getStatusBadge(sel.status)}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 text-slate-500 font-medium text-[12.5px] hidden sm:table-cell">
                    {sel.date}
                  </td>

                  {/* View Action */}
                  <td className="py-3.5 pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveModalItem(sel)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer rounded-lg hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gift Selection Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[17px] font-bold text-slate-900">Selection Details</h3>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Employee Card */}
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#FCE8ED] text-[#9B112E] font-bold text-[13px] flex items-center justify-center">
                {getInitials(activeModalItem.employee?.name)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-[14px]">
                  {activeModalItem.employee?.name}
                </h4>
                <p className="text-[12px] text-slate-500">
                  {activeModalItem.employee?.email}
                </p>
              </div>
            </div>

            {/* Selected Product Card */}
            {activeModalItem.product ? (
              <div className="flex items-center gap-3.5 border border-slate-200 p-3.5 rounded-xl">
                <img
                  src={activeModalItem.product.image}
                  alt={activeModalItem.product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-100"
                />
                <div>
                  <h5 className="font-bold text-[14px] text-slate-900">
                    {activeModalItem.product.name}
                  </h5>
                  <p className="text-[12px] text-slate-500">
                    Value: ₹{activeModalItem.product.price?.toLocaleString('en-IN')}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Selected Gift
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-[13px] font-semibold text-amber-800">
                  No gift has been selected yet
                </p>
                <p className="text-[11.5px] text-amber-600 mt-0.5">
                  The employee has not submitted their gift choice.
                </p>
              </div>
            )}

            {/* Address & Status info */}
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{activeModalItem.address}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Status:</span>
                <div>{getStatusBadge(activeModalItem.status)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-medium text-slate-800">{activeModalItem.date}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] rounded-xl border-none cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRGiftSelections;
