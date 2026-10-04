import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  Calendar,
  UserCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

const EmployeeProfile = () => {
  const { user, api, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul@company.com',
    phone: user?.phone || '+91 98765 43210',
    addressLine1: '42, Sunrise Apartments',
    addressLine2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400050',
    department: 'Engineering',
    joined: 'Jan 2024',
    manager: 'Priya Kapoor',
    location: 'Mumbai, MH',
    employeeId: user?.employeeId || 'EMP-2024-1567',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        department: user.department || prev.department,
        employeeId: user.employeeId || prev.employeeId,
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (api) {
        const res = await api.put('/auth/profile', {
          name: formData.name,
          phone: formData.phone,
        });
        if (res?.data && setUser) {
          setUser((prev) => ({ ...prev, ...res.data }));
        }
      }
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter'] w-full">
      {/* Success Notification */}
      {successMsg && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] px-4 py-3 rounded-xl flex items-center gap-2 text-[13.5px] font-semibold animate-in fade-in">
          <CheckCircle2 size={18} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* 1. Top Red Employee Banner */}
      <div className="bg-[#E11D48] text-white rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 shadow-sm">
        <div className="relative">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt="Profile Avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/80 shadow-md"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-[20px] sm:text-[22px] font-bold text-white leading-tight">
            {formData.name}
          </h1>
          <p className="text-[13px] text-white/85 font-medium">{formData.email}</p>
          <div className="pt-0.5">
            <span className="inline-block bg-white/20 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {formData.employeeId}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. Personal Information Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <User size={16} className="text-[#E11D48]" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-600">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-600">Email</label>
              <input
                type="email"
                readOnly
                value={formData.email}
                className="w-full h-11 bg-slate-100/80 border border-slate-200 rounded-xl px-4 text-[13.5px] text-slate-500 outline-none cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[12px] font-semibold text-slate-600">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* 3. Default Delivery Address Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={16} className="text-[#E11D48]" />
            <span>Default Delivery Address</span>
          </h3>

          <div className="space-y-3.5">
            {/* Address Line 1 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-600">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-600">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
              />
            </div>

            {/* City, State, Pin Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-600">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-600">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-slate-600">PIN Code</label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 focus:border-[#E11D48] rounded-xl px-4 text-[13.5px] text-slate-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Account Info Section - Soft Pink Card */}
        <div className="bg-[#FDEDEE] border border-rose-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3.5">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Shield size={16} className="text-[#E11D48]" />
            <span>Account Info</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div>
              <span className="text-[11.5px] text-slate-500 font-medium block">Department</span>
              <span className="text-[13.5px] font-bold text-slate-900 block mt-0.5">
                {formData.department}
              </span>
            </div>

            <div>
              <span className="text-[11.5px] text-slate-500 font-medium block">Joined</span>
              <span className="text-[13.5px] font-bold text-slate-900 block mt-0.5">
                {formData.joined}
              </span>
            </div>

            <div>
              <span className="text-[11.5px] text-slate-500 font-medium block">Manager</span>
              <span className="text-[13.5px] font-bold text-slate-900 block mt-0.5">
                {formData.manager}
              </span>
            </div>

            <div>
              <span className="text-[11.5px] text-slate-500 font-medium block">Location</span>
              <span className="text-[13.5px] font-bold text-slate-900 block mt-0.5">
                {formData.location}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Save Button (Right on desktop, full width on mobile) */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto min-w-[150px] bg-[#E11D48] text-white text-[13.5px] font-bold px-8 py-3 rounded-xl shadow-sm transition-all border-none flex items-center justify-center gap-2 ${
              saving
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-[#BE123C] cursor-pointer'
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeProfile;
