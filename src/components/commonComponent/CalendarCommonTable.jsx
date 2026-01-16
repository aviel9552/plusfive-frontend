/**
 * CalendarCommonTable - Reusable table component with filters
 * Used for calendar-clients page and other calendar-related tables
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiTrash2,
  FiChevronDown,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { formatPhoneForDisplay, formatPhoneToWhatsapp } from "../../utils/phoneHelpers";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR } from "../../utils/calendar/constants";
import CommonPagination from "./CommonPagination";

export const CalendarCommonTable = ({
  // Data
  data = [],
  filteredData = [],
  isLoading = false,
  error = null,
  isAuthError = false,
  
  // Search & Filters
  searchQuery = "",
  onSearchChange = () => {},
  searchPlaceholder = "חפש...",
  
  // Status Filter
  selectedStatus = null,
  onStatusChange = () => {},
  statusOptions = [
    { key: null, label: "כל הסטטוסים" },
    { key: "פעיל", label: "פעיל" },
    { key: "חסום", label: "חסום" },
  ],
  
  // Rating Filter
  selectedRating = null,
  onRatingChange = () => {},
  
  // Sort
  sortBy = "newest",
  onSortChange = () => {},
  sortOptions = [
    { key: "newest", label: "חדש ביותר" },
    { key: "oldest", label: "ישן ביותר" },
    { key: "name", label: "א-ב" },
  ],
  
  // Column Visibility
  visibleFields = {},
  onToggleFieldVisibility = () => {},
  onSelectAllFieldsInCategory = () => {},
  columnFilterCategories = [],
  
  // Selection
  selectedItems = [],
  onSelectItem = () => {},
  onSelectAll = () => {},
  
  // Bulk Actions
  onDownloadSelected = () => {},
  onDeleteSelected = () => {},
  hasActiveSubscription = false,
  subscriptionLoading = false,
  
  // Row Actions
  onRowClick = () => {},
  onUpdateField = () => {},
  onUpdateStatus = () => {},
  onDeleteItem = () => {},
  
  // Custom Renderers
  renderCell = null,
  getRowData = null, // Function to get additional data for each row (e.g., appointments info)
  
  // Column Definitions
  columns = [],
  
  // Empty States
  emptyStateMessage = "אין נתונים",
  emptySearchMessage = "לא נמצאו תוצאות התואמות לחיפוש",
  loadingMessage = "טוען...",
  requiredFieldMessage = "יש לבחור שדה חובה בתצוגה",
  requiredFieldKey = "phone",
  
  // Formatting
  formatDate = null,
  
  // Pagination
  enablePagination = false,
  defaultPageSize = 7,
}) => {
    // console.log('data:', data);
    
  const { isDarkMode } = useTheme();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({});
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Check if required field is visible
  const isRequiredFieldVisible = requiredFieldKey ? visibleFields[requiredFieldKey] : true;

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    if (!enablePagination) {
      return filteredData;
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize, enablePagination]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (enablePagination) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedStatus, selectedRating, sortBy, enablePagination]);

  // Render cell content
  const renderCellContent = (column, row, rowIndex) => {
    if (renderCell) {
      return renderCell(column, row, rowIndex);
    }
    
    // Default cell rendering
    const fieldValue = row[column.key];
    if (fieldValue === null || fieldValue === undefined) return "-";
    
    // Format based on column type
    if (column.type === "date" && formatDate) {
      return formatDate(fieldValue);
    }
    if (column.type === "phone") {
      return formatPhoneForDisplay(fieldValue);
    }
    if (column.type === "currency") {
      return `₪${(fieldValue || 0).toLocaleString()}`;
    }
    
    return String(fieldValue);
  };

  return (
    <div className=" py-[24px] w-full" dir="rtl">
      <div className="flex flex-col gap-[24px]">
        {/* Search and Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={subscriptionLoading}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-right ${
                subscriptionLoading
                  ? "border-gray-200 dark:border-customBorderColor bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-200 dark:border-customBorderColor bg-gray-50 dark:bg-[#232323] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#ff257c] focus:ring-1 focus:ring-[#ff257c]"
              }`}
              dir="rtl"
            />
          </div>
          
          {/* Status Filter Button */}
          <div className="relative min-w-[180px]">
            <button
              type="button"
              disabled={subscriptionLoading}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border-2 transition-all duration-200 ${
                subscriptionLoading
                  ? "border-gray-200 dark:border-customBorderColor bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : isStatusDropdownOpen || selectedStatus !== null
                  ? "border-[#ff257c] focus:ring-1 focus:ring-[#ff257c] bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                  : "border-gray-200 dark:border-customBorderColor bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white hover:border-[#ff257c] dark:hover:border-[#ff257c]"
              } focus:outline-none`}
              onClick={() => {
                if (subscriptionLoading) return;
                setIsRatingDropdownOpen(false);
                setIsStatusDropdownOpen((prev) => !prev);
              }}
            >
              <span className="whitespace-nowrap">
                {selectedStatus === null ? "סטטוס" : selectedStatus}
              </span>
              <FiChevronDown className={`text-[14px] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-full rounded-xl border-2 border-gray-200 dark:border-customBorderColor bg-white dark:bg-[#232323] shadow-lg z-30 text-sm text-right overflow-hidden"
                >
                  <div className="py-1">
                    {statusOptions.map((opt) => (
                      <button
                        key={String(opt.key)}
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                          selectedStatus === opt.key
                            ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                            : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                        }`}
                        onClick={() => {
                          onStatusChange(opt.key);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rating Filter Button */}
          {onRatingChange && (
            <div className="relative min-w-[180px]">
              <button
                type="button"
                disabled={subscriptionLoading}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border-2 transition-all duration-200 ${
                  subscriptionLoading
                    ? "border-gray-200 dark:border-customBorderColor bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : isRatingDropdownOpen || selectedRating !== null
                    ? "border-[#ff257c] focus:ring-1 focus:ring-[#ff257c] bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    : "border-gray-200 dark:border-customBorderColor bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white hover:border-[#ff257c] dark:hover:border-[#ff257c]"
                } focus:outline-none`}
                onClick={() => {
                  if (subscriptionLoading) return;
                  setIsStatusDropdownOpen(false);
                  setIsRatingDropdownOpen((prev) => !prev);
                }}
              >
                <span className="whitespace-nowrap">
                  {selectedRating === null
                    ? "דירוג אחרון"
                    : selectedRating === "-"
                    ? "ללא דירוג"
                    : `⭐ ${selectedRating}`}
                </span>
                <FiChevronDown className={`text-[14px] transition-transform ${isRatingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRatingDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsRatingDropdownOpen(false)} />
                  <div
                    dir="rtl"
                    className="absolute right-0 mt-2 w-full rounded-xl border-2 border-gray-200 dark:border-customBorderColor bg-white dark:bg-[#232323] shadow-lg z-30 text-sm text-right overflow-hidden"
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                          selectedRating === null
                            ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                            : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                        }`}
                        onClick={() => {
                          onRatingChange(null);
                          setIsRatingDropdownOpen(false);
                        }}
                      >
                        <span>כל הדירוגים</span>
                      </button>

                      {[5, 4, 3, 2, 1].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                            selectedRating === String(n)
                              ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                          }`}
                          onClick={() => {
                            onRatingChange(String(n));
                            setIsRatingDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-0.5">
                            {[...Array(n)].map((_, i) => (
                              <FaStar key={i} className="text-ratingStar" style={{ fontSize: "12px" }} />
                            ))}
                            {[...Array(5 - n)].map((_, i) => (
                              <FaStar key={`g-${i}`} className="text-gray-300 dark:text-gray-500" style={{ fontSize: "12px" }} />
                            ))}
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                          selectedRating === "-"
                            ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                            : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                        }`}
                        onClick={() => {
                          onRatingChange("-");
                          setIsRatingDropdownOpen(false);
                        }}
                      >
                        <span>ללא דירוג</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Column Filter Button */}
          {columnFilterCategories.length > 0 && (
            <div className="relative min-w-[180px]">
              <button
                type="button"
                disabled={subscriptionLoading}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border-2 transition-all duration-200 ${
                  subscriptionLoading
                    ? "border-gray-200 dark:border-customBorderColor bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : isColumnFilterDropdownOpen
                    ? "border-[#ff257c] focus:ring-1 focus:ring-[#ff257c] bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    : "border-gray-200 dark:border-customBorderColor bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white hover:border-[#ff257c] dark:hover:border-[#ff257c]"
                } focus:outline-none`}
                onClick={(e) => {
                  if (subscriptionLoading) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setIsColumnFilterDropdownOpen((prev) => !prev);
                }}
              >
                <span className="whitespace-nowrap">סינון</span>
                <FiFilter className={`text-[14px] transition-transform ${isColumnFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isColumnFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsColumnFilterDropdownOpen(false)} />
                  <div
                    dir="rtl"
                    className="absolute right-0 mt-2 w-56 rounded-xl border-2 border-gray-200 dark:border-customBorderColor bg-white dark:bg-[#232323] shadow-lg z-30 text-sm text-right max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {/* Sort Options */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">מיון</div>
                      {sortOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                            sortBy === option.key
                              ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                          }`}
                          onClick={() => {
                            onSortChange(option.key);
                            setIsColumnFilterDropdownOpen(false);
                          }}
                        >
                          <span>{option.label}</span>
                        </button>
                      ))}

                      {/* Column Categories */}
                      {columnFilterCategories.map((category, catIndex) => (
                        <React.Fragment key={category.title || catIndex}>
                          {catIndex > 0 && <div className="border-b border-gray-200 dark:border-[#262626] my-1"></div>}
                          <div className="flex items-center justify-between px-4 py-2">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              {category.title}
                            </div>
                            {category.fields && category.fields.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onSelectAllFieldsInCategory(category.fields.map((f) => f.key || f));
                                }}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                              >
                                סמן הכל
                              </button>
                            )}
                          </div>

                          {(category.fields || []).map((field) => {
                            const fieldKey = field.key || field;
                            const fieldLabel = field.label || field;
                            return (
                              <button
                                key={fieldKey}
                                type="button"
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                                  visibleFields[fieldKey]
                                    ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                                    : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2C]"
                                }`}
                                onClick={() => onToggleFieldVisibility(fieldKey)}
                              >
                                <span>{fieldLabel}</span>
                              </button>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bulk actions */}
          <div className="relative flex items-center gap-3">
            <button
              onClick={onSelectAll}
              disabled={subscriptionLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border-2 transition-all duration-200 ${
                subscriptionLoading
                  ? "border-gray-200 dark:border-customBorderColor bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-200 dark:border-customBorderColor bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white hover:border-[#ff257c] dark:hover:border-[#ff257c]"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedItems.length === filteredData.length && filteredData.length > 0
                    ? "border-[rgba(255,37,124,1)]"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {selectedItems.length === filteredData.length && filteredData.length > 0 && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                )}
              </span>
              <span className="whitespace-nowrap">
                בחר הכל ({selectedItems.length}/{filteredData.length})
              </span>
            </button>

            {onDownloadSelected && (
              <button
                onClick={onDownloadSelected}
                disabled={selectedItems.length === 0}
                className={`p-2.5 rounded-xl border-2 transition-all duration-200 ${
                  selectedItems.length === 0
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-customBorderColor"
                    : "text-gray-900 dark:text-white hover:text-[#ff257c] hover:border-[#ff257c] border-gray-200 dark:border-customBorderColor bg-white dark:bg-[#232323]"
                }`}
                title="הורדת פריטים נבחרים"
              >
                <FiDownload className="text-sm" />
              </button>
            )}

            {onDeleteSelected && (
              <button
                onClick={() => {
                  if (!hasActiveSubscription) {
                    alert('נדרש מנוי פעיל כדי למחוק פריטים. אנא הירשם למנוי כדי להמשיך.');
                    return;
                  }
                  onDeleteSelected();
                }}
                disabled={selectedItems.length === 0 || !hasActiveSubscription || subscriptionLoading}
                className={`p-2.5 rounded-xl border-2 transition-all duration-200 ${
                  selectedItems.length === 0 || !hasActiveSubscription || subscriptionLoading
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-customBorderColor"
                    : "text-gray-600 dark:text-white hover:text-red-500 hover:border-red-500 border-gray-200 dark:border-customBorderColor bg-white dark:bg-[#232323]"
                }`}
                title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי למחוק פריטים' : 'מחיקת פריטים נבחרים'}
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {!isRequiredFieldVisible ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">📱</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{requiredFieldMessage}</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <FiRefreshCw className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">{loadingMessage}</p>
          </div>
        ) : isAuthError ? (
          <div className="p-12 text-center">
            <FiAlertCircle className="mx-auto text-4xl text-orange-500 dark:text-orange-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {error || "Please login to load data"}
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">☺</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? emptySearchMessage : emptyStateMessage}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-customBrown rounded-xl overflow-hidden border-2 border-gray-200 dark:border-customBorderColor" key={JSON.stringify(visibleFields)}>
            <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
              {/* Table Headers */}
              <div className="flex items-center gap-6 px-4 py-3 border-b-2 border-gray-200 dark:border-customBorderColor relative min-w-max bg-gray-50 dark:bg-customBrown">
                <div className="w-3.5 flex-shrink-0"></div>
                
                {columns
                  .filter((col) => visibleFields[col.key])
                  .map((column) => (
                    <div
                      key={column.key}
                      className={`${column.width || "w-32"} flex items-center ${column.align || "justify-start"} flex-shrink-0`}
                      style={column.marginRight ? { marginRight: `${column.marginRight}px` } : {}}
                    >
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {column.label}
                      </span>
                    </div>
                  ))}

                {/* Hidden: Total record count */}
                {/* <div className="w-24 flex items-center justify-start flex-shrink-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    מציג {enablePagination ? paginatedData.length : filteredData.length} מתוך {data.length} תוצאות
                  </p>
                </div> */}
              </div>

              {/* Table Rows */}
              {paginatedData.map((row, index) => {
                const rowData = getRowData ? getRowData(row) : {};
                return (
                  <div
                    key={row.id || index}
                    onClick={() => {
                      if (!hasActiveSubscription || subscriptionLoading) {
                        alert('נדרש מנוי פעיל כדי לצפות בפרטים. אנא הירשם למנוי כדי להמשיך.');
                        return;
                      }
                      onRowClick(row);
                    }}
                    className={`px-4 py-3 flex items-center gap-6 transition-colors min-w-max border-b border-gray-200 dark:border-customBorderColor ${
                      !hasActiveSubscription || subscriptionLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2C2C2C]"
                    }
                    `}
                  >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasActiveSubscription || subscriptionLoading) {
                        return;
                      }
                      onSelectItem(row.id || index);
                    }}
                    disabled={!hasActiveSubscription || subscriptionLoading}
                    className={`flex-shrink-0 ${
                      !hasActiveSubscription || subscriptionLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedItems.includes(row.id || index)
                          ? "border-[rgba(255,37,124,1)]"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {selectedItems.includes(row.id || index) && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                      )}
                    </span>
                  </button>

                  {/* Render cells based on visible columns */}
                  {columns
                    .filter((col) => visibleFields[col.key])
                    .map((column) => (
                      <div
                        key={column.key}
                        className={`${column.width || "w-32"} flex items-center gap-2 flex-shrink-0`}
                        style={column.marginRight ? { marginRight: `${column.marginRight}px` } : {}}
                      >
                        {renderCell ? (
                          renderCell(column, row, index, rowData)
                        ) : (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {renderCellContent(column, row, index)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {enablePagination && filteredData.length > 0 && (
          <div className={subscriptionLoading ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}>
            <CommonPagination
              currentPage={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onPageChange={(page) => {
                if (subscriptionLoading) return;
                setCurrentPage(page);
                // Scroll to top of table when page changes
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(size) => {
                if (subscriptionLoading) return;
                setPageSize(size);
                setCurrentPage(1);
              }}
              showPageSizeSelector={true}
              showPageInfo={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarCommonTable;
