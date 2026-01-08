/**
 * NewServiceModal Component
 * Modal for creating a new service
 */

import React, { useState } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { BRAND_COLOR } from "../../../utils/calendar/constants";

// Generate duration options: 10 minutes to 5 hours in 5-minute intervals
const generateDurationOptions = () => {
  const options = [];
  // 10 minutes to 60 minutes (1 hour)
  for (let minutes = 10; minutes <= 60; minutes += 5) {
    options.push({
      value: minutes,
      label: minutes === 60 ? "1 שעה" : `${minutes} דק'`
    });
  }
  // 65 minutes to 300 minutes (5 hours)
  for (let minutes = 65; minutes <= 300; minutes += 5) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      options.push({
        value: minutes,
        label: `${hours} שעות`
      });
    } else {
      options.push({
        value: minutes,
        label: `${hours} שעות ${remainingMinutes} דק'`
      });
    }
  }
  return options;
};

const DURATION_OPTIONS = generateDurationOptions();

// Color palette - pastel colors (16 colors total)
const COLOR_PALETTE = [
  { name: "קרם", value: "#FDF2DD" },
  { name: "אפרסק", value: "#FFE6D6" },
  { name: "קורל", value: "#FFDBCB" },
  { name: "ורוד בהיר", value: "#FADDD9" },
  { name: "ורוד", value: "#F5DEE6" },
  { name: "ורוד-סגול", value: "#F7E8F3" },
  { name: "סגול בהיר", value: "#F8F7FF" },
  { name: "סגול", value: "#E4E1FF" },
  { name: "סגול-כחול", value: "#D0D1FF" },
  { name: "כחול בהיר", value: "#D6E8FF" },
  { name: "תכלת", value: "#D0F4F0" },
  { name: "ירוק בהיר", value: "#D4F4DD" },
  { name: "צהוב בהיר", value: "#FFF9D0" },
  { name: "כתום בהיר", value: "#FFE8D0" },
  { name: "אדום בהיר", value: "#FFE0E0" },
  { name: "אפור בהיר", value: "#F0F0F0" },
];

// Category options
const CATEGORY_OPTIONS = [
  "כללי",
  "טיפול פנים",
  "טיפול שיער",
  "טיפול גוף",
  "עיסוי",
  "אחר"
];

export const NewServiceModal = ({
  isOpen,
  onClose,
  newServiceName,
  newServiceNotes,
  newServiceCategory,
  newServicePrice,
  newServiceDuration,
  newServiceColor,
  newServiceHideFromClients,
  newServiceErrors,
  onNameChange,
  onNotesChange,
  onCategoryChange,
  onPriceChange,
  onDurationChange,
  onColorChange,
  onHideFromClientsChange,
  onSubmit,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

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
            הוספת שירות
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-9 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
          <div className="space-y-4">
            {/* שם שירות */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  שם שירות <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="שם השירות"
                dir="rtl"
                className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                  newServiceErrors.name
                    ? "border-red-400 dark:border-red-500"
                    : "border-gray-200 dark:border-[#262626]"
                } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
              />
              {newServiceErrors.name && (
                <p className="text-[11px] text-red-500">
                  {newServiceErrors.name}
                </p>
              )}
            </div>

            {/* הערות */}
            <div className="space-y-3">
              <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                הערות
              </label>
              <textarea
                value={newServiceNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="הערות על השירות"
                dir="rtl"
                rows={3}
                className="w-full rounded-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right resize-none"
              />
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
                    {newServiceCategory || "בחר קטגוריה"}
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
                                  newServiceCategory === category
                                    ? "border-[rgba(255,37,124,1)]"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {newServiceCategory === category && (
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

            {/* מחיר */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  מחיר <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => onPriceChange(e.target.value)}
                  placeholder="0"
                  dir="rtl"
                  min="0"
                  step="0.01"
                  className={`w-full h-10 rounded-full px-3 pr-8 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                    newServiceErrors.price
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-[#262626]"
                  } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">
                  ₪
                </span>
              </div>
              {newServiceErrors.price && (
                <p className="text-[11px] text-red-500">
                  {newServiceErrors.price}
                </p>
              )}
            </div>

            {/* משך השירות */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  משך השירות <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDurationDropdownOpen(!isDurationDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                    newServiceErrors.duration
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-commonBorder"
                  } text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors`}
                >
                  <span className="whitespace-nowrap">
                    {newServiceDuration
                      ? DURATION_OPTIONS.find(opt => opt.value === parseInt(newServiceDuration))?.label || `${newServiceDuration} דק'`
                      : "בחר משך"}
                  </span>
                  <FiChevronDown className="text-[14px] text-gray-400" />
                </button>
                {isDurationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDurationDropdownOpen(false)}
                    />
                    <div
                      dir="rtl"
                      className="absolute right-0 mt-2 w-56 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                    >
                      <div className="py-2">
                        {DURATION_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onDurationChange(option.value.toString());
                              setIsDurationDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  newServiceDuration === option.value.toString()
                                    ? "border-[rgba(255,37,124,1)]"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {newServiceDuration === option.value.toString() && (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  />
                                )}
                              </span>
                              <span>{option.label}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {newServiceErrors.duration && (
                <p className="text-[11px] text-red-500">
                  {newServiceErrors.duration}
                </p>
              )}
            </div>

            {/* הצבע של השירות ביומן */}
            <div className="space-y-3">
              <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                הצבע של השירות ביומן
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {newServiceColor && (
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: newServiceColor }}
                      />
                    )}
                    <span className="whitespace-nowrap">
                      {newServiceColor
                        ? COLOR_PALETTE.find(c => c.value === newServiceColor)?.name || "צבע מותאם"
                        : "בחר צבע"}
                    </span>
                  </div>
                  <FiChevronDown className="text-[14px] text-gray-400" />
                </button>
                {isColorPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsColorPickerOpen(false)}
                    />
                    <div
                      dir="rtl"
                      className="absolute left-12 bottom-0 -translate-y-1 w-[179px] rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right p-3"
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              onColorChange(color.value);
                              setIsColorPickerOpen(false);
                            }}
                            className="w-full aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: color.value,
                              borderColor: newServiceColor === color.value 
                                ? "#ff257c" 
                                : color.value.toLowerCase() === "#ffffff" || color.value.toLowerCase() === "#fff"
                                  ? "#e5e7eb"
                                  : "transparent"
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* להסתיר מתורים ע"י קביעת לקוחות */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  להסתיר מתורים ע"י קביעת לקוחות
                </label>
                <button
                  type="button"
                  onClick={() => onHideFromClientsChange(!newServiceHideFromClients)}
                  className="flex items-center justify-center"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      newServiceHideFromClients
                        ? "border-[rgba(255,37,124,1)]"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {newServiceHideFromClients && (
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
        </div>

        <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
          <button
            type="button"
            className="w-full h-[44px] rounded-full text-medium font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            onClick={onSubmit}
          >
            הוסף שירות
          </button>
        </div>
      </div>
    </div>
  );
};

