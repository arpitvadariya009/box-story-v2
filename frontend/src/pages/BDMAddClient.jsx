import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, FileText, Send, Save } from 'lucide-react';
import api from '../services/api';

const industryOptions = ['Technology', 'SaaS', 'Manufacturing', 'Finance', 'Retail', 'Education', 'Healthcare', 'FMCG', 'Logistics', 'Other'];
const employeeOptions = ['1-50', '51-200', '201-500', '501-1000', '1000+'];

const requiredFields = ['companyName', 'contactName', 'contactEmail'];

const BDMAddClient = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    gstNumber: '',
    employeeCount: '',
    address: '',
    contactName: '',
    designation: '',
    contactEmail: '',
    phone: '',
    additionalNotes: '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const completedCount = requiredFields.filter((f) => form[f]?.trim()).length + Object.keys(form).filter(k => !requiredFields.includes(k) && form[k]?.trim()).length;
  const totalFields = 10;
  const completionPct = Math.round((completedCount / totalFields) * 100);

  const quickSummaryFields = [
    { label: 'Company name', done: !!form.companyName.trim() },
    { label: 'Industry', done: !!form.industry },
    { label: 'Contact person', done: !!form.contactName.trim() },
    { label: 'Contact email', done: !!form.contactEmail.trim() },
  ];

  const handleSubmit = async (asDraft = false) => {
    setSubmitting(true);
    try {
      await api.post('/clients', {
        companyName: form.companyName,
        industry: form.industry,
        gstin: form.gstNumber,
        employeeCount: form.employeeCount,
        address: { street: form.address },
        contactPerson: form.contactName,
        email: form.contactEmail,
        phone: form.phone || '+91 0000000000',
        notes: form.additionalNotes,
        status: asDraft ? 'Draft' : 'Pending',
      });
      navigate('/clients');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-['Inter']">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={18} color="#64748B" />
        </button>
        <div>
          <h1 className="text-[22px] font-bold text-[#0F1729]">Add New Client</h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">Fill in company details and submit for approval</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#FEE2E8] rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#0F1729]">Form Completion</span>
          <span className="text-[13px] font-bold text-[#D90B37]">{completionPct}%</span>
        </div>
        <p className="text-[12px] text-[#64748B] mb-2">{completedCount} of {totalFields} fields completed</p>
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D90B37] rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left Form */}
        <div className="space-y-5">
          {/* Company Details */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FEE2E8] flex items-center justify-center">
                <Building2 size={17} color="#D90B37" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0F1729]">Company Details</h3>
                <p className="text-[12px] text-[#64748B]">Basic information about the company</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  COMPANY NAME <span className="text-[#D90B37]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={form.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">INDUSTRY</label>
                <select
                  value={form.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white cursor-pointer appearance-none"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">GST NUMBER</label>
                <input
                  type="text"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  value={form.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">EMPLOYEE COUNT</label>
                <select
                  value={form.employeeCount}
                  onChange={(e) => handleChange('employeeCount', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white cursor-pointer appearance-none"
                >
                  <option value="">Select range</option>
                  {employeeOptions.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">ADDRESS</label>
                <textarea
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FEE2E8] flex items-center justify-center">
                <User size={17} color="#D90B37" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0F1729]">Primary Contact</h3>
                <p className="text-[12px] text-[#64748B]">Main point of contact at the company</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  NAME <span className="text-[#D90B37]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contact person name"
                  value={form.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">DESIGNATION</label>
                <input
                  type="text"
                  placeholder="e.g., HR Manager"
                  value={form.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  EMAIL <span className="text-[#D90B37]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">PHONE</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1]"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#FEE2E8] flex items-center justify-center">
                <FileText size={17} color="#D90B37" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0F1729]">Additional Notes</h3>
                <p className="text-[12px] text-[#64748B]">Any special requirements or notes</p>
              </div>
            </div>
            <textarea
              placeholder="Any additional information about the client..."
              value={form.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white placeholder-[#CBD5E1] resize-none"
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Summary */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-5">
            <h3 className="text-[14px] font-bold text-[#0F1729] mb-4">Quick Summary</h3>
            <div className="space-y-2.5">
              {quickSummaryFields.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{
                      borderColor: f.done ? '#D90B37' : '#CBD5E1',
                      background: f.done ? '#D90B37' : 'transparent',
                    }}
                  >
                    {f.done && <span className="text-white text-[9px] font-bold">✓</span>}
                  </div>
                  <span className="text-[13px] text-[#64748B]">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting || !form.companyName || !form.contactName || !form.contactEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D90B37] text-white text-[14px] font-semibold rounded-xl hover:bg-[#B80930] transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={15} />
                Submit for Approval
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-[#0F1729] text-[14px] font-semibold rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                Save Draft
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="w-full py-2 text-[13px] text-[#94A3B8] hover:text-[#64748B] transition-colors cursor-pointer border-none bg-transparent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BDMAddClient;
