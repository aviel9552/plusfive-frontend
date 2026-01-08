/**
 * BookingFlowPanel Component
 * Multi-step panel for booking appointments or adding to waitlist
 * Supports both booking flow (with staff selection) and waitlist flow
 */

import React, { useMemo, useState, useEffect } from "react";
import {
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiPlus,
} from "react-icons/fi";
import { BRAND_COLOR } from "../../../utils/calendar/constants";
import { getMonthMatrix } from "../../../utils/calendar/calendarMatrix";
import { isSameCalendarDay, formatBookingDateLabel } from "../../../utils/calendar/dateHelpers";
import { generateTimeSlots, parseServiceDuration, calculateEndTime, getExactStartTime } from "../../../utils/calendar/timeHelpers";
import { DEMO_WAITLIST_CLIENTS } from "../../../data/calendar/demoData";

const SERVICES_STORAGE_KEY = "services";

export const BookingFlowPanel = ({
  isOpen,
  onClose,
  language,
  // Flow state
  addFlowMode,
  waitlistAddStep,
  // Selected values
  selectedWaitlistClient,
  bookingSelectedDate,
  bookingSelectedTime,
  bookingSelectedService,
  bookingSelectedStaff,
  selectedStaffForBooking,
  // Search states
  waitlistClientSearch,
  serviceSearch,
  // Dropdown states
  isTimeDropdownOpen,
  // Recurring appointment settings
  recurringServiceType,
  recurringDuration,
  isServiceTypeDropdownOpen,
  isRepeatDurationDropdownOpen,
  // Date picker state
  bookingMonth,
  // Clients list
  clients,
  // Staff list
  staffDayCalendars,
  // Setters
  setWaitlistAddStep,
  setSelectedWaitlistClient,
  setBookingSelectedDate,
  setBookingSelectedTime,
  setBookingSelectedService,
  setSelectedStaffForBooking,
  setWaitlistClientSearch,
  setServiceSearch,
  setIsTimeDropdownOpen,
  setRecurringServiceType,
  setRecurringDuration,
  setIsServiceTypeDropdownOpen,
  setIsRepeatDurationDropdownOpen,
  setBookingMonth,
  // Actions
  onApply,
  onOpenNewClientModal,
}) => {
  // Load services from localStorage only (no demo services)
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    const loadServices = () => {
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        try {
          const parsedServices = JSON.parse(storedServices);
          setServices(parsedServices);
        } catch (error) {
          console.error("Error loading services from localStorage:", error);
          setServices([]);
        }
      } else {
        setServices([]);
      }
    };
    
    loadServices();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === SERVICES_STORAGE_KEY) {
        loadServices();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes
    const intervalId = setInterval(() => {
      loadServices();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Get selected service object
  const selectedServiceObj = useMemo(() => {
    if (!bookingSelectedService) return null;
    return services.find(s => s.id === bookingSelectedService);
  }, [services, bookingSelectedService]);

  // Helper function to get day of week in Hebrew (א', ב', ג', ד', ה', ו', ש')
  // Must match the format used in services: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\'']
  const getDayOfWeekHebrew = (date) => {
    const day = date.getDay();
    const days = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
    return days[day];
  };

  // Check if a date is available for the selected service
  // Default: all days are available unless user has set specific availableDays
  const isDateAvailable = (date) => {
    // If no service selected, all dates are available
    if (!selectedServiceObj) return true;
    
    // If availableDays is undefined/null, all days are available (default)
    if (selectedServiceObj.availableDays === undefined || selectedServiceObj.availableDays === null) {
      return true;
    }
    
    // If availableDays is empty array, no days are available (user explicitly deselected all)
    if (selectedServiceObj.availableDays.length === 0) {
      return false;
    }
    
    // If availableDays is set, only days in the array are available
    const dayHebrew = getDayOfWeekHebrew(date);
    return selectedServiceObj.availableDays.includes(dayHebrew);
  };

  // Calculate today for date comparison
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Filter and sort clients based on search - newest first
  const filteredClients = useMemo(() => {
    const filtered = clients.filter((c) => {
      if (!waitlistClientSearch.trim()) return true;
      const term = waitlistClientSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term)
      );
    });
    
    // Sort by id (timestamp) descending - newest first
    return filtered.sort((a, b) => {
      const idA = a.id || 0;
      const idB = b.id || 0;
      return idB - idA; // Descending order (newest first)
    });
  }, [clients, waitlistClientSearch]);

  // Generate time slots: 5-minute intervals for booking flow, 30-minute for waitlist flow
  // Filter by service earliestBookingTime and latestBookingTime if service is selected
  // Default: all times are available unless user has set specific earliestBookingTime/latestBookingTime
  const timeSlots = useMemo(() => {
    let slots = addFlowMode === "booking"
      ? generateTimeSlots(10, 20, 5)
      : generateTimeSlots(10, 20, 30);
    
    // Filter by service time constraints if service is selected AND times are explicitly set
    if (selectedServiceObj) {
      const earliestTime = selectedServiceObj.earliestBookingTime;
      const latestTime = selectedServiceObj.latestBookingTime;
      
      // Only filter if at least one time constraint is explicitly set (not empty/null)
      if (earliestTime || latestTime) {
        slots = slots.filter(slot => {
          // Convert slot time (e.g., "10:00") to minutes for comparison
          const [slotHours, slotMinutes] = slot.split(':').map(Number);
          const slotTotalMinutes = slotHours * 60 + slotMinutes;
          
          if (earliestTime) {
            const [earliestHours, earliestMinutes] = earliestTime.split(':').map(Number);
            const earliestTotalMinutes = earliestHours * 60 + earliestMinutes;
            if (slotTotalMinutes < earliestTotalMinutes) return false;
          }
          
          if (latestTime) {
            const [latestHours, latestMinutes] = latestTime.split(':').map(Number);
            const latestTotalMinutes = latestHours * 60 + latestMinutes;
            if (slotTotalMinutes > latestTotalMinutes) return false;
          }
          
          return true;
        });
      }
      // If neither earliestTime nor latestTime is set, all slots are available (default)
    }
    
    return slots;
  }, [addFlowMode, selectedServiceObj]);

  // Step flags
  const isStaffStep = waitlistAddStep === "staff";
  const isDateStep = waitlistAddStep === "date";
  const isTimeStep = waitlistAddStep === "time";
  const isServiceStep = waitlistAddStep === "service";
  const isClientStep = waitlistAddStep === "client";

  // Title text based on current step
  const titleText = isClientStep
    ? "בחר לקוח"
    : isStaffStep
    ? "בחר עובד"
    : isDateStep
    ? "בחר תאריך"
    : isTimeStep
    ? "בחר שעה"
    : "בחר שירות";

  const bookingDateLabel = formatBookingDateLabel(bookingSelectedDate, language);

  // Calendar month renderer for date selection
  const renderBookingMonthForPanel = () => {
    const locale = language === "he" ? "he-IL" : "en-US";
    const days = getMonthMatrix(bookingMonth);
    const currentMonth = bookingMonth.getMonth();

    const monthLabel = bookingMonth.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    const dayNames = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2025, 0, 5 + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });

    return (
      <div className="w-full">
        {/* כותרת חודש + חצים */}
        <div className="flex items-center justify-between mb-3">
          {/* חץ ימין – חוזר חודש אחורה */}
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-300"
            onClick={() => {
              const d = new Date(bookingMonth);
              d.setMonth(d.getMonth() - 1);
              setBookingMonth(d);
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
              const d = new Date(bookingMonth);
              d.setMonth(d.getMonth() + 1);
              setBookingMonth(d);
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
            <div key={name} className="h-7 flex items-center justify-center">
              {name}
            </div>
          ))}
        </div>

        {/* ימים – עיגול זהה */}
        <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
          {days.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelectedSingle = isSameCalendarDay(day, bookingSelectedDate);
            const isTodayFlag = isSameCalendarDay(day, today);
            const isAvailable = isDateAvailable(day);

            let className =
              "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-colors";
            let style = {};

            if (isSelectedSingle) {
              className +=
                " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
              style = {
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
              };
            } else if (isTodayFlag && isCurrentMonth && !bookingSelectedDate) {
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
            } else if (!isAvailable) {
              className += " text-gray-300 dark:text-gray-700 opacity-50 cursor-not-allowed";
            } else {
              className +=
                " text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]";
            }

            return (
              <div key={day.toISOString()} className="flex items-center justify-center">
                <button
                  type="button"
                  className={className}
                  style={style}
                  onClick={() => {
                    if (isAvailable) {
                      setBookingSelectedDate(day);
                    }
                  }}
                  disabled={!isAvailable}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <style>{`
        @keyframes gentleGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 30% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .apply-button-gradient {
          background: #000000 !important;
          background-size: auto !important;
          animation: none !important;
        }
        html.dark .apply-button-gradient {
          background: linear-gradient(315deg, #FF257C 0%, #FF257C 25%, #FF257C 50%, #FF8FC0 75%, #FFE7F3 100%) !important;
          background-size: 130% 130% !important;
          animation: gentleGradientShift 10s ease-in-out infinite !important;
        }
      `}</style>
      {/* קליק על הרקע – סוגר את הפאנל הזה בלבד */}
      <div className="flex-1 bg-black/0" onClick={onClose} />

      <div
        dir="rtl"
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X מחוץ לפופ בצד שמאל למעלה */}
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
        >
          <FiX className="text-[20px]" />
        </button>

        {/* Header + breadcrumb עם ניווט לחיץ */}
        <div className="px-8 pt-7 pb-3">
          {/* שלבי הפלואו */}
          <div className="text-[11px] mb-2 flex items-center gap-1">
            {/* Show staff step ONLY for booking flow */}
            {addFlowMode === "booking" &&
              !(bookingSelectedDate && bookingSelectedTime && bookingSelectedStaff) && (
                <>
                  <button
                    className={`transition ${
                      isStaffStep
                        ? "text-gray-900 dark:text-gray-100 font-medium"
                        : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setWaitlistAddStep("staff")}
                  >
                    עובד
                  </button>
                  <span className="text-gray-300">›</span>
                </>
              )}

            {/* Show date/time steps only if not pre-filled from calendar click */}
            {!(bookingSelectedDate && bookingSelectedTime && bookingSelectedStaff) && (
              <>
                <button
                  className={`transition ${
                    isDateStep
                      ? "text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setWaitlistAddStep("date")}
                >
                  תאריך
                </button>
                <span className="text-gray-300">›</span>

                <button
                  className={`transition ${
                    isTimeStep
                      ? "text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setWaitlistAddStep("time")}
                >
                  שעה
                </button>
                <span className="text-gray-300">›</span>
              </>
            )}

            <button
              className={`transition ${
                isServiceStep
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setWaitlistAddStep("service")}
            >
              שירות
            </button>
            <span className="text-gray-300">›</span>

            <button
              className={`transition ${
                isClientStep
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setWaitlistAddStep("client")}
            >
              לקוח
            </button>
          </div>

          {/* כותרת המסך */}
          <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
            {titleText}
          </h2>
        </div>

        {/* BODY – שלב 1: Select staff (BOOKING FLOW ONLY) */}
        {isStaffStep && addFlowMode === "booking" && (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-m text-gray-800 dark:text-gray-100">
              <div className="space-y-5">
                {/* search bar */}
                <div className="mt-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiSearch className="text-[16px]" />
                    </span>
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="חפש לפי שם עובד"
                      className="w-full h-10 rounded-[12px] bg-white dark:bg-[#181818] border border-[rgba(148,163,184,0.35)] dark:border-[#333] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-3" />

                {/* רשימת עובדים */}
                <div className="space-y-3">
                  {staffDayCalendars.filter((staff) =>
                    staff.name.toLowerCase().includes(serviceSearch.toLowerCase())
                  ).map((staff) => {
                    const isActive = selectedStaffForBooking === staff.id;

                    return (
                      <button
                        key={staff.id}
                        type="button"
                        className={`relative w-full flex items-center justify-between px-3 py-3 text-left text-xs sm:text-sm transition
                          ${
                            isActive
                              ? "bg-gray-100 dark:bg-[#1f1f1f] border-transparent"
                              : "bg-white dark:bg-[#181818] border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          }
                        `}
                        onClick={() => setSelectedStaffForBooking(staff.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-[4px] h-10 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />

                          <div className="flex items-center gap-3">
                            {staff.imageUrl ? (
                              <img
                                src={staff.imageUrl}
                                alt={staff.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: BRAND_COLOR }}
                                >
                                  {staff.initials}
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col items-start">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {staff.name}
                              </span>
                              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                {staff.status === "offline" || staff.status === "not-working"
                                  ? "לא עובד היום"
                                  : "זמין"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isActive && (
                          <span className="ml-4 text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
              <button
                type="button"
                className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedStaffForBooking}
                onClick={() => {
                  if (selectedStaffForBooking) {
                    setWaitlistAddStep("date");
                  }
                }}
              >
                  המשך
                </button>
            </div>
          </>
        )}

        {/* BODY – שלב 2: Select date */}
        {isDateStep && (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-sm text-gray-800 dark:text-gray-100">
              {renderBookingMonthForPanel()}
            </div>

            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
              <button
                type="button"
                className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!bookingSelectedDate}
                onClick={() => {
                  if (bookingSelectedDate) {
                    setWaitlistAddStep("time");
                    setBookingSelectedTime("any");
                    setBookingSelectedService(null);
                    setServiceSearch("");
                    setIsTimeDropdownOpen(false);
                  }
                }}
              >
                המשך
              </button>
            </div>
          </>
        )}

        {/* BODY – שלב 3: Select time */}
        {isTimeStep && (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-6">
                {/* Date summary */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    תאריך
                  </div>
                  <div className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                    <span>{bookingDateLabel || ""}</span>
                  </div>
                </div>

                {/* Start time */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    שעת התחלה
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                      onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
                    >
                      <span>
                        {!bookingSelectedTime || bookingSelectedTime === "any"
                          ? "כל שעה"
                          : bookingSelectedTime}
                      </span>
                      <FiChevronDown className="text-[16px] text-gray-400" />
                    </button>

                    {isTimeDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                        style={{
                          boxShadow:
                            "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                        }}
                      >
                        {/* Any time */}
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                          onClick={() => {
                            setBookingSelectedTime("any");
                            setIsTimeDropdownOpen(false);
                          }}
                        >
                          <span className="text-gray-800 dark:text-gray-100">כל שעה</span>
                          {(!bookingSelectedTime || bookingSelectedTime === "any") && (
                            <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                              ✓
                            </span>
                          )}
                        </button>

                        <div className="my-1 border-t border-gray-200 dark:border-[#262626]" />

                        {/* רשימת סלוטים */}
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                            onClick={() => {
                              setBookingSelectedTime(slot);
                              setIsTimeDropdownOpen(false);
                            }}
                          >
                            <span className="text-gray-800 dark:text-gray-100">{slot}</span>
                            {bookingSelectedTime === slot && (
                              <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
              <button
                type="button"
                className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                onClick={() => {
                  setIsTimeDropdownOpen(false);
                  setWaitlistAddStep("service");
                }}
              >
                המשך
              </button>
            </div>
          </>
        )}

        {/* BODY – שלב 3: Select service */}
        {isServiceStep && (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-m text-gray-800 dark:text-gray-100">
              <div className="space-y-5">
                {/* סיכום איש צוות (אם קיים) */}
                {(bookingSelectedStaff || selectedStaffForBooking) && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      איש צוות
                    </div>
                    <div className="text-base text-gray-500 dark:text-gray-400">
                      {bookingSelectedStaff?.name ||
                        staffDayCalendars.find((s) => s.id === selectedStaffForBooking)?.name ||
                        ""}
                    </div>
                  </div>
                )}

                {/* סיכום תאריך ושעה */}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    תאריך ושעה
                  </div>
                  <div className="text-base text-gray-500 dark:text-gray-400">
                    {bookingDateLabel} ·{" "}
                    {!bookingSelectedTime || bookingSelectedTime === "any"
                      ? "כל שעה"
                      : bookingSelectedTime}
                  </div>
                </div>

                {/* Recurring Appointment Dropdowns - Side by Side */}
                <div className="flex gap-3">
                  {/* Service Type Dropdown */}
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      סוג שירות
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => setIsServiceTypeDropdownOpen((prev) => !prev)}
                      >
                        <span>
                          {recurringServiceType === "Regular Appointment"
                            ? "תור רגיל"
                            : recurringServiceType === "Every Day"
                            ? "כל יום"
                            : recurringServiceType === "Every 3 Days"
                            ? "כל 3 ימים"
                            : recurringServiceType === "Every Week"
                            ? "כל שבוע"
                            : recurringServiceType === "Every 2 Weeks"
                            ? "כל שבועיים"
                            : recurringServiceType === "Every 3 Weeks"
                            ? "כל 3 שבועות"
                            : recurringServiceType === "Every Month"
                            ? "כל חודש"
                            : recurringServiceType === "Every 2 Months"
                            ? "כל חודשיים"
                            : recurringServiceType === "Every 3 Months"
                            ? "כל 3 חודשים"
                            : recurringServiceType === "Every 4 Months"
                            ? "כל 4 חודשים"
                            : recurringServiceType === "Every 5 Months"
                            ? "כל 5 חודשים"
                            : recurringServiceType === "Every 6 Months"
                            ? "כל 6 חודשים"
                            : recurringServiceType}
                        </span>
                        <FiChevronDown className="text-[16px] text-gray-400" />
                      </button>

                      {isServiceTypeDropdownOpen && (
                        <div
                          className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                          style={{
                            boxShadow:
                              "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                          }}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                            onClick={() => {
                              setRecurringServiceType("Regular Appointment");
                              setIsServiceTypeDropdownOpen(false);
                            }}
                          >
                            <span className="text-gray-800 dark:text-gray-100">תור רגיל</span>
                            {recurringServiceType === "Regular Appointment" && (
                              <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                                ✓
                              </span>
                            )}
                          </button>
                          <div className="my-1 border-t border-gray-200 dark:border-[#262626]" />
                          {[
                            { value: "Every Day", label: "כל יום" },
                            { value: "Every 3 Days", label: "כל 3 ימים" },
                            { value: "Every Week", label: "כל שבוע" },
                            { value: "Every 2 Weeks", label: "כל שבועיים" },
                            { value: "Every 3 Weeks", label: "כל 3 שבועות" },
                            { value: "Every Month", label: "כל חודש" },
                            { value: "Every 2 Months", label: "כל חודשיים" },
                            { value: "Every 3 Months", label: "כל 3 חודשים" },
                            { value: "Every 4 Months", label: "כל 4 חודשים" },
                            { value: "Every 5 Months", label: "כל 5 חודשים" },
                            { value: "Every 6 Months", label: "כל 6 חודשים" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                              onClick={() => {
                                setRecurringServiceType(option.value);
                                setIsServiceTypeDropdownOpen(false);
                              }}
                            >
                              <span className="text-gray-800 dark:text-gray-100">
                                {option.label}
                              </span>
                              {recurringServiceType === option.value && (
                                <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                                  ✓
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repeat Duration Dropdown */}
                  {recurringServiceType !== "Regular Appointment" && (
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        חזור למשך
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          onClick={() => setIsRepeatDurationDropdownOpen((prev) => !prev)}
                        >
                          <span>
                            {recurringDuration === "1 Week"
                              ? "שבוע"
                              : recurringDuration === "2 Weeks"
                              ? "שבועיים"
                              : recurringDuration === "3 Weeks"
                              ? "3 שבועות"
                              : recurringDuration === "1 Month"
                              ? "חודש"
                              : recurringDuration === "1.5 Months"
                              ? "חודש וחצי"
                              : recurringDuration === "2 Months"
                              ? "חודשיים"
                              : recurringDuration === "3 Months"
                              ? "3 חודשים"
                              : recurringDuration === "6 Months"
                              ? "6 חודשים"
                              : recurringDuration === "12 Months"
                              ? "12 חודשים"
                              : recurringDuration}
                          </span>
                          <FiChevronDown className="text-[16px] text-gray-400" />
                        </button>

                        {isRepeatDurationDropdownOpen && (
                          <div
                            className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                            style={{
                              boxShadow:
                                "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                            }}
                          >
                            {[
                              { value: "1 Week", label: "שבוע" },
                              { value: "2 Weeks", label: "שבועיים" },
                              { value: "3 Weeks", label: "3 שבועות" },
                              { value: "1 Month", label: "חודש" },
                              { value: "1.5 Months", label: "חודש וחצי" },
                              { value: "2 Months", label: "חודשיים" },
                              { value: "3 Months", label: "3 חודשים" },
                              { value: "6 Months", label: "6 חודשים" },
                              { value: "12 Months", label: "12 חודשים" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                                onClick={() => {
                                  setRecurringDuration(option.value);
                                  setIsRepeatDurationDropdownOpen(false);
                                }}
                              >
                                <span className="text-gray-800 dark:text-gray-100">
                                  {option.label}
                                </span>
                                {recurringDuration === option.value && (
                                  <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                                    ✓
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* search bar */}
                <div className="mt-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiSearch className="text-[16px]" />
                    </span>
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="חפש לפי שם שירות"
                      className="w-full h-10 rounded-[12px] bg-white dark:bg-[#181818] border border-[rgba(148,163,184,0.35)] dark:border-[#333] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-3" />

                {/* רשימת שירותים */}
                <div className="space-y-3">
                  {services.filter((service) =>
                    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
                  ).map((service) => {
                    const isActive = bookingSelectedService === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`group relative w-full flex items-center justify-between px-3 py-3 text-left text-xs sm:text-sm transition rounded-lg
                          ${
                            isActive
                              ? "bg-gray-100 dark:bg-transparent border-transparent"
                              : "bg-white dark:bg-transparent border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          }
                        `}
                        onClick={() => {
                          setBookingSelectedService(service.id);
                          setWaitlistAddStep("client");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-[4px] h-10 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />

                          <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
                              {service.name}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400">
                              {service.duration 
                                ? (() => {
                                    const minutes = Number(service.duration);
                                    if (isNaN(minutes)) return service.duration;
                                    if (minutes === 60) return "1 שעה";
                                    if (minutes > 60) {
                                      const hours = Math.floor(minutes / 60);
                                      const remainingMinutes = minutes % 60;
                                      if (remainingMinutes === 0) return `${hours} שעות`;
                                      return `${hours} שעות ${remainingMinutes} דק'`;
                                    }
                                    return `${minutes} דק'`;
                                  })()
                                : "-"}
                            </span>
                          </div>
                        </div>

                        <span className="ml-4 text-[13px] font-semibold text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
                          ₪{service.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* BODY – שלב 4: Client (אחרון + Apply) */}
        {isClientStep && (
          <>
            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
              {/* חיפוש */}
              <div className="mb-5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch className="text-[16px]" />
                  </span>
                  <input
                    type="text"
                    value={waitlistClientSearch}
                    onChange={(e) => setWaitlistClientSearch(e.target.value)}
                    placeholder="חפש לקוח או השאר ריק ללקוח מזדמן"
                    className="w-full h-10 rounded-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.35)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add new client */}
              <button
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl border border-dashed border-gray-300 dark:border-[#333] bg-gray-50/70 dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-xs sm:text-sm mb-4"
                onClick={onOpenNewClientModal}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[18px] font-semibold shadow-sm"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <FiPlus />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-gray-900 dark:text-gray-50">
                    הוסף לקוח חדש
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    צור פרופיל לקוח חדש לתור זה
                  </span>
                </div>
              </button>

              {/* רשימת קליינטים */}
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#181818] text-left text-xs sm:text-sm ${
                      selectedWaitlistClient?.id === client.id
                        ? "bg-gray-50 dark:bg-[#181818]"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedWaitlistClient(client);
                      // אם כל הנתונים קיימים, המשך ל-AppointmentSummaryCard (אישור סופי)
                      if (bookingSelectedService && bookingSelectedDate) {
                        onApply(client);
                      }
                      // אם חסרים נתונים, רק בוחר את הלקוח ומשאיר את הפאנל פתוח
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 overflow-hidden">
                        {client.profileImage ? (
                          <img 
                            src={client.profileImage} 
                            alt={client.name || "לקוח"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          client.initials
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {client.name}
                        </span>
                        {client.email && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

