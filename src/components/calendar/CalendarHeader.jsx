/**
 * Calendar Header Component
 * Top bar with navigation, view controls, and action buttons
 */

import React, { useState, useMemo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSettings,
  FiClock,
  FiX,
} from 'react-icons/fi';
import { BRAND_COLOR } from '../../utils/calendar/constants';
import { formatHeaderLabel } from '../../utils/calendar/dateHelpers';
// STAFF_DAY_CALENDARS and ALL_STAFF_IDS are now passed as props from CalendarPage
import { isSameCalendarDay, toDateOnly, isBetweenInclusive, isFullMonthRange } from '../../utils/calendar/dateHelpers';
import { getMonthMatrix } from '../../utils/calendar/calendarMatrix';
import { useTheme } from '../../context/ThemeContext';
import gradientTeamImage from '../../assets/gradientteam.jpg';

export const CalendarHeader = ({
  // Calendar view state
  currentDate,
  view,
  weekStart,
  headerLabel,
  handlePrev,
  handleNext,
  jumpToToday,
  changeView,
  
  // Settings
  slotHeight,
  appliedSlotHeight,
  setSlotHeight,
  onSettingsClick,
  
  // Staff selection
  selectedStaff,
  selectedTeamMembers,
  setSelectedStaff,
  setSelectedTeamMembers,
  staffDayCalendars = [],
  allStaffIds = [],
  
  // Date picker
  isDatePickerOpen,
  setIsDatePickerOpen,
  pickerMonth,
  setPickerMonth,
  selectedDate,
  setSelectedDate,
  rangeStartDate,
  setRangeStartDate,
  rangeEndDate,
  setRangeEndDate,
  rangeHoverDate,
  setRangeHoverDate,
  applyDateSelection,
  
  // Waitlist
  onWaitlistClick,
  
  // Language
  language,
}) => {
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const { isDarkMode } = useTheme();
  
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  
  const toggleStaffMember = (id) => {
    setSelectedTeamMembers((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((sId) => sId !== id);
      } else {
        next = [...prev, id];
      }

      if (allStaffIds && allStaffIds.length > 0 && next.length === allStaffIds.length) {
        setSelectedStaff("all-business");
      } else {
        setSelectedStaff("custom");
      }

      return next;
    });
  };

  const handleClearAllStaff = () => {
    setSelectedTeamMembers([]);
    setSelectedStaff("custom");
  };

  const staffButtonLabel = useMemo(() => {
    if (selectedStaff === "all-business") {
      return "כל הצוות";
    }
    if (selectedStaff === "scheduled-team") {
      return "צוות מתוזמן";
    }
    if (selectedTeamMembers.length === 0) {
      return "לא נבחרו עובדים";
    }
    if (allStaffIds && allStaffIds.length > 0 && selectedTeamMembers.length === allStaffIds.length) {
      return "כל הצוות";
    }
    return `${selectedTeamMembers.length} חברי צוות`;
  }, [selectedStaff, selectedTeamMembers, allStaffIds]);
  
  const renderSingleMonth = (baseDate) => {
    const locale = language === "he" ? "he-IL" : "en-US";
    const days = getMonthMatrix(baseDate);
    const currentMonth = baseDate.getMonth();

    const monthLabel = baseDate.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    const dayNames = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2025, 0, 5 + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });

    const activeEnd = rangeEndDate || rangeHoverDate;

    return (
      <div className="w-full">
        {/* כותרת חודש + חצים */}
        <div className="flex items-center justify-between mb-3">
          {/* חץ ימין – חוזר חודש אחורה */}
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-300"
            onClick={() => {
              const d = new Date(pickerMonth);
              d.setMonth(d.getMonth() - 1);
              setPickerMonth(d);
            }}
          >
            <span dir="ltr">
              <FiChevronRight />
            </span>
          </button>
          
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {monthLabel}
          </span>
          
          {/* חץ שמאל – מתקדם קדימה */}
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-300"
            onClick={() => {
              const d = new Date(pickerMonth);
              d.setMonth(d.getMonth() + 1);
              setPickerMonth(d);
            }}
          >
            <span dir="ltr">
              <FiChevronLeft />
            </span>
          </button>
        </div>

        {/* שמות ימים */}
        <div className="grid grid-cols-7 gap-[4px] text-[11px] text-gray-500 dark:text-gray-300 mb-1">
          {dayNames.map((name) => (
            <div
              key={name}
              className="h-7 flex items-center justify-center"
            >
              {name}
            </div>
          ))}
        </div>

        {/* ימים – עיגול זהה + טווח ורוד */}
        <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
          {days.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelectedSingle = isSameCalendarDay(day, selectedDate);

            const isRangeStart =
              rangeStartDate && isSameCalendarDay(day, rangeStartDate);

            const isRangeEnd =
              activeEnd &&
              !isSameCalendarDay(rangeStartDate, activeEnd) &&
              isSameCalendarDay(day, activeEnd);

            const inBetweenRange =
              rangeStartDate && activeEnd
                ? isBetweenInclusive(day, rangeStartDate, activeEnd) &&
                  !isRangeStart &&
                  !isRangeEnd
                : false;

            let className =
              "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-colors";
            let style = {};

            if (isRangeStart || isRangeEnd) {
              className += " font-semibold text-white";
              style = {
                backgroundColor: BRAND_COLOR,
                color: "#FFFFFF",
              };
            } else if (isSelectedSingle) {
              className +=
                " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
              style = {
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
              };
            } else if (isSameCalendarDay(day, today) && isCurrentMonth && !rangeStartDate) {
              className +=
                " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
              style = {
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
              };
            } else if (!isCurrentMonth) {
              className += " text-gray-400 dark:text-gray-600";
            } else {
              className +=
                " text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]";
            }

            return (
              <div
                key={day.toISOString()}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  {/* רקע ורוד לטווח */}
                  {inBetweenRange && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                        style={{
                          backgroundColor: "rgba(255,37,124,0.12)",
                          boxShadow:
                            "0 0 0 1px rgba(255,37,124,0.28)",
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className={className}
                    style={style}
                    onClick={() => {
                      if (!rangeStartDate || (rangeStartDate && rangeEndDate)) {
                        setRangeStartDate(day);
                        setRangeEndDate(null);
                        setRangeHoverDate(null);
                      } else {
                        setRangeEndDate(day);
                        setRangeHoverDate(null);
                      }
                    }}
                    onMouseEnter={() => {
                      if (rangeStartDate && !rangeEndDate) {
                        setRangeHoverDate(day);
                      }
                    }}
                  >
                    {day.getDate()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes gentleGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 5% 55%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .gentle-gradient-animation {
          background-size: 120% 120%;
          animation: gentleGradientShift 8s ease-in-out infinite;
        }
      `}</style>
      {/* בר עליון */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-gray-200 dark:border-commonBorder bg-[#F9F9F9] dark:bg-[#111111] w-full ${view === "day" || view === "week" ? "" : "border-b"}`}>
        {/* צד שמאל */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Settings */}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            onClick={() => {
              setSlotHeight(appliedSlotHeight);
              onSettingsClick();
            }}
          >
            <FiSettings className="text-[15px]" />
          </button>

          {/* כפתור תאריך – חצים + תאריך + חצים */}
          <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 overflow-hidden">
            {/* חץ שמאלי – קדימה (+1) */}
            <button
              onClick={handleNext}
              className="py-2 px-2 sm:px-3 flex items-center justify-center border-r border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            >
              <span dir="ltr">
                <FiChevronLeft className="text-[14px]" />
              </span>
            </button>

            {/* טקסט התאריך / הטווח */}
            <button
              type="button"
              onClick={() => {
                setSelectedDate(currentDate);
                setPickerMonth(currentDate);
                setRangeStartDate(null);
                setRangeEndDate(null);
                setRangeHoverDate(null);
                setIsDatePickerOpen(true);
              }}
              className="px-3 sm:px-4 py-2 flex items-center justify-center font-medium whitespace-nowrap"
            >
              <span dir="rtl">{headerLabel}</span>
            </button>

            {/* חץ ימני – אחורה (-1) */}
            <button
              onClick={handlePrev}
              className="py-2 px-2 sm:px-3 flex items-center justify-center border-l border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            >
              <span dir="ltr">
                <FiChevronRight className="text-[14px]" />
              </span>
            </button>
          </div>

          {/* Staff dropdown button */}
          <div className="relative">
            {/* כפתור "כל הצוות" – החץ משמאל לטקסט */}
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setIsStaffDropdownOpen((prev) => !prev)}
            >
              {/* החץ קודם – יהיה בצד שמאל */}
              <FiChevronDown className="text-[14px] text-gray-400" />
              {/* הטקסט אחריו – בצד ימין */}
              <span className="whitespace-nowrap">
                {staffButtonLabel}
              </span>
            </button>

            {isStaffDropdownOpen && (
              <div
                dir="rtl"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
              >
                {/* מצב תצוגה – Scheduled / All */}
                <div className="py-2 border-b border-gray-200 dark:border-[#2B2B2B]">
                  {/* צוות עם תורים */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      // This will be handled by the filterEvents function
                      // which checks for actual appointments
                      setSelectedStaff("scheduled-team");
                      // Don't set selectedTeamMembers here - let the filter handle it
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedStaff === "scheduled-team"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedStaff === "scheduled-team" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <span>צוות עם תורים</span>
                    </span>
                  </button>

                  {/* כל הצוות */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        if (allStaffIds && Array.isArray(allStaffIds) && allStaffIds.length > 0) {
                          setSelectedStaff("all-business");
                          setSelectedTeamMembers([...allStaffIds]);
                        } else {
                          setSelectedStaff("all-business");
                          setSelectedTeamMembers([]);
                        }
                        setIsStaffDropdownOpen(false);
                      } catch (error) {
                        console.error("Error setting all staff:", error);
                        setIsStaffDropdownOpen(false);
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedStaff === "all-business"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedStaff === "all-business" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <span>כל הצוות</span>
                    </span>
                  </button>
                </div>

                {/* רשימת עובדים – שם בלבד */}
                <div className="py-2">
                  <div className="flex items-center justify-between px-3 mb-1">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      חברי צוות
                    </span>
                    <button
                      className="text-[11px] text-[rgba(148,163,184,1)] hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={handleClearAllStaff}
                    >
                      נקה הכל
                    </button>
                  </div>

                  {staffDayCalendars.map((staff) => {
                    const isChecked =
                      selectedTeamMembers.includes(staff.id);

                    return (
                      <button
                        key={staff.id}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleStaffMember(staff.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center text-[11px] font-semibold text-gray-800 dark:text-gray-100">
                            {staff.initials}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-[12px] font-medium">
                              {staff.name}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            isChecked
                              ? "border-transparent"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                          style={
                            isChecked
                              ? { backgroundColor: BRAND_COLOR }
                              : undefined
                          }
                        >
                          {isChecked && (
                            <span className="text-[10px] text-white leading-none">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* צד ימין */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end flex-shrink-0">
          {/* Waitlist */}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            onClick={onWaitlistClick}
          >
            <FiClock className="text-[15px]" />
          </button>

          {/* Day / Week / Month */}
          <div className="inline-flex items-center gap-2 flex-row-reverse">
            <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-[#181818] p-1 text-xs sm:text-sm flex-row-reverse">
              <button
                onClick={() => changeView("day")}
                className={`px-3 py-2 rounded-full transition ${
                  view === "day"
                    ? "text-gray-900 dark:text-white shadow-sm bg-white dark:bg-[#262626]"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                יום
              </button>
              <button
                onClick={() => changeView("week")}
                className={`px-3 py-2 rounded-full transition ${
                  view === "week"
                    ? "text-gray-900 dark:text-white shadow-sm bg-white dark:bg-[#262626]"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                שבוע
              </button>
              <button
                onClick={() => changeView("month")}
                className={`px-3 py-2 rounded-full transition ${
                  view === "month"
                    ? "text-gray-900 dark:text-white shadow-sm bg-white dark:bg-[#262626]"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                חודש
              </button>
            </div>
          </div>

          {/* כפתור "היום" - קופץ לתצוגה יומית של היום */}
          <button
            onClick={jumpToToday}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition overflow-hidden relative"
            style={{ 
              color: "#ffffff",
              backgroundImage: `url(${gradientTeamImage})`,
              backgroundSize: '130%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <span className="relative z-10">היום</span>
          </button>
        </div>
      </div>

      {/* Date picker – מודאל אמצעי */}
      {isDatePickerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* X מחוץ לפופ אפ בצד שמאל */}
            <button
              className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setIsDatePickerOpen(false)}
            >
              <FiX className="text-[20px]" />
            </button>

            <div className="w-[90vw] max-w-md rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-2xl p-4 sm:p-6">
              <div dir="rtl">
                {renderSingleMonth(pickerMonth)}
              </div>

              {/* כפתור שמירה */}
              <div className="flex items-center justify-end mt-4 text-xs sm:text-sm">
                <button
                  className="px-8 py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                  onClick={applyDateSelection}
                >
                  שמור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* לייר לסגירת דרופדאון עובדים בלחיצה בחוץ */}
      {isStaffDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsStaffDropdownOpen(false)}
        />
      )}
    </>
  );
};

