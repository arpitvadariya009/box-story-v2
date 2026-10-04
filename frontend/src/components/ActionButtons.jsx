import React from 'react';
import { Filter, Download } from 'lucide-react';

const ActionButtons = ({
  onFilterClick,
  onExportClick,
  compact = false,
  hasActiveFilter = false,
  hasFilter = false,
}) => {
  const isFilterActive = Boolean(hasActiveFilter || hasFilter);
  const sizeClass = compact ? 'w-9 h-9 rounded-[10px]' : 'w-[44px] h-[44px] rounded-[14px]';

  return (
    <>
      <button 
        type="button"
        onClick={onFilterClick}
        title={isFilterActive ? 'Filter applied' : 'Filter'}
        className={`flex items-center justify-center ${sizeClass} bg-white border border-[#E3E3E3] text-[#545454] hover:bg-slate-50 transition-colors cursor-pointer shadow-sm relative`}
      >
        <Filter size={18} />
        {isFilterActive && (
          <span 
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D90B37] rounded-full ring-2 ring-white"
            title="Filter active"
          />
        )}
      </button>

      <button 
        type="button"
        onClick={onExportClick}
        title="Export"
        className={`flex items-center justify-center ${sizeClass} bg-white border border-[#E3E3E3] text-[#545454] hover:bg-slate-50 transition-colors cursor-pointer shadow-sm`}
      >
        <Download size={18} />
      </button>
    </>
  );
};

export default ActionButtons;
