/**
 * Calendar Staff Bar Component
 * Displays staff list for day view or day headers for week view
 * Separate layout component, independent from CalendarHeader
 */

import React, { useMemo } from 'react';
import { BRAND_COLOR } from '../../utils/calendar/constants';
import { formatDateLocal, formatDayLabel } from '../../utils/calendar/dateHelpers';
import gradientTeamImage from '../../assets/gradientteam.jpg';

export const CalendarStaffBar = ({
  view,
  currentDate,
  weekDays,
  filteredEvents,
  selectedStaff,
  selectedTeamMembers,
  headerHeight,
  language,
  staffDayCalendars = [],
  allStaffIds = [],
  setSelectedStaff,
}) => {
  // DAY VIEW - Staff bar
  if (view === "day") {
    const currentDay = new Date(currentDate);
    currentDay.setHours(0, 0, 0, 0);
    const iso = formatDateLocal(currentDay);
    const dayEvents = filteredEvents.filter((e) => e.date === iso);
    
    // Calculate visible staff IDs
    const visibleStaffIds = useMemo(() => {
      if (selectedStaff === "all-business") {
        return allStaffIds || [];
      }
      if (selectedStaff === "scheduled-team") {
        // Get staff IDs that have appointments in filteredEvents
        const staffIdsWithAppointments = new Set(
          filteredEvents.map((e) => e.staff).filter(Boolean)
        );
        return Array.from(staffIdsWithAppointments);
      }
      if (selectedStaff === "custom") {
        return selectedTeamMembers.length ? selectedTeamMembers : (allStaffIds || []);
      }
      return [selectedStaff];
    }, [selectedStaff, selectedTeamMembers, allStaffIds, staffDayCalendars]);

    const staffCalendars = staffDayCalendars.filter((s) =>
      visibleStaffIds.includes(s.id)
    );

    const orderedStaff = [...staffCalendars].sort((a, b) => {
      const score = (s) =>
        s.status === "offline" || s.status === "not-working" ? 1 : 0;
      return score(a) - score(b);
    });

    const rtlStaff = [...orderedStaff].reverse();
    const colsCount = Math.max(1, orderedStaff.length || 1);

    return (
      <div
        className="fixed left-0 right-0 z-20 border-t border-b border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111111] h-28"
        style={{ 
          top: `${headerHeight-7.5}px`, // headerHeight כבר כולל את mainHeaderHeight + headerHeight - בדיוק כמו CalendarHeader מתחת ל-Header
        }}
      >
        <div className="flex h-full" dir="rtl">
          <div
            className="flex-1 grid"
            style={{ 
              gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
            }}
          >
        {rtlStaff.map((staff, index) => {
          const isOffline = staff.status === "offline" || staff.status === "not-working";
          const staffEventsForToday = dayEvents.filter((e) => e.staff === staff.id);
          const bookingsCount = staffEventsForToday.length;
          // First column (rightmost in RTL) should have border-l to align with time column border
          const isFirstColumn = index === 0;

          return (
            <div key={staff.id} className={`relative flex items-center justify-center w-full h-full ${isFirstColumn ? 'border-l' : 'border-r'} border-gray-200/80 dark:border-commonBorder`}>
              <div 
                className={`relative flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer w-full ${isOffline ? "opacity-70" : ""}`} 
                onClick={() => {
                  if (setSelectedStaff) {
                    setSelectedStaff(staff.id);
                  }
                }}
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full shadow-sm overflow-hidden p-[2px]"
                    style={{
                      backgroundImage: `url(${gradientTeamImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'bottom left',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {staff.imageUrl ? (
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#181818]">
                        <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#181818] flex items-center justify-center">
                        <span className="text-sm font-semibold text-black dark:text-white">
                          {staff.initials}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                  {staff.name}
                </span>
                <span className="mt-0.5 inline-flex items-center rounded-full px-2 py-[2px] text-[9px] bg-black text-white">
                  {isOffline ? "לא עובד היום" : `${bookingsCount} תורים היום`}
                </span>
              </div>
            </div>
          );
        })}
          </div>
          {/* Time column header spacer - matches TimeGrid layout */}
          <div className="w-[72px] sm:w-20 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // WEEK VIEW - Day headers
  if (view === "week") {
    const daysToRender = weekDays || [];
    return (
      <div className="fixed left-0 right-0 z-20 border-t border-b border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111111] h-28" style={{ top: `${headerHeight-7.5}px` }}>
        <div className="flex h-full" dir="rtl">
          <div className="flex-1 grid grid-cols-7">
        {daysToRender && daysToRender.length > 0 ? daysToRender.map((day) => {
          if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
            return null;
          }
          const { dayName, dayNum } = formatDayLabel(day, language);
          const isTodayFlag = new Date().toDateString() === day.toDateString();

          return (
            <div key={formatDateLocal(day)} className="relative flex items-center justify-center">
              <div
                className={`relative flex flex-col items-center gap-1 leading-tight transition-colors ${
                  isTodayFlag
                    ? "bg-white dark:bg-[#111111]"
                    : "bg-white dark:bg-[#080808]"
                }`}
              >
                <span
                  className={`text-[13px] uppercase tracking-wide ${
                    isTodayFlag
                      ? "text-[var(--brand-color,#7C3AED)]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  style={isTodayFlag ? { color: BRAND_COLOR } : undefined}
                >
                  {dayName}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 transition-all ${
                    isTodayFlag ? "text-white" : "text-gray-700 dark:text-gray-100"
                  }`}
                  style={{
                    ...(isTodayFlag ? { backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR } : { borderColor: 'transparent' })
                  }}
                  onMouseEnter={(e) => {
                    if (!isTodayFlag) {
                      e.currentTarget.style.borderColor = BRAND_COLOR;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isTodayFlag) {
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {dayNum}
                </span>
              </div>
            </div>
          );
        }) : null}
          </div>
          {/* Time column header spacer - matches TimeGrid layout (sticky left-0 in RTL means right side) */}
          <div className="w-[72px] sm:w-20 flex-shrink-0" />
        </div>
      </div>
    );
  }

  // MONTH VIEW - No staff bar
  return null;
};

