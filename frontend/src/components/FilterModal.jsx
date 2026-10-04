import React from 'react';
import { Filter, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton, ModalFooter } from './FormControls';
import ThemeDatePicker from './ThemeDatePicker';

const FilterModal = ({
  isOpen,
  onClose,
  statusOptions,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  onApply,
  onReset
}) => {
  if (!isOpen) return null;

  const handleFromChange = (val) => {
    setFilterDateFrom(val || '');
    // If Date To exists and is earlier than new Date From, reset Date To
    if (val && filterDateTo && val > filterDateTo) {
      setFilterDateTo('');
    }
  };

  const handleToChange = (val) => {
    // Disallow choosing Date To that is earlier than Date From
    if (val && filterDateFrom && val < filterDateFrom) {
      return;
    }
    setFilterDateTo(val || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#D90B37]" strokeWidth={2.2} />
            <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Filter Records</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-semibold text-[#0F1729] mb-2">Status</label>
            <div className="relative">
              <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-[#E3E3E3] focus:border-[#D90B37] rounded-xl px-4 py-3 text-sm text-[#0F1729] focus:outline-none appearance-none bg-transparent cursor-pointer"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#0F1729" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5">
            {/* Date From */}
            <div>
              <label className="block text-[14px] font-semibold text-[#0F1729] mb-2">Date From</label>
              <ThemeDatePicker
                value={filterDateFrom || ''}
                maxDate={filterDateTo || ''}
                onChange={handleFromChange}
                placeholder="dd-mm-yyyy"
                ariaLabel="Date From"
                align="left"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[14px] font-semibold text-[#0F1729] mb-2">Date To</label>
              <ThemeDatePicker
                value={filterDateTo || ''}
                minDate={filterDateFrom || ''}
                onChange={handleToChange}
                placeholder="dd-mm-yyyy"
                ariaLabel="Date To"
                align="right"
              />
            </div>
          </div>
        </div>
        
        <ModalFooter className="mt-8">
          <SecondaryButton 
            onClick={() => { 
              setFilterStatus(statusOptions[0]); 
              setFilterDateFrom(''); 
              setFilterDateTo(''); 
              if (onReset) onReset();
            }} 
          >
            Reset
          </SecondaryButton>
          <PrimaryButton 
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }} 
          >
            Apply Filters
          </PrimaryButton>
        </ModalFooter>
      </div>
    </div>
  );
};

export default FilterModal;
