import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import Toast, { showToast } from '../components/Toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
  });

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast(setToast, 'warning', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      showToast(setToast, 'success', res.data?.message || 'OTP sent successfully to your email.');
      setStep(2);
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Failed to send OTP. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      showToast(setToast, 'warning', 'Please enter the OTP sent to your email');
      return;
    }

    if (password.length < 6) {
      showToast(setToast, 'warning', 'New password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast(setToast, 'warning', 'New Password and Confirm Password do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password-otp', {
        email: email.trim(),
        otp: otp.trim(),
        password,
      });

      showToast(setToast, 'success', res.data?.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      showToast(setToast, 'error', err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white font-['Kanit'] py-12 px-4 select-none">
      <div className="w-[500px] min-h-[580px] border-2 border-[#DFDFDE] bg-white rounded-[20px] flex flex-col justify-between p-10 box-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Top Content */}
        <div className="w-full flex flex-col items-center">
          {/* Logo (image 1) - 60x60 */}
          <div className="w-[60px] h-[60px] mb-4">
            <img src="/logo.png" alt="BoxStories Logo" className="w-full h-full object-contain" />
          </div>

          {/* Heading */}
          <h2 className="text-[34px] font-medium text-[#161423] text-center leading-[50.83px] tracking-tight">
            {step === 1 ? 'Forgot password?' : 'Forgot password'}
          </h2>

          {/* Subtitle */}
          <p className="text-[20px] font-normal text-[#545160] text-center leading-[29.9px] mt-0.5 mb-6">
            {step === 1
              ? "Enter your email and we'll send you an OTP"
              : 'Enter the OTP and your new password'}
          </p>

          {/* Step 1: Send OTP Form */}
          {step === 1 && (
            <form className="w-full space-y-5" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="reset-email" className="block text-[24px] font-normal text-[#171624] leading-[35.88px] mb-1">
                  Email
                </label>
                <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                  <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-[18px] text-[#171624] placeholder-[#999799] font-normal"
                    placeholder="deep@gmail.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[55px] bg-[#CE1C2B] hover:bg-[#AE032C] text-white font-normal text-[20px] rounded-[10px] transition-colors flex items-center justify-center gap-2 select-none border-none cursor-pointer focus:outline-none shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP and Set New Password Form */}
          {step === 2 && (
            <form className="w-full space-y-4" onSubmit={handleResetPassword}>
              {/* OTP Code Input */}
              <div>
                <label htmlFor="otp-code" className="block text-[22px] font-normal text-[#171624] leading-[32px] mb-1">
                  OTP Code
                </label>
                <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                  <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                    <KeyRound size={22} />
                  </div>
                  <input
                    id="otp-code"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-full bg-transparent border-none outline-none text-[18px] text-[#171624] placeholder-[#999799] font-normal tracking-widest"
                    placeholder="555555"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-[#CE1C2B] text-xs font-medium hover:underline bg-transparent border-none cursor-pointer p-1"
                  >
                    Resend
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-[22px] font-normal text-[#171624] leading-[32px] mb-1">
                  New Password
                </label>
                <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                  <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                    <Lock size={22} />
                  </div>
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-[18px] text-[#171624] placeholder-[#999799] font-normal"
                    placeholder="*****"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#CE1C2B] focus:outline-none hover:opacity-85 transition-opacity mr-1 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-[22px] font-normal text-[#171624] leading-[32px] mb-1">
                  Confirm Password
                </label>
                <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                  <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                    <Lock size={22} />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none text-[18px] text-[#171624] placeholder-[#999799] font-normal"
                    placeholder="*****"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#CE1C2B] focus:outline-none hover:opacity-85 transition-opacity mr-1 bg-transparent border-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Reset Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[55px] bg-[#CE1C2B] hover:bg-[#AE032C] text-white font-normal text-[20px] rounded-[10px] transition-colors flex items-center justify-center gap-2 select-none border-none cursor-pointer focus:outline-none shadow-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Forgot Password</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to sign in */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[20px] font-normal text-[#CE1C2B] hover:underline leading-[29.9px] transition-colors inline-flex items-center gap-1.5 no-underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ForgotPassword;
