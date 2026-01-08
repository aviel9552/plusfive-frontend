/**
 * NewProductModal Component
 * Modal for creating a new product
 */

import React, { useState, useMemo } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { BRAND_COLOR } from "../../../utils/calendar/constants";

// Category options for products
const CATEGORY_OPTIONS = [
  "כללי",
  "מוצרי טיפוח",
  "מוצרי שיער",
  "מוצרי גוף",
  "קוסמטיקה",
  "אחר"
];

export const NewProductModal = ({
  isOpen,
  onClose,
  newProductName,
  newProductCategory,
  newProductSupplier,
  newProductSupplierPrice,
  newProductCustomerPrice,
  newProductBarcode,
  newProductEnableCommission,
  newProductCurrentQuantity,
  newProductLowStockThreshold,
  newProductReorderQuantity,
  newProductLowStockAlerts,
  newProductErrors,
  onNameChange,
  onCategoryChange,
  onSupplierChange,
  onSupplierPriceChange,
  onCustomerPriceChange,
  onBarcodeChange,
  onEnableCommissionChange,
  onCurrentQuantityChange,
  onLowStockThresholdChange,
  onReorderQuantityChange,
  onLowStockAlertsChange,
  onSubmit,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "inventory"

  // Calculate gross profit percentage
  const grossProfitPercentage = useMemo(() => {
    if (!newProductSupplierPrice || !newProductCustomerPrice) return 0;
    const supplierPrice = parseFloat(newProductSupplierPrice);
    const customerPrice = parseFloat(newProductCustomerPrice);
    if (supplierPrice === 0 || customerPrice === 0) return 0;
    return ((customerPrice - supplierPrice) / supplierPrice * 100).toFixed(1);
  }, [newProductSupplierPrice, newProductCustomerPrice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="ltr">
      <style>{`
        .calendar-slide-in {
          animation: calendarSlideIn 260ms ease-out forwards;
        }
        @keyframes calendarSlideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* קליק על הרקע – סוגר את הכרטיס */}
      <div className="flex-1 bg-black/0" onClick={onClose} />

      {/* הפאנל עצמו */}
      <div
        dir="rtl"
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col calendar-slide-in text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
        >
          <FiX className="text-[20px]" />
        </button>

        <div className="px-8 pt-7 pb-9">
          <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
            הוספת מוצר
          </h2>
        </div>

        {/* Tabs */}
        <div className="px-8 pb-4 border-b border-gray-200 dark:border-commonBorder">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-[#ff257c]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              פרטים
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "inventory"
                  ? "text-gray-900 dark:text-gray-100 border-b-2 border-[#ff257c]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              ניהול מלאי
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-9 pb-6 pt-6 text-sm text-gray-800 dark:text-gray-100">
          {activeTab === "details" ? (
            <div className="space-y-4">
              {/* שם מוצר */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    שם מוצר <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="שם המוצר"
                  dir="rtl"
                  className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                    newProductErrors.name
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-[#262626]"
                  } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
                />
                {newProductErrors.name && (
                  <p className="text-[11px] text-red-500">
                    {newProductErrors.name}
                  </p>
                )}
              </div>

              {/* קטגוריה */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  קטגוריה
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                  >
                    <span className="whitespace-nowrap">
                      {newProductCategory || "בחר קטגוריה"}
                    </span>
                    <FiChevronDown className="text-[14px] text-gray-400" />
                  </button>
                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div
                        dir="rtl"
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                      >
                        <div className="py-2">
                          {CATEGORY_OPTIONS.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => {
                                onCategoryChange(category);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    newProductCategory === category
                                      ? "border-[rgba(255,37,124,1)]"
                                      : "border-gray-300 dark:border-gray-500"
                                  }`}
                                >
                                  {newProductCategory === category && (
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: BRAND_COLOR }}
                                    />
                                  )}
                                </span>
                                <span>{category}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ספק */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  ספק
                </label>
                <input
                  type="text"
                  value={newProductSupplier}
                  onChange={(e) => onSupplierChange(e.target.value)}
                  placeholder="שם הספק"
                  dir="rtl"
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                />
              </div>

              {/* מחיר ספק */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  מחיר ספק
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newProductSupplierPrice}
                    onChange={(e) => onSupplierPriceChange(e.target.value)}
                    placeholder="0"
                    dir="rtl"
                    min="0"
                    step="0.01"
                    className="w-full h-10 rounded-full px-3 pr-8 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                    ₪
                  </span>
                </div>
              </div>

              {/* מחיר ללקוח */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    מחיר ללקוח <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={newProductCustomerPrice}
                    onChange={(e) => onCustomerPriceChange(e.target.value)}
                    placeholder="0"
                    dir="rtl"
                    min="0"
                    step="0.01"
                    className={`w-full h-10 rounded-full px-3 pr-8 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                      newProductErrors.customerPrice
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-[#262626]"
                    } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                    ₪
                  </span>
                </div>
                {newProductErrors.customerPrice && (
                  <p className="text-[11px] text-red-500">
                    {newProductErrors.customerPrice}
                  </p>
                )}
              </div>

              {/* אחוז רווח גולמי */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  אחוז רווח גולמי
                </label>
                <div className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 flex items-center justify-end">
                  {grossProfitPercentage}%
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  חישוב אוטומטי של אחוז הרווח בין מחיר ספק למחיר לקוח
                </p>
              </div>

              {/* ברקוד */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  ברקוד
                </label>
                <input
                  type="text"
                  value={newProductBarcode}
                  onChange={(e) => onBarcodeChange(e.target.value)}
                  placeholder="מספר ברקוד"
                  dir="rtl"
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                />
              </div>

              {/* הפעלת עמלה לאיש צוות */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                      הפעלת עמלה לאיש צוות
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      המערכת תחושב אוטומטית עמלה לאיש הצוות כאשר המוצר נמכר
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEnableCommissionChange(!newProductEnableCommission)}
                    className="flex items-center justify-center"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        newProductEnableCommission
                          ? "border-[rgba(255,37,124,1)]"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {newProductEnableCommission && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* כמות נוכחית */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  כמות נוכחית
                </label>
                <input
                  type="number"
                  value={newProductCurrentQuantity}
                  onChange={(e) => onCurrentQuantityChange(e.target.value)}
                  placeholder="0"
                  dir="rtl"
                  min="0"
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                />
              </div>

              {/* סף מלאי נמוך */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  סף מלאי נמוך
                </label>
                <input
                  type="number"
                  value={newProductLowStockThreshold}
                  onChange={(e) => onLowStockThresholdChange(e.target.value)}
                  placeholder="0"
                  dir="rtl"
                  min="0"
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                />
              </div>

              {/* כמות להזמנה מחדש */}
              <div className="space-y-3">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  כמות להזמנה מחדש
                </label>
                <input
                  type="number"
                  value={newProductReorderQuantity}
                  onChange={(e) => onReorderQuantityChange(e.target.value)}
                  placeholder="0"
                  dir="rtl"
                  min="0"
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                />
              </div>

              {/* קבלת התראות על מלאי נמוך */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    קבלת התראות על מלאי נמוך
                  </label>
                  <button
                    type="button"
                    onClick={() => onLowStockAlertsChange(!newProductLowStockAlerts)}
                    className="flex items-center justify-center"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        newProductLowStockAlerts
                          ? "border-[rgba(255,37,124,1)]"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {newProductLowStockAlerts && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
          <button
            type="button"
            className="w-full h-[44px] rounded-full text-medium font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            onClick={onSubmit}
          >
            הוסף מוצר
          </button>
        </div>
      </div>
    </div>
  );
};

