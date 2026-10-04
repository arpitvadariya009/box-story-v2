import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, Pencil, Plus } from 'lucide-react';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ModalFooter } from '../components/FormControls';

const ProcurementVendors = () => {
  const { api } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', gstin: '', category: '', contact: '', payment: 'Net 30', rating: 4.0 });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors');
      const data = Array.isArray(res.data) ? res.data : [];
      setVendors(data.map(v => ({
        _id: v._id,
        name: v.name,
        gstin: v.gstin || '—',
        category: v.category || 'General',
        contact: v.phone || v.email || '—',
        payment: v.paymentTerms || 'Net 30',
        rating: v.rating ?? 0,
        status: v.status || 'Active',
      })));
    } catch (e) {
      console.error('Error fetching vendors:', e);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter(v =>
    !search ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.gstin || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors', {
        name: form.name,
        gstin: form.gstin,
        category: form.category,
        phone: form.contact,
        paymentTerms: form.payment,
        rating: Number(form.rating),
        status: 'Active'
      });
      fetchVendors();
    } catch (e) {
      alert('Error creating vendor: ' + (e.response?.data?.message || e.message));
    }
    setShowAdd(false);
    setForm({ name: '', gstin: '', category: '', contact: '', payment: 'Net 30', rating: 4.0 });
  };

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0F1729]">Vendor Management</h1>
          <p className="text-[13px] text-[#65758B] mt-0.5">{vendors.length} vendors registered</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787]" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-10 px-5 bg-[#D90B37] hover:bg-[#AE032C] text-white font-semibold text-sm rounded-[10px] transition-colors border-none cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['VENDOR', 'GSTIN', 'CATEGORY', 'CONTACT', 'PAYMENT', 'RATING', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div></div>
                </td></tr>
              ) : filtered.map((v, idx) => (
                <tr key={v._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 text-[13px] font-bold text-[#0F1729]">{v.name}</td>
                  <td className="px-6 py-4 text-[13px] text-[#65758B] font-mono text-[12px]">{v.gstin}</td>
                  <td className="px-6 py-4 text-[13px] text-[#65758B]">{v.category}</td>
                  <td className="px-6 py-4 text-[13px] text-[#65758B]">{v.contact}</td>
                  <td className="px-6 py-4 text-[13px] text-[#65758B]">{v.payment}</td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-amber-500 flex items-center gap-1">
                    <span>⭐</span> {v.rating}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${v.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer" title="View"><Eye size={15} /></button>
                      <button className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer" title="Edit"><Pencil size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white max-w-[480px] w-full rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#0F1729]">Add New Vendor</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#878787] hover:text-[#0F1729] bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <form onSubmit={handleAddVendor} className="space-y-4">
              {[
                { label: 'Vendor Name', key: 'name', required: true, placeholder: 'e.g. Steel Corp India' },
                { label: 'GSTIN', key: 'gstin', required: false, placeholder: 'e.g. 27AADCS1234F1Z5' },
                { label: 'Category', key: 'category', required: false, placeholder: 'e.g. Raw Materials' },
                { label: 'Contact (Phone)', key: 'contact', required: false, placeholder: '+91 XXXXX XXXXX' },
              ].map(f => (
                <InputField
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Payment Terms"
                  value={form.payment}
                  onChange={e => setForm(prev => ({ ...prev, payment: e.target.value }))}
                >
                  {['Net 15', 'Net 30', 'Net 45', 'Advance'].map(t => <option key={t} value={t}>{t}</option>)}
                </SelectField>
                <InputField
                  label="Rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={e => setForm(prev => ({ ...prev, rating: e.target.value }))}
                />
              </div>
              <ModalFooter>
                <SecondaryButton onClick={() => setShowAdd(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Add Vendor
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementVendors;
