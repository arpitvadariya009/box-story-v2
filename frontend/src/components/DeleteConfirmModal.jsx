import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName = '',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[460px] rounded-2xl shadow-2xl relative border border-[#E1E7EF] overflow-hidden">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#D90B37]">
            <AlertTriangle size={24} />
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-3">
          <h3 className="text-[19px] font-bold text-[#0F1729] mb-1.5">{title}</h3>
          <p className="text-[14px] text-[#64748B] leading-relaxed">
            {message}
          </p>
          {itemName && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0F1729] truncate">
              {itemName}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 bg-slate-50/50 border-t border-[#E3E3E3] mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 text-sm font-semibold text-[#64748B] hover:text-[#0F1729] hover:bg-slate-200/60 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 px-5 bg-[#D90B37] hover:bg-[#AE032C] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
