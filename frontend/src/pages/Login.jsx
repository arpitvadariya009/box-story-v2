import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import Toast, { showToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true); // matching checkbox logic or logging in status
  const [toast, setToast] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Invalid email or password');
      showToast(setToast, 'error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white font-['Kanit'] py-12 px-4 select-none">
      <div className="w-[500px] h-[635px] border-2 border-[#DFDFDE] bg-white rounded-[20px] flex flex-col justify-between p-10 box-border">
        {/* Form Container (Group 4) */}
        <div className="w-full flex flex-col items-center">
          {/* Logo (image 1) - Node size 60x60 */}
          <div className="w-[60px] h-[60px] mb-4">
            <img src="/logo.png" alt="BoxStories Logo" className="w-full h-full object-contain" />
          </div>

          {/* Welcome back (Node size 34px, Kanit Medium) */}
          <h2 className="text-[34px] font-medium text-[#161423] text-center leading-[50.83px] tracking-tight">
            Welcome back
          </h2>
          
          {/* Sign in to your account (Node size 20px, Kanit Regular) */}
          <p className="text-[20px] font-normal text-[#545160] text-center leading-[29.9px] mt-0.5 mb-6">
            Sign in to your account
          </p>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[24px] font-normal text-[#171624] leading-[35.88px] mb-1">
                Email
              </label>
              <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <input
                  id="email"
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[24px] font-normal text-[#171624] leading-[35.88px] mb-1">
                Password
              </label>
              <div className="relative w-full h-[55px] bg-[#F5F4F4] border border-[#DFDFDE] rounded-[10px] flex items-center px-3 box-border focus-within:border-[#CE1C2B] focus-within:ring-1 focus-within:ring-[#CE1C2B]/20 transition-all">
                <div className="text-[#CE1C2B] mr-2 flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <input
                  id="password"
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
                  className="text-[#CE1C2B] focus:outline-none hover:opacity-85 transition-opacity mr-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Logging in as User Checkbox */}
            <div className="flex items-center gap-2 py-1 select-none">
              <input
                id="role-checkbox"
                type="checkbox"
                checked={isAdminMode}
                onChange={(e) => setIsAdminMode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#CE1C2B] focus:ring-[#CE1C2B] accent-[#CE1C2B]"
              />
              <label htmlFor="role-checkbox" className="text-[18px] font-normal text-black leading-[26.9px] cursor-pointer">
                Logging in as User
              </label>
            </div>

            {/* Submit Button (Rectangle 4) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[55px] bg-[#CE1C2B] hover:bg-[#AE032C] text-white font-normal text-[20px] rounded-[10px] transition-colors flex items-center justify-center gap-2 select-none border-none cursor-pointer focus:outline-none"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>

        {/* Forgot password? (Kanit Regular, 20px, CE1C2B) */}
        <div className="text-center mt-2">
          <Link
            to="/forgot-password"
            className="text-[20px] font-normal text-[#CE1C2B] hover:underline leading-[29.9px] transition-colors inline-block no-underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Login;
