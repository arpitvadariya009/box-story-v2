import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Notification Component
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   showToast(setToast, 'error', 'Email is required');
 *   showToast(setToast, 'success', 'Client added!');
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 */

export const showToast = (setToast, type, message) => {
  setToast({ type, message, id: Date.now() });
};

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#BBF7D0]',
    text: 'text-[#15803D]',
    iconColor: 'text-[#22C55E]',
    bar: 'bg-[#22C55E]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#FFF1F2]',
    border: 'border-[#FECDD3]',
    text: 'text-[#BE123C]',
    iconColor: 'text-[#F43F5E]',
    bar: 'bg-[#F43F5E]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    text: 'text-[#92400E]',
    iconColor: 'text-[#F59E0B]',
    bar: 'bg-[#F59E0B]',
  },
};

const Toast = ({ toast, onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    setLeaving(false);

    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(leaveTimer);
  }, [toast?.id]);

  if (!toast || !visible) return null;

  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.error;
  const Icon = cfg.icon;

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex flex-col gap-0 shadow-xl rounded-xl overflow-hidden border ${cfg.bg} ${cfg.border}
        transition-all duration-300 ${leaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      style={{ minWidth: 300, maxWidth: 400 }}
    >
      {/* Progress bar */}
      <div
        className={`h-[3px] ${cfg.bar} origin-left`}
        style={{
          animation: `toast-shrink ${duration}ms linear forwards`,
        }}
      />

      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
        <p className={`flex-1 text-[13px] font-medium ${cfg.text} leading-snug`}>{toast.message}</p>
        <button
          onClick={() => { setLeaving(true); setTimeout(() => { setVisible(false); onClose?.(); }, 300); }}
          className={`${cfg.iconColor} opacity-60 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-0 mt-0.5`}
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
