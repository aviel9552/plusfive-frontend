import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import CommonPagination from './CommonPagination';
import CommonButton from './CommonButton';
import { createPortal } from 'react-dom';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiCalendar, FiDownload, FiPlus } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminUserTranslations } from '../../utils/translations';
import * as XLSX from 'xlsx';
import CommonDateRange from './CommonDateRange';

const PAGE_SIZES = [7, 10, 20, 30, 50];

// Search component
const SearchInput = React.memo(({ value, onChange, onFocus, onBlur, placeholder }) => (
  <div className="relative flex-1">
    <input
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
      aria-label="Search table"
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" aria-hidden="true">
      <FiSearch className="w-5 h-5" />
    </span>
  </div>
));

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string
};

// Filter component
const FilterDropdown = React.memo(({ value, options, onChange, icon, label }) => {
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

  // Helper function to get option value and label
  const getOptionValue = (option) => typeof option === 'object' ? option.value : option;
  const getOptionLabel = (option) => typeof option === 'object' ? option.label : option;

  return (
    <div className="relative min-w-[140px]" ref={filterRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between bg-gray-50 dark:bg-transparent text-gray-900 dark:text-white px-4 py-2.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:border-pink-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
        onClick={() => setIsOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
          <span>{value ? options.find(opt => getOptionValue(opt) === value)?.label || value : label}</span>
        </div>
        <svg className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-20 animate-fadeIn overflow-hidden"
          role="listbox"
        >
          {options.map(option => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            return (
              <button
                key={optionValue}
                className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                  ${value === optionValue ? 'bg-blue-500/20 text-pink-600 dark:text-pink-400' : 'text-gray-900 dark:text-white'}`}
                onClick={() => {
                  onChange(optionValue);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={value === optionValue}
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

FilterDropdown.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      })
    ])
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  icon: PropTypes.node,
  label: PropTypes.string
};

function DropdownPortal({ anchorRef, open, children }) {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef();

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const dropdownWidth = 180;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      if (left < 8) left = 8;

      // Calculate dropdown height
      let dropdownHeight = 0;
      if (dropdownRef.current) {
        dropdownHeight = dropdownRef.current.offsetHeight;
      } else {
        dropdownHeight = 60; // fallback
      }

      // Direction logic
      let top = rect.bottom;
      if (window.innerHeight - rect.bottom < dropdownHeight + 8) {
        // Not enough space below, open upward
        top = rect.top - dropdownHeight;
        if (top < 8) top = 8; // clamp to top
      }
      setStyle({
        position: 'fixed',
        left,
        top,
        zIndex: 99999,
        width: dropdownWidth,
        minWidth: 140,
        maxWidth: '95vw',
        maxHeight: '60vh',
        overflowY: 'auto',
      });
    }
  }, [open, anchorRef, children]);

  // Close on scroll/resize
  useEffect(() => {
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
    <div ref={dropdownRef} style={style} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl py-1 z-[99999] backdrop-blur-sm">
      {children}
    </div>,
    document.body
  );
}

const CommonAdminTable = ({
  columns,
  data,
  total,
  searchValue = '',
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  filterValue = '',
  filterOptions,
  onFilterChange,
  roleValue = '',
  roleOptions = [],
  onRoleChange,
  statusValue = '',
  statusOptions = [],
  onStatusChange,
  planValue = '',
  planOptions = [],
  onPlanChange,
  dateRange = { startDate: null, endDate: null },
  onDateRangeChange,
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
  onEdit,
  onView,
  onDelete,
  onAddUser,
  showFilterBar = true
}) => {
  const { language } = useLanguage();
  const t = getAdminUserTranslations(language);

  const [sortConfig, setSortConfig] = useState(null);
  const actionBtnRefs = useRef([]);
  const [openAction, setOpenAction] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);

  // Excel export function
  const exportToExcel = useCallback(() => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Prepare data for export - exclude actions column and format data
      const exportData = data.map(row => {
        const exportRow = {};
        columns.forEach((col, index) => {
          // Skip the first column (index 0) and any problematic columns
          if (index === 0 || col.key === 'id' || col.key === 'index' || col.key === 'actions') {
            return;
          }

          if (col.render) {
            // For custom rendered columns, try to get the raw value or formatted text
            try {
              const renderedValue = col.render(row, 0);
              // If it's a React element, try to extract text content
              if (typeof renderedValue === 'object' && renderedValue !== null) {
                // For simple elements, try to get text content
                if (renderedValue.props && renderedValue.props.children) {
                  const children = renderedValue.props.children;
                  if (Array.isArray(children)) {
                    exportRow[col.label] = children.map(child =>
                      typeof child === 'string' ? child : 'Content'
                    ).join(' ');
                  } else {
                    exportRow[col.label] = String(children);
                  }
                } else {
                  exportRow[col.label] = 'Content';
                }
              } else {
                exportRow[col.label] = String(renderedValue);
              }
            } catch (error) {
              // Fallback to raw data if render fails
              exportRow[col.label] = row[col.key] || '';
            }
          } else {
            // For regular columns, use the raw data
            const value = row[col.key];
            if (value !== undefined && value !== null) {
              exportRow[col.label] = String(value);
            } else {
              exportRow[col.label] = '';
            }
          }
        });
        return exportRow;
      });

      // Filter out any empty rows or problematic data
      const cleanExportData = exportData.filter(row =>
        Object.values(row).some(value => value && value !== '')
      );

      if (cleanExportData.length === 0) {
        alert('No valid data to export');
        return;
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(cleanExportData);

      // Auto-size columns
      const columnWidths = Object.keys(cleanExportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15) // Minimum width of 15
      }));
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `table_export_${date}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [data, columns]);

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
    <div className={`transition-colors duration-200 font-ttcommons ${className}`}>
      {/* Filter Bar - Only show if showFilterBar is true */}
      {showFilterBar && (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center p-4 bg-white dark:bg-transparent justify-between mb-6">
          {/* Left side - Search and Filters (4 elements) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            {/* Search */}
            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchValue}
                onChange={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                placeholder={t.search}
              />
            </div>

            {/* Role Filter */}
            <div className="w-full sm:w-auto">
              <FilterDropdown
                value={roleValue}
                options={roleOptions}
                onChange={onRoleChange}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label={t.roleFilter}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <FilterDropdown
                value={statusValue}
                options={statusOptions}
                onChange={onStatusChange}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                label={t.statusFilter}
              />
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-auto">
              <CommonDateRange
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={onDateRangeChange}
              />
            </div>
          </div>

          {/* Right side - Action Buttons (2 elements) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            {/* Export Button */}
            <div className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto flex items-center justify-center rounded-lg gap-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-transparent px-4 py-2.5 text-gray-900 dark:text-white hover:border-blue-500 transition"
                onClick={exportToExcel}
              >
                <FiDownload className="text-lg" />
                <p className=''>
                  {t.export}
                </p>
              </button>
            </div>

            {/* Add User Button */}
            <div className="w-full sm:w-auto">
              <CommonButton
                text={t.addUser}
                onClick={onAddUser}

                className="!py-2.5 !text-14 w-auto rounded-lg px-4"
                // className="w-full sm:w-auto px-4 pt-2.5 pb-1.5 text-white rounded-lg transition-all duration-200"
                icon={<FiPlus className="text-lg" />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Bar Only - Show when showFilterBar is false but search is needed */}
      {!showFilterBar && onSearchChange && (
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center p-4 bg-white dark:bg-transparent justify-between mb-6">
          <div className="w-full lg:w-auto">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              placeholder={t.search}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto" role="grid">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-left font-black text-gray-700 dark:text-gray-300 ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={sortConfig?.key === col.key ? sortConfig.direction : undefined}
                >
                  <div className="flex items-center gap-1">
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
              {renderActions && <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8">
                  {loadingComponent || t.loading}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-8">
                  {noDataComponent || t.noDataFound}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  role="row"
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 ${col.className || ''}`}
                      role="gridcell"
                    >
                      {col.render ? (() => {
                        try {
                          // Safety check for undefined row
                          if (!row) {
                            return 'N/A';
                          }
                          return col.render(row, idx);
                        } catch (error) {
                          return 'Error';
                        }
                      })() : (row?.[col.key] || 'N/A')}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="py-3 px-4" role="gridcell">
                      <div className="text-center relative action-dropdown">
                        <button
                          ref={el => actionBtnRefs.current[idx] = el}
                          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 hover:scale-105"
                          onClick={() => handleActionClick(idx)}
                        >
                          <HiDotsHorizontal className="w-5 h-5" />
                        </button>
                        <DropdownPortal anchorRef={{ current: actionBtnRefs.current[idx] }} open={openAction === idx} upward={openUpward}>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                            onClick={() => {
                              setOpenAction(null);
                              if (onView) onView(row);
                              else alert('View Details clicked!');
                            }}
                          >
                            <FiEye className="w-4 h-4" />
                            {t.viewDetails}
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                            onClick={() => {
                              setOpenAction(null);
                              if (onEdit) onEdit(row);
                              else alert('Edit clicked!');
                            }}
                          >
                            <FiEdit className="w-4 h-4" />
                            {t.edit}
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                            onClick={() => {
                              setOpenAction(null);
                              if (onDelete) onDelete(row);
                              else alert('Delete clicked!');
                            }}
                          >
                            <FiTrash2 className="w-4 h-4" />
                            {t.delete}
                          </button>
                        </DropdownPortal>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

CommonAdminTable.propTypes = {
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
  onSearchFocus: PropTypes.func,
  onSearchBlur: PropTypes.func,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  onFilterChange: PropTypes.func,
  roleValue: PropTypes.string,
  roleOptions: PropTypes.arrayOf(PropTypes.string),
  onRoleChange: PropTypes.func,
  statusValue: PropTypes.string,
  statusOptions: PropTypes.arrayOf(PropTypes.string),
  onStatusChange: PropTypes.func,
  dateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }),
  onDateRangeChange: PropTypes.func,
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
  paginationProps: PropTypes.object,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onAddUser: PropTypes.func,
  showFilterBar: PropTypes.bool
};

export default CommonAdminTable; 