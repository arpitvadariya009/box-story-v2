import React from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { SecondaryButton, ModalFooter } from './FormControls';

const ExportModal = ({
  isOpen,
  onClose,
  exportFormat,
  setExportFormat,
  recordCount,
  onExport,
  loading = false,
  progress = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl relative p-6 font-['Inter',sans-serif]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#D90B37]" strokeWidth={2.2} />
            <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Export Data</h3>
          </div>
          <button
            type="button"
            onClick={!loading ? onClose : undefined}
            disabled={loading}
            className={`text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1 ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[14px] font-semibold text-[#0F1729] mb-2">Format</label>
            <div className="relative">
              <select 
                disabled={loading}
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                className={`w-full border border-[#E3E3E3] rounded-xl px-4 py-3 text-sm text-[#0F1729] focus:outline-none focus:border-[#D90B37] appearance-none bg-transparent cursor-pointer ${loading ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
              >
                <option value="Excel">Excel (.xlsx)</option>
                <option value="CSV">CSV (.csv)</option>
                <option value="PDF">PDF (.pdf)</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#0F1729" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[13px] text-[#878787] bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100">
            <span>Total Records in Dataset:</span>
            <span className="font-semibold text-[#0F1729]">{(recordCount ?? 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Queue Progress Bar */}
          {loading && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 truncate max-w-[280px] flex items-center gap-1.5" title={progress?.message}>
                  <Loader2 size={13} className="animate-spin text-[#D90B37] shrink-0" />
                  <span className="truncate">{progress?.message || 'Processing in queued batches...'}</span>
                </span>
                <span className="text-[#D90B37] font-bold font-mono shrink-0 ml-2">
                  {progress?.percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-[#D90B37] h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(Math.max(progress?.percentage || 5, 5), 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                Safe queued batching active • Preventing timeouts & network overload
              </div>
            </div>
          )}
        </div>
        
        <ModalFooter className="mt-6">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>
          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className={`h-10 px-5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border-none shadow-sm ${
              loading
                ? 'bg-[#D90B37]/70 cursor-not-allowed'
                : 'bg-[#D90B37] hover:bg-[#AE032C] cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting Queue...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export Data</span>
              </>
            )}
          </button>
        </ModalFooter>
      </div>
    </div>
  );
};

export default ExportModal;
