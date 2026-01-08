/**
 * Time Grid Component
 * Displays day/week view with time slots and appointments
 */

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  BRAND_COLOR,
  START_HOUR,
  END_HOUR,
  HOURS,
} from "../../../utils/calendar/constants";
import {
  formatHour,
  minutesToLabel,
  parseTime,
} from "../../../utils/calendar/timeHelpers";
import { formatDayLabel, formatDateLocal } from "../../../utils/calendar/dateHelpers";
import {
  // STAFF_DAY_CALENDARS and ALL_STAFF_IDS are now passed as props
} from "../../../data/calendar/demoData";
import { AppointmentCard } from "./AppointmentCard";

export const TimeGrid = ({
  view,
  currentDate,
  weekStart,
  weekDays,
  slotHeight,
  events,
  selectedStaff,
  selectedTeamMembers,
  draggedEvent,
  dragPosition,
  dragClickOffsetY,
  activeDraggedAppointmentId,
  hoverPreview,
  setHoverPreview,
  setDragPosition,
  setDragClickOffsetY,
  onDayColumnClick,
  onDayMouseMove,
  onDayMouseLeave,
  onAppointmentDrop,
  onAppointmentDragStart,
  onAppointmentDragEnd,
  onAppointmentClick,
  onAppointmentMouseEnter,
  onAppointmentMouseLeave,
  language,
  headerHeight = 65,
  staffDayCalendars = [],
  allStaffIds = [],
  services = [],
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Handle scroll events to hide hover preview during scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollContainerRef.current) {
        setScrollTop(scrollContainerRef.current.scrollTop);
      }

      if (setHoverPreview) {
        setHoverPreview(null);
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [setHoverPreview]);

  // Filter events based on staff selection
  const filterEvents = (eventsList) =>
    eventsList.filter((e) => {
      if (selectedStaff === "all-business") return true;

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

  const filteredEvents = useMemo(
    () => filterEvents(events),
    [events, selectedStaff, selectedTeamMembers, staffDayCalendars]
  );

  // Which staff to show (day view)
  const visibleStaffIds = useMemo(() => {
    if (selectedStaff === "all-business") return allStaffIds;

    if (selectedStaff === "scheduled-team") {
      // Get staff IDs that have appointments in the events
      const staffIdsWithAppointments = new Set(
        events.map((e) => e.staff).filter(Boolean)
      );
      return staffDayCalendars
        .filter((s) => staffIdsWithAppointments.has(s.id))
        .map((s) => s.id);
    }

    if (selectedStaff === "custom") {
      return selectedTeamMembers.length ? selectedTeamMembers : allStaffIds;
    }

    return [selectedStaff];
  }, [selectedStaff, selectedTeamMembers, allStaffIds, staffDayCalendars, events]);

  // Render single event
  const renderEvent = (event, dateIso, staffId, isWeekView = false) => {
    const eventStart = parseTime(event.start);
    const eventEnd = parseTime(event.end);
    const isDragging = draggedEvent?.id === event.id;
    const isHovered = false; // reserved

    let top;
    let height;

    if (isDragging) {
      // Same logic for both day and week view: show only in target column/day
      // In week view, check only dateIso (no staffId check since there's only one staff per day)
      // In day view, check both dateIso and staffId
      if (isWeekView) {
        // Week view: show only in target day at new position (same as day view logic)
        if (dragPosition.dateIso === dateIso) {
          top = dragPosition.y;
          height = Math.max((eventEnd - eventStart) * slotHeight - 2, 10);
        } else {
          return null; // Hide from original position when dragging
        }
      } else {
        // Day view: show only in target column
        if (dragPosition.dateIso === dateIso && dragPosition.staffId === staffId) {
          top = dragPosition.y;
          height = Math.max((eventEnd - eventStart) * slotHeight - 2, 10);
        } else {
          return null;
        }
      }
    } else {
      // Normal state
      if (event.staff !== staffId || event.date !== dateIso) return null;

      top = (eventStart - START_HOUR) * slotHeight;
      height = Math.max((eventEnd - eventStart) * slotHeight - 2, 10);
    }

    return (
      <AppointmentCard
        key={event.id}
        event={event}
        slotHeight={slotHeight}
        isDragging={isDragging}
        isHovered={isHovered}
        top={top}
        height={height}
        services={services}
        onDragStart={(e) => onAppointmentDragStart(e, event, dateIso, staffId)}
        onDragEnd={(e) => onAppointmentDragEnd(e, event)}
        onClick={(e) => onAppointmentClick && onAppointmentClick(e, event)}
        onMouseEnter={(e) =>
          onAppointmentMouseEnter && onAppointmentMouseEnter(e, event)
        }
        onMouseLeave={(e) =>
          onAppointmentMouseLeave && onAppointmentMouseLeave(e, event)
        }
      />
    );
  };

  // Helpers for "Now" line position
  const buildNowLinePosition = () => {
    const now = new Date();
    const hourNow = now.getHours() + now.getMinutes() / 60;

    const currentHour = now.getHours();
    const hourIndex = HOURS.indexOf(currentHour);
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const rawTop =
      hourIndex >= 0
        ? hourIndex * slotHeight +
          ((minutes * 60 + seconds) * slotHeight) / 3600 -
          slotHeight / 20 -
          slotHeight / 12
        : 0;

    return {
      hourNow,
      rawTop,
      label: minutesToLabel(now.getHours() * 60 + now.getMinutes()),
    };
  };

  // ───────────────────────────  DAY VIEW  ───────────────────────────
  if (view === "day") {
    const currentDay = new Date(currentDate);
    currentDay.setHours(0, 0, 0, 0);
    const iso = formatDateLocal(currentDay);

    const dayEvents = filteredEvents.filter((e) => e.date === iso);

    const staffCalendars = staffDayCalendars.filter((s) =>
      visibleStaffIds.includes(s.id)
    );

    const isTodayFlag =
      new Date().toDateString() === currentDay.toDateString();

    const orderedStaff = [...staffCalendars].sort((a, b) => {
      const score = (s) =>
        s.status === "offline" || s.status === "not-working" ? 1 : 0;
      return score(a) - score(b);
    });

    // RTL – staff right-to-left
    const rtlStaff = [...orderedStaff].reverse();

    const { hourNow, rawTop, label: nowLabel } = buildNowLinePosition();
    // Show now line in all day views, not just today
    const showNowLine = hourNow >= START_HOUR && hourNow <= END_HOUR;
    const nowTop = rawTop;
    const shouldShowNowLine = showNowLine && nowTop >= 0;

    const colsCount = Math.max(1, orderedStaff.length || 1);

    return (
      <div className="relative flex flex-1 min-h-0">
        {/* Scrollable grid (staff columns) */}
        <div
          ref={scrollContainerRef}
          data-time-grid-scroll
          className="flex-1 flex flex-col bg-white dark:bg-[#050505] overflow-y-auto relative"
          style={{ overflowX: "visible" }}
        >
          <div
            className="flex-1 relative grid"
            style={{
              gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
              overflow: "visible",
            }}
          >
            {/* Now line across all staff columns */}
            {shouldShowNowLine && (
              <div
                className="pointer-events-none absolute z-10"
                style={{
                  top: nowTop,
                  left: 0,
                  right: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center h-full">
                  <div
                    className="flex-1 h-[2px]"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                </div>
              </div>
            )}

            {rtlStaff.map((staff) => {
              const isOffline =
                staff.status === "offline" || staff.status === "not-working";

              let staffEvents = dayEvents.filter((e) => e.staff === staff.id);

              // Drag preview – add dragged event to target staff
              if (
                draggedEvent &&
                dragPosition.staffId === staff.id &&
                dragPosition.dateIso === iso
              ) {
                if (!staffEvents.some((e) => e.id === draggedEvent.id)) {
                  staffEvents = [...staffEvents, draggedEvent];
                }
              }

              // Remove dragged event from original column
              if (
                draggedEvent &&
                draggedEvent.staff === staff.id &&
                dragPosition.staffId !== staff.id
              ) {
                staffEvents = staffEvents.filter(
                  (e) => e.id !== draggedEvent.id
                );
              }

              return (
                <div
                  key={staff.id}
                  className="relative border-r border-gray-200/80 dark:border-commonBorder"
                >
                  {/* Offline background */}
                  {isOffline && (
                    <div className="absolute inset-0 pointer-events-none opacity-55">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 6px, transparent 6px, transparent 12px)",
                        }}
                      />
                    </div>
                  )}

                  {/* Hour lines */}
                  {HOURS.map((h, idx) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-gray-100 dark:border-[#1c1c1c]"
                      style={{ top: idx * slotHeight }}
                    />
                  ))}

                  {/* Clickable day column */}
                  <div
                    className="relative cursor-pointer"
                    style={{ height: HOURS.length * slotHeight }}
                    data-column
                    data-date={iso}
                    data-staff-id={staff.id}
                    onMouseMove={(e) => onDayMouseMove(iso, e, staff.id)}
                    onMouseLeave={onDayMouseLeave}
                    onClick={(e) => onDayColumnClick(e, iso, staff)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";

                      if (draggedEvent) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseYRelativeToColumn = e.clientY - rect.top;
                        const appointmentTopY =
                          mouseYRelativeToColumn - dragClickOffsetY;

                        const slot5 = slotHeight / 12;
                        let slotIndex = Math.floor(appointmentTopY / slot5);
                        if (slotIndex < 0) slotIndex = 0;
                        const maxIndex = HOURS.length * 12 - 1;
                        if (slotIndex > maxIndex) slotIndex = maxIndex;

                        const snappedY = slotIndex * slot5;
                        const totalMinutes =
                          START_HOUR * 60 + slotIndex * 5;
                        const timeLabel = minutesToLabel(totalMinutes);

                        setDragPosition({
                          dateIso: iso,
                          staffId: staff.id,
                          y: snappedY,
                          time: timeLabel,
                        });
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (
                        draggedEvent &&
                        dragPosition.dateIso === iso &&
                        dragPosition.time
                      ) {
                        onAppointmentDrop(
                          draggedEvent,
                          iso,
                          staff,
                          dragPosition.time
                        );
                      }
                    }}
                  >
                    {/* Drag time marker */}
                    {activeDraggedAppointmentId &&
                      draggedEvent &&
                      draggedEvent.id === activeDraggedAppointmentId &&
                      dragPosition.dateIso === iso &&
                      dragPosition.staffId === staff.id &&
                      dragPosition.time && (
                        <div
                          className="absolute pointer-events-none z-40"
                          style={{ right: "-60px", top: dragPosition.y }}
                        >
                          <div
                            className="px-2.5 py-1 rounded-full text-[13px] font-bold text-white whitespace-nowrap shadow-lg"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            {dragPosition.time}
                          </div>
                        </div>
                      )}

                    {/* Hover preview background */}
                      {hoverPreview &&
                      hoverPreview.iso === iso &&
                      hoverPreview.staffId === staff.id &&
                      hoverPreview.top >= 0 && (
                        <div
                          className="absolute left-0 right-0 rounded-md pointer-events-none z-0"
                          style={{
                            top: hoverPreview.top,
                            height: slotHeight / 12,
                            backgroundColor: "rgba(255,37,124,0.09)",
                            border: `1px solid ${BRAND_COLOR}`,
                          }}
                        />
                      )}

                    {/* Events */}
                    {staffEvents.map((event) =>
                      renderEvent(event, iso, staff.id)
                    )}

                    {/* Hover preview label - rendered after events to appear on top */}
                    {hoverPreview &&
                      hoverPreview.iso === iso &&
                      hoverPreview.staffId === staff.id &&
                      hoverPreview.top >= 0 && (
                        <div
                          className="absolute left-0 right-0 pointer-events-none flex items-center justify-center z-[20]"
                          style={{
                            top: hoverPreview.top,
                          }}
                        >
                          <div
                            className="px-3 py-1.5 rounded-full text-[16px] font-bold text-white whitespace-nowrap shadow-lg"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            {hoverPreview.label}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Time column (day view) */}
      <div
        className="w-[72px] sm:w-20 bg-white dark:bg-[#101010] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400 sticky left-0 z-10 relative"
        style={{ top: `${72 + headerHeight + 112}px` }}
      >
          <div className="border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#111111]" />
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-center pr-1 sm:pr-2 pt-1 font-bold border-t border-l border-gray-200/80 dark:border-[#1c1c1c] bg-white dark:bg-[#101010]"
              style={{ height: slotHeight }}
            >
              {formatHour(h)}
            </div>
          ))}
          {/* Now line label - positioned absolutely to align with the now line */}
          {shouldShowNowLine && (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                top: `${nowTop + scrollTop}px`,
                right: '20px',
                transform: 'translateY(-50%)',
              }}
            >
              <div
                className="py-1.5 px-3 rounded-full text-[14px] font-bold text-white whitespace-nowrap flex items-center justify-center"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {nowLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────  WEEK VIEW  ───────────────────────────

  const daysToRender = weekDays || [];
  const {
    hourNow: hourNowWeek,
    rawTop: nowTopWeek,
    label: nowLabelWeek,
  } = buildNowLinePosition();

  const weekStartDate = weekStart || new Date();
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  // Show now line in all week views, not just when today is in the week
  const showNowLineWeek = hourNowWeek >= START_HOUR && hourNowWeek <= END_HOUR;
  const shouldShowNowLineWeek = showNowLineWeek && nowTopWeek >= 0;

  return (
    <div className="relative flex flex-1 min-h-0">
      {/* Scrollable week grid (7 days) */}
      <div
        ref={scrollContainerRef}
        data-time-grid-scroll
        className="flex-1 flex flex-col bg-white dark:bg-[#050505] overflow-y-auto relative"
        dir="rtl"
      >
        <div
          className="flex-1 relative grid grid-cols-7"
        >
          {/* Now line across all 7 days */}
          {shouldShowNowLineWeek && (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                top: nowTopWeek,
                left: 0,
                right: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center h-full">
                <div
                  className="flex-1 h-[2px]"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>
          )}

          {daysToRender && daysToRender.length > 0
            ? daysToRender.map((day) => {
                if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
                  return null;
                }

                const iso = formatDateLocal(day);
                const { dayName, dayNum } = formatDayLabel(day, language);
                const isTodayFlag =
                  new Date().toDateString() === day.toDateString();

                let dayEvents = filteredEvents.filter(
                  (e) => e.date === iso
                );

                const firstAvailableStaff =
                  staffDayCalendars.find(
                    (s) =>
                      s.status !== "offline" &&
                      s.status !== "not-working"
                  ) || (staffDayCalendars.length > 0 ? staffDayCalendars[0] : null);

                // Drag preview – add dragged event to target day
                if (draggedEvent && dragPosition.dateIso === iso) {
                  if (!dayEvents.some((e) => e.id === draggedEvent.id)) {
                    dayEvents = [...dayEvents, draggedEvent];
                  }
                }

                // Remove dragged event from original day when moving out
                if (
                  draggedEvent &&
                  draggedEvent.date === iso &&
                  dragPosition.dateIso !== iso
                ) {
                  dayEvents = dayEvents.filter(
                    (e) => e.id !== draggedEvent.id
                  );
                }

                return (
                  <div
                    key={iso}
                    className="relative group border-b border-gray-200/80 dark:border-commonBorder"
                  >
                    {/* Day body */}
                    <div
                      className="relative"
                      style={{ height: HOURS.length * slotHeight }}
                      data-column
                      data-date={iso}
                      onMouseMove={(e) => {
                        if (firstAvailableStaff) {
                          onDayMouseMove(iso, e, firstAvailableStaff.id, true); // true = isWeekView
                        }
                      }}
                      onMouseLeave={onDayMouseLeave}
                      onClick={(e) => {
                        if (firstAvailableStaff) {
                          const syntheticEvent = {
                            currentTarget: e.currentTarget,
                            clientY: e.clientY,
                          };
                          onDayColumnClick(
                            syntheticEvent,
                            iso,
                            firstAvailableStaff,
                            true // true = isWeekView
                          );
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";

                        if (draggedEvent && firstAvailableStaff) {
                          const rect =
                            e.currentTarget.getBoundingClientRect();
                          const mouseYRelativeToColumn =
                            e.clientY - rect.top;
                          const appointmentTopY =
                            mouseYRelativeToColumn - dragClickOffsetY;

                          const slot5 = slotHeight / 12;
                          let slotIndex = Math.floor(
                            appointmentTopY / slot5
                          );
                          if (slotIndex < 0) slotIndex = 0;
                          const maxIndex = HOURS.length * 12 - 1;
                          if (slotIndex > maxIndex) slotIndex = maxIndex;

                          const snappedY = slotIndex * slot5;
                          const totalMinutes =
                            START_HOUR * 60 + slotIndex * 5;
                          const timeLabel =
                            minutesToLabel(totalMinutes);

                          setDragPosition({
                            dateIso: iso,
                            staffId: firstAvailableStaff.id,
                            y: snappedY,
                            time: timeLabel,
                          });
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          draggedEvent &&
                          firstAvailableStaff &&
                          dragPosition.dateIso === iso &&
                          dragPosition.time
                        ) {
                          onAppointmentDrop(
                            draggedEvent,
                            iso,
                            firstAvailableStaff,
                            dragPosition.time,
                            true // isWeekView = true
                          );
                        }
                      }}
                    >
                      {/* Hour lines */}
                      {HOURS.map((h, idx) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t border-gray-100 dark:border-[#1c1c1c]"
                          style={{ top: idx * slotHeight }}
                        />
                      ))}

                      {/* Drag time marker */}
                      {activeDraggedAppointmentId &&
                        draggedEvent &&
                        draggedEvent.id === activeDraggedAppointmentId &&
                        dragPosition.dateIso === iso &&
                        dragPosition.time && (
                          <div
                            className="absolute pointer-events-none z-40"
                            style={{
                              right: "-60px",
                              top: dragPosition.y,
                            }}
                          >
                            <div
                              className="px-2.5 py-1 rounded-full text-[13px] font-bold text-white whitespace-nowrap shadow-lg"
                              style={{ backgroundColor: BRAND_COLOR }}
                            >
                              {dragPosition.time}
                            </div>
                          </div>
                        )}

                      {/* Hover preview background */}
                        {hoverPreview &&
                        hoverPreview.iso === iso &&
                        hoverPreview.staffId === (firstAvailableStaff?.id || null) &&
                        hoverPreview.top >= 0 && (
                          <div
                            className="absolute left-0 right-0 pointer-events-none rounded-md z-0"
                            style={{
                              top: hoverPreview.top,
                              height: slotHeight / 12,
                              backgroundColor:
                                "rgba(255,37,124,0.09)",
                              border: `1px solid ${BRAND_COLOR}`,
                            }}
                          />
                        )}

                      {/* Events */}
                      {dayEvents.map((event) => {
                        const eventStaff =
                          staffDayCalendars.find(
                            (s) => s.id === event.staff
                          ) || (staffDayCalendars.length > 0 ? staffDayCalendars[0] : null);
                        return renderEvent(
                          event,
                          iso,
                          eventStaff?.id || event.staff,
                          true // isWeekView = true
                        );
                      })}

                      {/* Hover preview label - rendered after events to appear on top */}
                      {hoverPreview &&
                        hoverPreview.iso === iso &&
                        hoverPreview.staffId === (firstAvailableStaff?.id || null) &&
                        hoverPreview.top >= 0 && (
                          <div
                            className="absolute left-0 right-0 pointer-events-none flex items-center justify-center z-[20]"
                            style={{
                              top: hoverPreview.top,
                            }}
                          >
                            <div
                              className="px-3 py-1.5 rounded-full text-[16px] font-bold text-white whitespace-nowrap shadow-lg"
                              style={{
                                backgroundColor: BRAND_COLOR,
                              }}
                            >
                              {hoverPreview.label}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </div>

      {/* Time column (week view) – אותו רוחב כמו ב-day view כדי שהכותרת תוכל להסתנכרן */}
      <div
        className="w-[72px] sm:w-20 bg-white dark:bg-[#101010] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400 sticky left-0 z-10 relative"
        style={{ top: `${72 + headerHeight + 112}px` }}
      >
        <div className="border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#111111]" />
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex items-start justify-center pr-1 sm:pr-2 pt-1 font-bold border-t border-l border-gray-200/80 dark:border-[#1c1c1c] bg-white dark:bg-[#101010]"
            style={{ height: slotHeight }}
          >
            {formatHour(h)}
          </div>
        ))}
        {/* Now line label - positioned absolutely to align with the now line */}
        {shouldShowNowLineWeek && (
          <div
            className="pointer-events-none absolute z-50"
            style={{
              top: `${nowTopWeek + scrollTop}px`,
              right: '20px',
              transform: 'translateY(-50%)',
            }}
          >
            <div
              className="py-1.5 px-3 rounded-full text-[14px] font-bold text-white whitespace-nowrap flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {nowLabelWeek}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
