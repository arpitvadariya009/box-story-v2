import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Inbox
} from 'lucide-react';

/**
 * Standalone Reusable Pagination Component
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  rowsPerPage = 10,
  itemLabel = 'records',
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100]
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0 && totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[#64748B] select-none bg-white">
      {/* Left: Showing Page Info */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span>Showing page</span>
        <span className="font-bold text-[#0F1729]">{currentPage}</span>
        <span>of</span>
        <span className="font-bold text-[#0F1729]">{totalPages}</span>
        {totalItems > 0 && (
          <span className="text-[#94A3B8] ml-1">
            ({totalItems.toLocaleString()} total {itemLabel})
          </span>
        )}
      </div>

      {/* Center: Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page << */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 hover:text-[#0F1729] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Prev Page < */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Previous Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 hover:text-[#0F1729] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-[#94A3B8] font-bold">
                  •••
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}-${idx}`}
                type="button"
                onClick={() => onPageChange && onPageChange(p)}
                className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#D90B37] text-white border-[#D90B37] shadow-sm'
                    : 'bg-white text-[#475569] border-transparent hover:border-[#E2E8F0] hover:bg-slate-50 hover:text-[#0F1729]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page > */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          title="Next Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 hover:text-[#0F1729] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page >> */}
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 hover:text-[#0F1729] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all bg-white"
        >
          <ChevronsRight size={15} />
        </button>
      </div>

      {/* Right: Rows per page */}
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] text-[#64748B]">Rows per page</span>
        <div className="relative inline-block">
          <select
            value={rowsPerPage}
            onChange={e => onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))}
            className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-[#0F1729] cursor-pointer focus:outline-none focus:border-[#D90B37] transition-all"
          >
            {rowsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable DataTable Component with Sticky Header, Internal Scrolling, and Consistent Pagination
 *
 * Props:
 * - columns: Array of { header: string, key?: string, render?: (item, index) => ReactNode, className?: string, headerClassName?: string, width?: string }
 * - data: Array of items/rows
 * - renderRow: (item, index) => ReactNode (alternative to columns)
 * - loading: boolean
 * - emptyMessage: string
 * - emptySubMessage: string
 * - emptyIcon: Lucide icon component
 * - maxHeight: string (default: '520px')
 * - initialRowsPerPage: number (default: 10)
 * - rowsPerPageOptions: number[] (default: [10, 25, 50, 100])
 * - showPagination: boolean (default: true)
 * - itemLabel: string (default: 'records')
 * - manualPagination: boolean (default: false)
 * - page: number (used if manualPagination is true)
 * - totalPages: number (used if manualPagination is true)
 * - totalItems: number (used if manualPagination is true)
 * - onPageChange: (page: number) => void
 * - onRowsPerPageChange: (rows: number) => void
 * - keyField: string | ((item, index) => string) (default: '_id' or 'id')
 */
const DataTable = ({
  columns = [],
  data = [],
  renderRow,
  loading = false,
  emptyMessage = 'No records found',
  emptySubMessage = '',
  emptyIcon: EmptyIcon = Inbox,
  maxHeight = '100%',
  initialRowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50, 100],
  showPagination = true,
  itemLabel = 'records',
  manualPagination = false,
  page: controlledPage,
  totalPages: controlledTotalPages,
  totalItems: controlledTotalItems,
  rowsPerPage: controlledRowsPerPage,
  onPageChange: controlledOnPageChange,
  onRowsPerPageChange: controlledOnRowsPerPageChange,
  keyField = '_id',
  className = '',
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(initialRowsPerPage);

  const currentPage = manualPagination ? (controlledPage || 1) : internalPage;
  const rowsPerPage = manualPagination ? (controlledRowsPerPage || initialRowsPerPage || 10) : internalRowsPerPage;

  // Auto calculate client-side pagination if not manual
  const calculatedTotalPages = useMemo(() => {
    if (manualPagination) return controlledTotalPages || 1;
    return Math.max(1, Math.ceil(data.length / rowsPerPage));
  }, [manualPagination, controlledTotalPages, data.length, rowsPerPage]);

  const validCurrentPage = Math.min(Math.max(1, currentPage), calculatedTotalPages);

  const displayData = useMemo(() => {
    if (manualPagination) {
      // If full array was passed in manual mode, slice to the exact page size
      if (data.length > rowsPerPage) {
        const start = (validCurrentPage - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
      }
      return data;
    }
    const start = (validCurrentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [manualPagination, data, validCurrentPage, rowsPerPage]);

  const handlePageChange = (newPage) => {
    if (manualPagination) {
      if (controlledOnPageChange) controlledOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
      if (controlledOnPageChange) controlledOnPageChange(newPage);
    }
  };

  const handleRowsPerPageChange = (newRows) => {
    if (manualPagination) {
      if (controlledOnRowsPerPageChange) controlledOnRowsPerPageChange(newRows);
    } else {
      setInternalRowsPerPage(newRows);
      setInternalPage(1);
      if (controlledOnRowsPerPageChange) controlledOnRowsPerPageChange(newRows);
    }
  };

  const totalCount = manualPagination ? (controlledTotalItems ?? data.length) : data.length;
  const colSpan = columns.length || 7;

  const getItemKey = (item, index) => {
    if (typeof keyField === 'function') return keyField(item, index);
    return item[keyField] || item.id || item._id || `row-${index}`;
  };

  return (
    <div className={`w-full max-w-full flex-1 flex flex-col justify-between overflow-hidden min-h-0 min-w-0 ${className}`}>
      {/* Scrollable Table Container */}
      <div
        className="flex-1 overflow-x-auto overflow-y-auto min-h-0 min-w-0 w-full"
        style={maxHeight && !['520px', '540px', 'none', '100%'].includes(maxHeight) ? { maxHeight } : undefined}
      >
        <table className="w-full min-w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-[#FAFAFA] shadow-[0_1px_0_rgba(241,245,249,1)]">
            <tr className="border-b border-[#F1F5F9] text-[11px] font-semibold uppercase tracking-wider text-[#878787]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || `col-${idx}`}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-5 py-3.5 font-semibold bg-[#FAFAFA] whitespace-nowrap ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#F1F5F9] text-[13.5px]">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                  </div>
                </td>
              </tr>
            ) : totalCount === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-14 text-center text-[#878787]">
                  <EmptyIcon size={32} className="mx-auto mb-3 text-[#EDEDED]" />
                  <p className="font-semibold text-sm text-[#0F1729]">{emptyMessage}</p>
                  {emptySubMessage && (
                    <p className="text-xs mt-1 text-[#878787]">{emptySubMessage}</p>
                  )}
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => {
                if (renderRow) {
                  return renderRow(item, index);
                }

                return (
                  <tr
                    key={getItemKey(item, index)}
                    className="hover:bg-[#FAFAFA] transition-colors"
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || `cell-${cIdx}`}
                        className={`px-5 py-3.5 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(item, index)
                          : col.key
                          ? item[col.key] ?? '—'
                          : '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && !loading && totalCount > 0 && (
        <div className="flex-shrink-0 mt-auto">
          <Pagination
            currentPage={validCurrentPage}
            totalPages={calculatedTotalPages}
            totalItems={totalCount}
            rowsPerPage={rowsPerPage}
            itemLabel={itemLabel}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
