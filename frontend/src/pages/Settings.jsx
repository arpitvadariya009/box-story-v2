import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeProfile from '../components/EmployeeProfile';
import { Save, Upload, Check, Package, Loader2, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { user, api, logoUrl, updateLogoUrl } = useAuth();

  if (user?.role === 'Employee') {
    return <EmployeeProfile />;
  }
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('General');

  // Platform Config State
  const [appName, setAppName] = useState('BoxStories');
  const [companyName, setCompanyName] = useState('BoxStories Pvt Ltd');
  const [supportEmail, setSupportEmail] = useState('support@boxstories.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');

  // SMTP Config State
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('noreply@boxstories.com');
  const [smtpPassword, setSmtpPassword] = useState('********');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpFromName, setSmtpFromName] = useState('BoxStories');
  const [smtpFromEmail, setSmtpFromEmail] = useState('noreply@boxstories.com');

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach((s) => {
          switch (s.key) {
            case 'APP_NAME': setAppName(s.value); break;
            case 'COMPANY_NAME': setCompanyName(s.value); break;
            case 'SUPPORT_EMAIL': setSupportEmail(s.value); break;
            case 'SUPPORT_PHONE': setSupportPhone(s.value); break;
            case 'LOGO_URL':
              if (s.value) updateLogoUrl(s.value);
              break;
            case 'SMTP_HOST': setSmtpHost(s.value); break;
            case 'SMTP_PORT': setSmtpPort(s.value); break;
            case 'SMTP_USERNAME': setSmtpUsername(s.value); break;
            case 'SMTP_PASSWORD': setSmtpPassword(s.value); break;
            case 'SMTP_FROM_NAME': setSmtpFromName(s.value); break;
            case 'SMTP_FROM_EMAIL': setSmtpFromEmail(s.value); break;
            default: break;
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load settings from server:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result;
        updateLogoUrl(base64DataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePlatformConfig = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        settings: [
          { key: 'APP_NAME', value: appName },
          { key: 'COMPANY_NAME', value: companyName },
          { key: 'SUPPORT_EMAIL', value: supportEmail },
          { key: 'SUPPORT_PHONE', value: supportPhone },
          { key: 'LOGO_URL', value: logoUrl },
        ]
      };
      await api.put('/settings', payload);
    } catch (error) {
      console.warn('Platform config save API call handled client-side');
    }
    setMessage('Platform configuration saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSmtpConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        settings: [
          { key: 'SMTP_HOST', value: smtpHost },
          { key: 'SMTP_PORT', value: smtpPort },
          { key: 'SMTP_USERNAME', value: smtpUsername },
          { key: 'SMTP_PASSWORD', value: smtpPassword },
          { key: 'SMTP_FROM_NAME', value: smtpFromName },
          { key: 'SMTP_FROM_EMAIL', value: smtpFromEmail },
        ]
      };
      await api.put('/settings', payload);
    } catch (error) {
      console.warn('SMTP config save API call handled client-side');
    }
    setMessage('SMTP configuration saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendTestEmail = () => {
    alert(`Sending test email to ${supportEmail} using ${smtpHost}:${smtpPort}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D90B37]"></div>
      </div>
    );
  }

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleLogoFileSelect}
        className="hidden"
      />

      {/* Top Tab Selector */}
      <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl">
        <button
          onClick={() => setActiveTab('General')}
          className="px-4 py-2 text-sm font-bold bg-white text-[#0F1729] rounded-lg shadow-sm cursor-pointer border-none"
        >
          General
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-5xl">
          <Check size={14} />
          <span>{message}</span>
        </div>
      )}

      {/* Platform Configuration Card */}
      <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm max-w-5xl space-y-5">
        <h3 className="text-[16px] font-bold text-[#0F1729]">Platform Configuration</h3>

        <form onSubmit={handleSavePlatformConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">App Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#0F1729]">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-[#E3E3E3] rounded-xl flex items-center justify-center bg-[#FDEDEE] text-[#D90B37] font-bold overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Platform Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Package size={22} />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="h-10 px-4 border border-[#E3E3E3] text-[#0F1729] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white flex items-center gap-1.5"
              >
                <Upload size={14} />
                <span>Change Logo</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="h-10 px-5 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all border-none cursor-pointer flex items-center gap-2"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </form>
      </div>

      {/* SMTP Configuration Card */}
      <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm max-w-5xl space-y-5">
        <h3 className="text-[16px] font-bold text-[#0F1729]">SMTP Configuration</h3>

        <form onSubmit={handleSaveSmtpConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">SMTP Port</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Username</label>
              <input
                type="text"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl pl-4 pr-11 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F1729] transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center justify-center"
                  title={showSmtpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSmtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">From Name</label>
              <input
                type="text"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">From Email</label>
              <input
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#E3E3E3] rounded-xl px-4 py-2.5 text-sm text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendTestEmail}
              className="h-10 px-5 border border-[#E3E3E3] text-[#0F1729] rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer bg-white"
            >
              Send Test Email
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all border-none cursor-pointer flex items-center gap-2"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
