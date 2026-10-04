import React, { useState } from 'react';
import { ChevronDown, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

/**
 * Validation helper utilities
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@company.com)';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Mobile number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) {
    return 'Please enter a valid 10-digit mobile number';
  }
  return '';
};

export const validateGstin = (gstin) => {
  if (!gstin || !gstin.trim()) return '';
  const trimmed = gstin.trim().toUpperCase();
  if (trimmed.length !== 15) {
    return 'GSTIN must be exactly 15 characters (e.g. 24AAAAA0000A1Z5)';
  }
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(trimmed)) {
    return 'Invalid GSTIN format (e.g. 24AAAAA0000A1Z5)';
  }
  return '';
};

export const validateHsn = (hsn) => {
  if (!hsn || !hsn.trim()) return '';
  const digits = hsn.trim().replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 8) {
    return 'HSN code must be 4 to 8 digits (e.g. 4820, 85183000)';
  }
  return '';
};

/**
 * Form-level inline error banner ("pati") to display inside dialogs
 */
export const FormErrorBanner = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="bg-[#FDEDEE] border border-[#D90B37]/30 text-[#D90B37] px-4 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-[13px] font-semibold mb-4 animate-in fade-in duration-150">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={16} className="flex-shrink-0" />
        <span className="break-words">{error}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#D90B37] hover:text-[#A30D26] p-0.5 bg-transparent border-none cursor-pointer flex-shrink-0"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

/**
 * Standardized InputField component matching the exact BoxStory design system.
 */
export const InputField = ({
  label,
  required,
  error,
  icon: Icon,
  type = 'text',
  isPhone = false,
  isGstin = false,
  isHsn = false,
  onChange,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isTelephone = isPhone || type === 'tel';
  const isPassword = type === 'password';
  const effectiveType = isTelephone ? 'tel' : isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleChange = (e) => {
    if (isTelephone) {
      // Disallow any non-digit character, maximum 10 digits
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    } else if (isGstin) {
      // Uppercase alphanumeric, maximum 15 characters
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    } else if (isHsn) {
      // Digits only, maximum 8 digits
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
          {label} {required && <span className="text-[#D90B37]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          type={effectiveType}
          maxLength={isTelephone ? 10 : isGstin ? 15 : isHsn ? 8 : props.maxLength}
          inputMode={isTelephone || isHsn ? 'numeric' : props.inputMode}
          onChange={handleChange}
          {...props}
          className={`w-full h-11 bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl px-3.5 text-sm font-medium text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white placeholder-[#B0B0B0] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${isPassword ? 'pr-11' : ''} ${error ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20 focus:border-[#D90B37]' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F1729] transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center justify-center"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px] font-semibold text-[#D90B37] mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle size={13} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Standardized SelectField component matching InputField appearance with custom ChevronDown.
 */
export const SelectField = ({
  label,
  required,
  error,
  icon: Icon,
  options = [],
  children,
  className = '',
  wrapperClassName = '',
  placeholder,
  ...props
}) => {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
          {label} {required && <span className="text-[#D90B37]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <select
          {...props}
          className={`w-full h-11 bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl pl-3.5 pr-9 text-sm font-medium text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children ? (
            children
          ) : (
            options.map((opt, idx) => (
              <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))
          )}
        </select>
        <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="text-[12px] font-semibold text-[#D90B37] mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle size={13} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Standardized TextareaField component matching InputField design.
 */
export const TextareaField = ({
  label,
  required,
  error,
  rows = 3,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-[#0F1729] mb-1.5">
          {label} {required && <span className="text-[#D90B37]">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        className={`w-full bg-[#F8FAFC] border border-[#E3E3E3] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#0F1729] outline-none focus:border-[#D90B37] focus:bg-white placeholder-[#B0B0B0] transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-[#D90B37] ring-1 ring-[#D90B37]/20 focus:border-[#D90B37]' : ''
        } ${className}`}
      />
      {error && (
        <p className="text-[12px] font-semibold text-[#D90B37] mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
          <AlertCircle size={13} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Standardized Primary Action Button matching Figma design theme
 */
export const PrimaryButton = ({
  children,
  className = '',
  loading = false,
  disabled,
  icon: Icon,
  type = 'submit',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`h-11 px-6 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{typeof children === 'string' ? children : 'Processing...'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </button>
  );
};

/**
 * Standardized Secondary / Cancel Button matching Figma design theme
 */
export const SecondaryButton = ({
  children = 'Cancel',
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`h-11 px-6 bg-white hover:bg-slate-50 border border-[#E3E3E3] text-[#555555] rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

/**
 * Standardized Modal Footer Container
 */
export const ModalFooter = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 ${className}`}>
      {children}
    </div>
  );
};

export default {
  InputField,
  SelectField,
  TextareaField,
  PrimaryButton,
  SecondaryButton,
  ModalFooter
};
