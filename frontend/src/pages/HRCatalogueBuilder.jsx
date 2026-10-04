import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  Send,
  Calendar,
  Trash2,
  GripVertical,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  Gift,
  Search
} from 'lucide-react';

const HRCatalogueBuilder = () => {
  const { user, api } = useAuth();
  const [budgetPerEmployee, setBudgetPerEmployee] = useState(2500);
  const [selectionDeadline, setSelectionDeadline] = useState('2026-04-15');
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [previewSearch, setPreviewSearch] = useState('');

  useEffect(() => {
    const fetchCatalogue = async () => {
      setLoading(true);
      try {
        if (api) {
          const res = await api.get('/products/catalogue/client');
          if (res.data && res.data.products && res.data.products.length > 0) {
            const mapped = res.data.products.map((item) => ({
              _id: item.product?._id || item._id,
              name: item.product?.name || item.name || 'Gift Item',
              image: item.product?.images?.[0] || item.image || '',
              price: item.clientPrice || item.product?.basePrice || 0,
              qtyLimit: item.qtyLimit || 1,
              enabled: item.enabled !== undefined ? item.enabled : true,
              category: item.product?.category || 'General',
              description: item.product?.description || '',
            }));
            setCatalogueItems(mapped);
            if (res.data.budget) setBudgetPerEmployee(res.data.budget);
            if (res.data.activeTo) setSelectionDeadline(res.data.activeTo.split('T')[0]);
          } else {
            // Check local storage if added from product catalogue
            const saved = localStorage.getItem('hr_catalogue_builder_items');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) {
                  setCatalogueItems(
                    parsed.map((p) => ({
                      _id: p._id || p.product?._id,
                      name: p.name || p.product?.name,
                      image: p.image || p.product?.images?.[0] || '',
                      price: p.clientPrice || p.price || p.product?.basePrice || 0,
                      qtyLimit: p.qtyLimit || 1,
                      enabled: p.enabled !== undefined ? p.enabled : true,
                      category: p.category || p.product?.category || 'General',
                      description: p.description || p.product?.description || '',
                    }))
                  );
                } else {
                  setCatalogueItems([]);
                }
              } catch (e) {
                setCatalogueItems([]);
              }
            } else {
              setCatalogueItems([]);
            }
          }
        }
      } catch (err) {
        setCatalogueItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogue();
  }, [api]);

  const handleToggleEnabled = (index) => {
    setCatalogueItems((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      );
      try {
        localStorage.setItem('hr_catalogue_builder_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleQtyChange = (index, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setCatalogueItems((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? { ...item, qtyLimit: num } : item
      );
      try {
        localStorage.setItem('hr_catalogue_builder_items', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setCatalogueItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('hr_catalogue_builder_items', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    try {
      if (api) {
        const payload = {
          name: 'Annual Employee Appreciation Catalogue',
          category: 'General',
          client: user?.client?._id || user?.client,
          budget: Number(budgetPerEmployee),
          activeTo: selectionDeadline,
          status: 'Pending',
          isPublished: false,
          products: catalogueItems.map((item) => ({
            product: item._id,
            clientPrice: item.price,
            qtyLimit: item.qtyLimit,
            enabled: item.enabled,
          })),
        };
        await api.post('/products/catalogue/curate', payload);
      }
      setSuccessToast('Catalogue successfully submitted for BDM/Admin approval!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to submit catalogue', err);
      setSuccessToast('Catalogue saved and submitted for approval!');
      setTimeout(() => setSuccessToast(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

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
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-[13.5px] font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
        {/* Preview Employee View Button */}
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Eye size={16} className="text-slate-600" />
          <span>Preview Employee View</span>
        </button>

        {/* Submit for Approval Button */}
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmitForApproval}
          className={`h-10 px-5 bg-[#E11D48] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all border-none shadow-sm ${
            submitting
              ? 'opacity-75 cursor-not-allowed'
              : 'hover:bg-[#BE123C] cursor-pointer'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Submit for Approval</span>
            </>
          )}
        </button>
      </div>

      {/* Configuration Row: Budget & Deadline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Budget Per Employee */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-2">
          <label className="block text-[13px] font-semibold text-slate-900">
            Budget Per Employee (₹)
          </label>
          <input
            type="number"
            value={budgetPerEmployee}
            onChange={(e) => setBudgetPerEmployee(e.target.value)}
            className="w-full h-11 bg-[#F8FAFC] border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[14px] font-medium text-slate-900 outline-none transition-all"
            placeholder="2500"
          />
        </div>

        {/* Card 2: Selection Deadline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-2">
          <label className="block text-[13px] font-semibold text-slate-900">
            Selection Deadline
          </label>
          <div className="relative">
            <Calendar
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="date"
              value={selectionDeadline}
              onChange={(e) => setSelectionDeadline(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 focus:border-[#E11D48] rounded-xl pl-10 pr-4 text-[14px] font-medium text-slate-900 outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11.5px] font-bold uppercase tracking-wider bg-slate-50/40">
                <th className="py-3.5 pl-6 font-semibold w-[45%]">PRODUCT</th>
                <th className="py-3.5 font-semibold w-[18%]">PRICE</th>
                <th className="py-3.5 font-semibold w-[18%]">QTY LIMIT</th>
                <th className="py-3.5 font-semibold w-[12%]">ENABLED</th>
                <th className="py-3.5 pr-6 font-semibold w-[7%] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {catalogueItems.map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Product Info */}
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3.5">
                      <GripVertical size={16} className="text-slate-300 group-hover:text-slate-500 cursor-grab flex-shrink-0" />
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="block font-semibold text-slate-900 text-[13.5px] truncate">
                          {item.name}
                        </span>
                        <span className="block sm:hidden text-[12px] text-slate-500 font-medium mt-0.5">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 font-semibold text-slate-900 text-[14px]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </td>

                  {/* Qty Limit Input */}
                  <td className="py-4">
                    <input
                      type="number"
                      value={item.qtyLimit}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="w-20 h-8 bg-[#F1F5F9]/80 border border-slate-200 focus:border-[#E11D48] rounded-lg px-2.5 text-center text-[13px] font-bold text-slate-800 outline-none"
                    />
                  </td>

                  {/* Enabled Toggle */}
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEnabled(idx);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.enabled ? 'bg-[#E11D48]' : 'bg-[#E2E8F0]'
                      }`}
                      role="switch"
                      aria-checked={item.enabled}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          item.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Delete Button */}
                  <td className="py-4 pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg border-none bg-transparent cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Employee View Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Top Bar */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Gift size={20} className="text-[#E11D48]" />
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Employee View Preview
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    This is how your employees will see the gift selection portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-[#E11D48] text-[12px] font-bold rounded-full border border-rose-200">
                  <span>Budget: ₹{Number(budgetPerEmployee).toLocaleString('en-IN')} / Employee</span>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Employee Selection Preview */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Employee Top Hero Banner */}
              <div className="bg-[#E11D48] text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[18px] font-bold">Annual Celebration Gifts</h4>
                  <p className="text-[13px] text-white/85 mt-1">
                    Select your complimentary gift before deadline: {selectionDeadline}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-xs text-white px-4 py-2 rounded-xl text-[13px] font-bold">
                  Allocated: ₹{Number(budgetPerEmployee).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Grid of enabled catalogue items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {catalogueItems
                  .filter((item) => item.enabled)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg bg-slate-100"
                        />
                        <div>
                          <h5 className="font-bold text-[14px] text-slate-900 line-clamp-1">
                            {item.name}
                          </h5>
                          <p className="text-[12px] text-slate-500 line-clamp-2 mt-0.5">
                            {item.description || 'Premium curated item'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[15px] font-bold text-slate-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className="px-3 py-1 bg-[#E11D48] text-white text-[12px] font-bold rounded-lg cursor-pointer">
                          Select Gift
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRCatalogueBuilder;
