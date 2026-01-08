/**
 * WaitlistPanel Component
 * Displays the waitlist with filtering, sorting, and actions
 */

import React from "react";
import { FiX, FiPlus, FiChevronDown, FiCalendar, FiXCircle } from "react-icons/fi";
import { BRAND_COLOR } from "../../../utils/calendar/constants";

export const WaitlistPanel = ({
  isOpen,
  onClose,
  waitlistItems,
  filteredWaitlist,
  waitlistFilter,
  waitlistRange,
  waitlistSort,
  isWaitlistRangeOpen,
  isSortDropdownOpen,
  openWaitlistActionId,
  onFilterChange,
  onRangeChange,
  onSortChange,
  onRangeDropdownToggle,
  onSortDropdownToggle,
  onActionDropdownToggle,
  onBookAppointment,
  onRemoveItem,
  onAddNew,
}) => {
  if (!isOpen) return null;

  const rangeLabel = (() => {
    switch (waitlistRange) {
      case "all":
        return "כל הקרובים";
      case "today":
        return "היום";
      case "3days":
        return "3 ימים הקרובים";
      case "7days":
        return "7 ימים הקרובים";
      case "30days":
      default:
        return "30 ימים הקרובים";
    }
  })();

  const rangeOptions = [
    { key: "all", label: "כל הקרובים" },
    { key: "today", label: "היום" },
    { key: "3days", label: "3 ימים הקרובים" },
    { key: "7days", label: "7 ימים הקרובים" },
    { key: "30days", label: "30 ימים הקרובים" },
  ];

  const sortOptions = [
    { key: "created-oldest", label: "תאריך יצירה (הישן ביותר)" },
    { key: "created-newest", label: "תאריך יצירה (החדש ביותר)" },
    { key: "price-highest", label: "מחיר (הגבוה ביותר)" },
    { key: "price-lowest", label: "מחיר (הנמוך ביותר)" },
    {
      key: "requested-nearest",
      label: "תאריך מבוקש (הקרוב ביותר)",
    },
    {
      key: "requested-furthest",
      label: "תאריך מבוקש (הרחוק ביותר)",
    },
  ];

  const sortLabel =
    sortOptions.find((opt) => opt.key === waitlistSort)?.label ||
    "תאריך יצירה (הישן ביותר)";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* קליק ברקע – סוגר את כל הפאנל */}
      <div
        className="flex-1 bg-black/0"
        onClick={() => {
          onClose();
          onRangeDropdownToggle(false);
          onSortDropdownToggle(false);
          onActionDropdownToggle(null);
        }}
      />

      {/* הפאנל עצמו */}
      <div
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in"
        onClick={() => {
          onRangeDropdownToggle(false);
          onSortDropdownToggle(false);
          onActionDropdownToggle(null);
        }}
      >
        {/* X מחוץ לפאנל בקצה השמאלי */}
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onRangeDropdownToggle(false);
            onSortDropdownToggle(false);
            onActionDropdownToggle(null);
          }}
        >
          <FiX className="text-[20px]" />
        </button>

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-8 py-7" dir="rtl">
          <span className="text-[26px] font-semibold text-gray-900 dark:text-gray-100">
            רשימת המתנה
          </span>
          <button
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            onClick={(e) => {
              e.stopPropagation();
              onAddNew();
            }}
          >
            <span>חדש</span>
            <FiPlus className="text-[16px]" />
          </button>
        </div>

        {/* תוכן */}
        <div className="relative z-20 flex-1 overflow-y-auto px-6 pt-2 pb-5 text-sm text-gray-800 dark:text-gray-100" dir="rtl">
          {/* שורת פילטרים */}
          <div className="flex flex-wrap items-center gap-2 mb-4" dir="rtl">
            {/* All upcoming dropdown */}
            <div className="relative">
              <button
                className="inline-flex items-center justify-between px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRangeDropdownToggle(!isWaitlistRangeOpen);
                  onSortDropdownToggle(false);
                  onActionDropdownToggle(null);
                }}
              >
                <span>{rangeLabel}</span>
                <FiChevronDown className="ml-5 text-[13px] text-gray-400" />
              </button>

              {isWaitlistRangeOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm px-2"
                  style={{
                    boxShadow:
                      "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {rangeOptions.map((opt) => {
                    const isActive = waitlistRange === opt.key;

                    return (
                      <button
                        key={opt.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition"
                        onClick={() => {
                          onRangeChange(opt.key);
                          onRangeDropdownToggle(false);
                        }}
                      >
                        <div className="flex flex-col items-start">
                          <span
                            className={`font-normal ${
                              isActive
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-200"
                            }`}
                          >
                            {opt.label}
                          </span>
                        </div>

                        {isActive && (
                          <span className="ml-2 text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Created / sort dropdown */}
            <div className="relative">
              <button
                className="inline-flex items-center justify-between px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSortDropdownToggle(!isSortDropdownOpen);
                  onRangeDropdownToggle(false);
                  onActionDropdownToggle(null);
                }}
              >
                <span>{sortLabel}</span>
                <FiChevronDown className="ml-5 text-[13px] text-gray-400" />
              </button>

              {isSortDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm px-2"
                  style={{
                    boxShadow:
                      "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {sortOptions.map((opt) => {
                    const isActive = waitlistSort === opt.key;

                    return (
                      <button
                        key={opt.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition"
                        onClick={() => {
                          onSortChange(opt.key);
                          onSortDropdownToggle(false);
                        }}
                      >
                        <span
                          className={
                            isActive
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-200"
                          }
                        >
                          {opt.label}
                        </span>

                        {isActive && (
                          <span className="ml-2 text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* טאבים – Waiting / Expired / Booked */}
          <div className="border-b border-gray-200 dark:border-[#262626] mb-4">
            <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
              {[
                { key: "waiting", label: "ממתינים" },
                { key: "expired", label: "פג תוקף" },
                { key: "booked", label: "נקבע תור" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange(key);
                    onActionDropdownToggle(null);
                  }}
                  className={`relative pb-3 pt-1 font-medium transition-colors ${
                    waitlistFilter === key
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                  {waitlistFilter === key && (
                    <span
                      className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* רשימת וייטליסט */}
          <div className="space-y-3">
            {filteredWaitlist.map((item) => {
              // Support both old format (client as string) and new format (client as object)
              const clientName = typeof item.client === "string" 
                ? item.client 
                : item.client?.name || "Unknown Client";
              
              // Support both old format (requestedDate) and new format (date)
              const itemDate = item.date || item.requestedDate;
              const dateDisplay = itemDate instanceof Date
                ? itemDate.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
                : itemDate
                ? new Date(itemDate).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
                : "No date";
              
              // Get service name (support both old format with note and new format with service object)
              const serviceName = item.service?.name || item.note || "No service";

              return (
                <div
                  key={item.id}
                  className="relative rounded-xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] p-3 text-[14px] text-gray-800 dark:text-gray-100 text-right "
                >
                  <div className="flex justify-between mb-1 flex-row-reverse">
                    <span className="font-semibold text-right">{clientName}</span>
                    <span className="text-[12px] text-gray-500">
                      {dateDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] flex-row-reverse">
                    {item.time && item.time !== "any" && (
                      <span className="capitalize text-gray-500">
                        {item.time}
                      </span>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {serviceName}
                    </span>
                  </div>

                  {/* Actions button + dropdown */}
                  <div className="mt-3 flex justify-start">
                    <div className="relative">
                      <button
                        className="inline-flex items-center gap-1 px-5 py-2 rounded-full border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] text-[11px] font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionDropdownToggle(openWaitlistActionId === item.id ? null : item.id);
                        }}
                      >
                        <span>פעולות</span>
                        <FiChevronDown className="text-[12px] text-gray-400" />
                      </button>

                      {openWaitlistActionId === item.id && (
                        <div
                          className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-30 py-1 text-[11px]"
                          style={{
                            boxShadow:
                              "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Book appointment (Calendar icon) */}
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                            onClick={() => {
                              onBookAppointment(item.id);
                              onActionDropdownToggle(null);
                            }}
                          >
                            <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-[13px]">
                              <FiCalendar className="text-[15px] text-gray-700 dark:text-gray-200" />
                              קבע תור
                            </span>
                          </button>

                          <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />

                          {/* Remove (Red X icon) */}
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition text-red-500 text-[13px]"
                            onClick={() => {
                              onRemoveItem(item.id);
                              onActionDropdownToggle(null);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <FiXCircle className="text-[16px] text-red-500" />
                              הסר מרשימת המתנה
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredWaitlist.length === 0 && (
              <div className="flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400 py-10">
                <div className="mb-3 w-10 h-10 rounded-2xl bg-gradient-to-b from-purple-300 to-purple-500/80 opacity-80" />
                <div className="text-sm font-semibold mb-1">
                  אין רשומות ברשימת המתנה
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  אין לך לקוחות ברשימת המתנה
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

