/**
 * Month Grid Component
 * Displays month view with calendar days and appointments
 */

import React, { useMemo } from 'react';
import { BRAND_COLOR } from '../../../utils/calendar/constants';
import { getMonthMatrix } from '../../../utils/calendar/calendarMatrix';
import { formatDateLocal } from '../../../utils/calendar/dateHelpers';
export const MonthGrid = ({
  currentDate,
  events,
  selectedStaff,
  selectedTeamMembers,
  language,
  staffDayCalendars = [],
  allStaffIds = [],
  services = [],
}) => {
  const locale = language === "he" ? "he-IL" : "en-US";
  const daysMatrix = getMonthMatrix(currentDate);
  const currentMonth = currentDate.getMonth();

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Filter events based on staff selection
  const filterEvents = (eventsList) => {
    return eventsList.filter((e) => {
      if (selectedStaff === "all-business") {
        return true;
      }
      if (selectedStaff === "scheduled-team") {
        // Check if staff has appointments in the events
        return events.some(
          (appt) => appt.staff === e.staff && appt.status !== "בוטל"
        );
      }
      if (selectedStaff === "custom") {
        if (!selectedTeamMembers.length) return false;
        return selectedTeamMembers.includes(e.staff);
      }
      return e.staff === selectedStaff;
    });
  };

  const filteredEvents = useMemo(() => filterEvents(events), [events, selectedStaff, selectedTeamMembers, staffDayCalendars]);

  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2025, 0, 5 + i);
    return d.toLocaleDateString(locale, { weekday: "short" });
  });

  // Divide matrix into weeks (rows of 7 days)
  const weeks = [];
  for (let i = 0; i < daysMatrix.length; i += 7) {
    weeks.push(daysMatrix.slice(i, i + 7));
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#050505]">
      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-commonBorder bg-gray-50/80 dark:bg-[#080808]">
        {dayNames
          .slice()
          .reverse()
          .map((name) => (
            <div
              key={name}
              className="h-10 flex items-center justify-center text-[15px] font-medium text-gray-500 dark:text-gray-300"
            >
              {name}
            </div>
          ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[700px]">
        {weeks.map((week, rowIndex) =>
          week
            .slice()
            .reverse()
            .map((day) => {
              const isTodayFlag = day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day.getMonth() === currentMonth;
              const iso = formatDateLocal(day);
              const dayEvents = filteredEvents.filter((e) => e.date === iso);

              const dayDate = new Date(day);
              dayDate.setHours(0, 0, 0, 0);
              const isPast = dayDate < today;

              return (
                <div
                  key={iso}
                  className={`relative overflow-hidden border border-gray-200/70 dark:border-[#191919] ${
                    isCurrentMonth
                      ? "bg-white dark:bg-[#050505]"
                      : "bg-gray-50/60 dark:bg-[#050505]"
                  }`}
                >
                  {isPast && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        background:
                          "repeating-linear-gradient(135deg, rgba(0,0,0,0.025), rgba(0,0,0,0.025) 4px, transparent 4px, transparent 8px)",
                      }}
                    />
                  )}

                  <div className="relative flex items-center justify-between px-2 pt-1">
                    <span
                      className={`text-xs font-medium ${
                        isCurrentMonth
                          ? "text-gray-700 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {isTodayFlag && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        •
                      </span>
                    )}
                  </div>

                  <div className="relative px-2 pb-2 mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      // Get service color from services array
                      const getServiceColor = () => {
                        if (ev.serviceId) {
                          const service = services.find(s => s.id === ev.serviceId || s.id === String(ev.serviceId));
                          if (service && service.color) {
                            return service.color;
                          }
                        }
                        // Fallback to ev.color or brand color
                        return ev.color || BRAND_COLOR;
                      };
                      const serviceColor = getServiceColor();
                      
                      return (
                        <div
                          key={ev.id}
                          className="h-4 rounded-[6px] text-[9px] px-1 flex items-center text-gray-900 dark:text-white truncate"
                          style={{ backgroundColor: serviceColor }}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 3} נוספים
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

