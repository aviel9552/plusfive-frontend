import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import CommonPagination from './CommonPagination';
import { createPortal } from 'react-dom';
import { HiDotsHorizontal } from 'react-icons/hi';

const PAGE_SIZES = [7, 10, 20, 30, 50];

// Search component
const SearchInput = React.memo(({ value, onChange }) => (
  <div className="relative flex-1">
    <input
      type="text"
      placeholder="Search..."
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#232323] border-2 border-gray-200 dark:border-customBorderColor rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
      aria-label="Search table"
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    </span>
  </div>
));

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

// Filter component
const FilterDropdown = React.memo(({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative min-w-[180px]" ref={filterRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white px-4 py-2.5 rounded-xl text-sm border-2 border-gray-200 dark:border-customBorderColor hover:border-pink-500 dark:hover:border-pink-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
        onClick={() => setIsOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value || 'Filter'}</span>
        <svg className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-full bg-white dark:bg-[#232323] border-2 border-gray-200 dark:border-customBorderColor rounded-xl shadow-lg z-20 animate-fadeIn overflow-hidden"
          role="listbox"
        >
          {options.map(option => (
            <button
              key={option}
              className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-colors duration-150
                ${value === option ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-white'}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

FilterDropdown.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};

function DropdownPortal({ anchorRef, open, children }) {
  const [style, setStyle] = React.useState({});
  const dropdownRef = React.useRef();

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 180;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      if (left < 8) left = 8;

      // Height calculation
      let dropdownHeight = 0;
      if (dropdownRef.current) {
        dropdownHeight = dropdownRef.current.offsetHeight;
      } else {
        dropdownHeight = 60;
      }

      // Direction logic
      let top = rect.bottom;
      if (window.innerHeight - rect.bottom < dropdownHeight + 8) {
        // Not enough space below, open upward
        top = rect.top - dropdownHeight;
        if (top < 8) top = 8;
      }
      setStyle({
        position: 'fixed',
        left,
        top,
        zIndex: 2147483647, // max z-index
        width: dropdownWidth,
        minWidth: 140,
        maxWidth: '95vw',
        maxHeight: '60vh',
        overflowY: 'auto',
      });
    }
  }, [open, anchorRef, children]);

  // Close on scroll/resize
  React.useEffect(() => {
    if (!open) return;
    const close = () => setStyle(s => ({ ...s }));
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div ref={dropdownRef} style={style} className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg py-1 z-[2147483647]">
      {children}
    </div>,
    document.body
  );
}

const CommonTable = ({
  columns,
  data,
  total,
  searchValue = '',
  onSearchChange,
  filterValue = '',
  filterOptions,
  onFilterChange,
  loading = false,
  renderActions,
  onSort,
  loadingComponent,
  noDataComponent,
  className = '',
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  pageSize = PAGE_SIZES[0],
  showPagination = true,
  paginationProps = {},
  showCount = true
}) => {
  const [sortConfig, setSortConfig] = useState(null);
  const actionBtnRefs = useRef([]);
  const [openAction, setOpenAction] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);

  const handleSort = useCallback((key) => {
    if (!onSort) return;

    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort(key, direction);
  }, [sortConfig, onSort]);

  const handleActionClick = (idx) => {
    if (openAction === idx) {
      setOpenAction(null);
      setOpenUpward(false);
      return;
    }
    const btnRect = actionBtnRefs.current[idx]?.getBoundingClientRect();
    const spaceBelow = window.innerHeight - (btnRect?.bottom || 0);
    setOpenUpward(spaceBelow < 180);
    setOpenAction(idx);
  };

  return (
    <div className={`shadow-sm dark:shadow-none transition-colors duration-200 font-ttcommons ${className}`}>
      {/* <div className={`flex flex-col sm:flex-row gap-4 ${onSearchChange || onFilterChange ? 'mb-6' : 'mb-0'}`}>
        {onSearchChange && (
          <SearchInput value={searchValue} onChange={onSearchChange} />
        )}
        {onFilterChange && filterOptions && (
          <FilterDropdown value={filterValue} options={filterOptions} onChange={onFilterChange} />
        )}
      </div> */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto" role="grid">
          <thead>
            <tr className="border-b border-gray-200 dark:border-customBorderColor">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300 ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={sortConfig?.key === col.key ? sortConfig.direction : undefined}
                >
                  <div className="flex items-center gap-1 text-16">
                    {col.label}
                    {col.sortable && (
                      <svg
                        className={`w-4 h-4 transition-transform ${sortConfig?.key === col.key
                            ? sortConfig.direction === 'asc'
                              ? 'transform rotate-180'
                              : ''
                            : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 15l4 4 4-4M8 9l4-4 4 4" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              {renderActions && <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8">
                  {loadingComponent || 'Loading...'}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8 dark:text-white">
                  {noDataComponent || 'No data found'}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-200 dark:border-[#FFFFFF1A] hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors`}
                  role="row"
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-14 ${col.className || ''}`}
                      role="gridcell"
                    >
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="py-3 px-4" role="gridcell">
                      {renderActions(row, idx)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCount && (
        <span >
          {showPagination && onPageChange && (
            <div className="mt-6">
              <CommonPagination
                currentPage={currentPage}
                pageSize={pageSize}
                total={total}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                {...paginationProps}
              />
            </div>
          )}
        </span>
      )}

    </div>
  );
};

CommonTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      className: PropTypes.string,
      sortable: PropTypes.bool
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  total: PropTypes.number,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  onFilterChange: PropTypes.func,
  loading: PropTypes.bool,
  renderActions: PropTypes.func,
  onSort: PropTypes.func,
  loadingComponent: PropTypes.node,
  noDataComponent: PropTypes.node,
  className: PropTypes.string,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  showPagination: PropTypes.bool,
  paginationProps: PropTypes.object
};

export default CommonTable; 