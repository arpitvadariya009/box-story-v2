import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format a Date object to YYYY-MM-DD string
 */
const toISODate = (d) => {
  if (!d || isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD or DD-MM-YYYY into a Date object at local midnight
 */
const parseDateString = (str) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();

  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/).map(Number);
    const date = new Date(parts[2], parts[1] - 1, parts[0]);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

/**
 * Format YYYY-MM-DD to display format DD-MM-YYYY
 */
const toDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const d = parseDateString(isoStr);
  if (!d) return isoStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Advance Custom DatePicker matching BoxStories Crimson Theme (#D90B37)
 */
const ThemeDatePicker = ({
  value = '',
  onChange,
  minDate = '',
  maxDate = '',
  placeholder = 'dd-mm-yyyy',
  className = '',
  inputClassName = '',
  disabled = false,
  ariaLabel = 'Date picker',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Active viewing month & year for the calendar popup
  const selectedDate = useMemo(() => parseDateString(value), [value]);
  const minDateObj = useMemo(() => parseDateString(minDate), [minDate]);
  const maxDateObj = useMemo(() => parseDateString(maxDate), [maxDate]);

  const [viewDate, setViewDate] = useState(() => {
    return selectedDate || new Date();
  });

  // When value prop updates externally, synchronize viewDate and typedText
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
    if (!isTyping) {
      setTypedText(toDisplayDate(value));
    }
  }, [value, selectedDate, isTyping]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [opensUpward, setOpensUpward] = useState(false);

  // Auto-detect if popup should open upward when near bottom of viewport
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popupHeight = 310;
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        setOpensUpward(true);
      } else {
        setOpensUpward(false);
      }
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsTyping(false);
        setTypedText(toDisplayDate(value));
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value]);

  // Calendar navigation
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Generate days in month grid (6 rows x 7 cols = 42 cells)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        date: new Date(viewYear, viewMonth, d),
        isCurrentMonth: true,
      });
    }

    // Days of next month to fill 42 cells
    const remaining = 42 - days.length;
    for (let n = 1; n <= remaining; n++) {
      days.push({
        date: new Date(viewYear, viewMonth + 1, n),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Check if a date is disabled by minDate or maxDate
  const isDateDisabled = (d) => {
    const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (minDateObj) {
      const minTime = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate()).getTime();
      if (time < minTime) return true;
    }
    if (maxDateObj) {
      const maxTime = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate()).getTime();
      if (time > maxTime) return true;
    }
    return false;
  };

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (d) => {
    if (!selectedDate) return false;
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleSelectDate = (d) => {
    if (isDateDisabled(d)) return;
    const iso = toISODate(d);
    onChange && onChange(iso);
    setTypedText(toDisplayDate(iso));
    setIsTyping(false);
    setIsOpen(false);
  };

  // Manual typing handler
  const handleInputChange = (e) => {
    const txt = e.target.value;
    setTypedText(txt);
    setIsTyping(true);

    const parsed = parseDateString(txt);
    if (parsed) {
      if (!isDateDisabled(parsed)) {
        const iso = toISODate(parsed);
        onChange && onChange(iso);
        setViewDate(parsed);
      }
    } else if (txt.trim() === '') {
      onChange && onChange('');
    }
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    const parsed = parseDateString(typedText);
    if (parsed) {
      if (isDateDisabled(parsed)) {
        // Clamp to boundary
        if (minDateObj && parsed < minDateObj) {
          const iso = toISODate(minDateObj);
          onChange && onChange(iso);
          setTypedText(toDisplayDate(iso));
        } else if (maxDateObj && parsed > maxDateObj) {
          const iso = toISODate(maxDateObj);
          onChange && onChange(iso);
          setTypedText(toDisplayDate(iso));
        }
      } else {
        const iso = toISODate(parsed);
        onChange && onChange(iso);
        setTypedText(toDisplayDate(iso));
      }
    } else {
      setTypedText(toDisplayDate(value));
    }
  };

  const handleQuickToday = () => {
    const today = new Date();
    if (!isDateDisabled(today)) {
      handleSelectDate(today);
    }
  };

  const handleClear = () => {
    onChange && onChange('');
    setTypedText('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          disabled={disabled}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`w-full bg-white border border-[#E2E8F0] ${
            inputClassName || 'rounded-xl pl-4 py-2.5 text-[13px]'
          } pr-10 font-medium text-[#0F1729] placeholder-[#94A3B8] focus:outline-none focus:border-[#D90B37] focus:ring-2 focus:ring-[#D90B37]/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? 'border-[#D90B37] ring-2 ring-[#D90B37]/15' : ''
          }`}
        />

        {/* Single Right-Side Theme Calendar Button */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          title="Toggle Calendar"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#D90B37] hover:bg-[#FDEDEE] transition-colors cursor-pointer bg-transparent border-none"
        >
          <CalendarIcon size={16} className="pointer-events-none" />
        </button>
      </div>

      {/* Advance Floating Calendar Popup */}
      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
          opensUpward ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
        } z-50 w-[296px] bg-white border border-[#EDEDED] rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] p-3.5 font-['Inter',sans-serif] animate-in fade-in zoom-in-95 duration-150`}>
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#0F1729]">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="text-[14px] font-semibold text-[#64748B]">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F1729] border border-[#E2E8F0] transition-colors cursor-pointer bg-white"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F1729] border border-[#E2E8F0] transition-colors cursor-pointer bg-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span
                key={d}
                className="text-[11px] font-bold text-[#94A3B8] py-1 select-none"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const disabledDay = isDateDisabled(date);
              const active = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  key={`day-${idx}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDate(date)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-[12.5px] rounded-xl transition-all cursor-pointer relative border ${
                    active
                      ? 'bg-[#D90B37] text-white font-bold border-[#D90B37] shadow-[0_3px_10px_rgba(217,11,55,0.35)] scale-105'
                      : disabledDay
                      ? 'opacity-25 text-slate-400 bg-slate-50/50 border-transparent cursor-not-allowed line-through'
                      : today
                      ? 'border-[#D90B37] text-[#D90B37] font-bold hover:bg-[#FDEDEE]'
                      : isCurrentMonth
                      ? 'text-[#0F1729] font-medium border-transparent hover:bg-[#FDEDEE] hover:text-[#D90B37]'
                      : 'text-slate-300 font-normal border-transparent hover:bg-slate-50'
                  }`}
                >
                  {date.getDate()}
                  {today && !active && (
                    <span className="absolute bottom-1 w-1 h-1 bg-[#D90B37] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F1F5F9] text-xs font-semibold">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#64748B] hover:text-[#0F1729] px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors bg-transparent border-none cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleQuickToday}
              className="text-[#D90B37] hover:text-[#AE032C] px-3 py-1 rounded-lg bg-[#FDEDEE] hover:bg-[#FDEDEE]/80 transition-colors border-none cursor-pointer font-bold"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDatePicker;
