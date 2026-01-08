/**
 * Calendar Page - Refactored Version
 * Orchestrator component that uses all the new modular components, hooks, and services
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

// Hooks
import { useCalendarView } from "../../hooks/calendar/useCalendarView";
import { useAppointments } from "../../hooks/calendar/useAppointments";
import { useBookingFlow } from "../../hooks/calendar/useBookingFlow";
import { useWaitlist } from "../../hooks/calendar/useWaitlist";

// Components
import { CalendarHeader } from "../../components/calendar/CalendarHeader";
import { TimeGrid } from "../../components/calendar/CalendarGrid/TimeGrid";
import { MonthGrid } from "../../components/calendar/CalendarGrid/MonthGrid";
import { SettingsPanel } from "../../components/calendar/Panels/SettingsPanel";
import { WaitlistPanel } from "../../components/calendar/Panels/WaitlistPanel";
import { BookingFlowPanel } from "../../components/calendar/Panels/BookingFlowPanel";
import { ConflictModal } from "../../components/calendar/Modals/ConflictModal";
import { OverlapModal } from "../../components/calendar/Modals/OverlapModal";
import { NewClientModal } from "../../components/calendar/Modals/NewClientModal";

// Utils & Constants
import { BRAND_COLOR, HOURS, START_HOUR, SLOT_HEIGHT_MIN, uuid } from "../../utils/calendar/constants";
import { formatHeaderLabel, formatDateLocal, isSameCalendarDay, toDateOnly, isFullMonthRange, formatBookingDateLabel } from "../../utils/calendar/dateHelpers";
import { parseTime, minutesToLabel, calculateEndTime, parseServiceDuration, timeRangesOverlap, getExactStartTime, generateTimeSlots } from "../../utils/calendar/timeHelpers";
import { calculateRecurringDates } from "../../utils/calendar/recurringEngine";
import { findBatchConflicts } from "../../utils/calendar/conflictDetection";

// Data
import { 
  STAFF_DAY_CALENDARS, 
  ALL_STAFF_IDS, 
  DEMO_SERVICES, 
  DEMO_WAITLIST_CLIENTS,
  createDemoEvents 
} from "../../data/calendar/demoData";

export default function CalendarPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Calendar View Hook
  const {
    currentDate,
    view,
    weekStart,
    slotHeight,
    appliedSlotHeight,
    customWeekStart,
    setCurrentDate,
    setView: changeView,
    setSlotHeight,
    setCustomWeekStart,
    handlePrev,
    handleNext,
    jumpToToday,
    applyZoom,
    resetZoom,
  } = useCalendarView();

  // Appointments Hook
  const {
    appointments: customEvents,
    createAppointments,
    updateAppointment,
    deleteAppointment,
    setAppointments: setCustomEvents,
    getHasConflict,
    resetConflict,
  } = useAppointments();

  // Booking Flow Hook
  const bookingFlow = useBookingFlow();
  const {
    addFlowMode,
    waitlistAddStep,
    isWaitlistAddOpen,
    selectedWaitlistClient,
    bookingSelectedDate,
    bookingSelectedTime,
    bookingSelectedService,
    bookingSelectedStaff,
    selectedStaffForBooking,
    waitlistClientSearch,
    serviceSearch,
    isTimeDropdownOpen,
    recurringServiceType,
    recurringDuration,
    isServiceTypeDropdownOpen,
    isRepeatDurationDropdownOpen,
    bookingMonth,
    setWaitlistAddStep,
    setSelectedWaitlistClient,
    setBookingSelectedDate,
    setBookingSelectedTime,
    setBookingSelectedService,
    setBookingSelectedStaff,
    setSelectedStaffForBooking,
    setWaitlistClientSearch,
    setServiceSearch,
    setIsTimeDropdownOpen,
    setRecurringServiceType,
    setRecurringDuration,
    setIsServiceTypeDropdownOpen,
    setIsRepeatDurationDropdownOpen,
    setBookingMonth,
    setIsWaitlistAddOpen,
    openBookingFlow,
    openWaitlistFlow,
    closeFlow,
  } = bookingFlow;

  // Waitlist Hook
  const waitlist = useWaitlist();
  const {
    waitlistItems,
    waitlistFilter,
    waitlistRange,
    waitlistSort,
    isWaitlistRangeOpen,
    isSortDropdownOpen,
    openWaitlistActionId,
    isWaitlistOpen,
    setWaitlistItems,
    setWaitlistFilter,
    setWaitlistRange,
    setWaitlistSort,
    setIsWaitlistRangeOpen,
    setIsSortDropdownOpen,
    setOpenWaitlistActionId,
    setIsWaitlistOpen,
    addWaitlistItem,
    updateWaitlistItem,
    deleteWaitlistItem,
    convertToAppointment,
  } = waitlist;

  // Local state for UI
  const [selectedStaff, setSelectedStaff] = useState("all-business");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(ALL_STAFF_IDS);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [rangeHoverDate, setRangeHoverDate] = useState(null);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [showBookingConflictModal, setShowBookingConflictModal] = useState(false);
  const [conflictingAppointment, setConflictingAppointment] = useState(null);
  const hasConflictRef = useRef(false);

  // Drag & Drop state
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ dateIso: null, staffId: null, y: 0, time: null });
  const [dragClickOffsetY, setDragClickOffsetY] = useState(0);
  const [activeDraggedAppointmentId, setActiveDraggedAppointmentId] = useState(null);
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState(null);

  // Clients list
  const [clients, setClients] = useState(DEMO_WAITLIST_CLIENTS);

  // New client modal state
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientErrors, setNewClientErrors] = useState({});

  // Calculate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Header label
  const headerLabel = useMemo(
    () => formatHeaderLabel(view, currentDate, weekStart, language),
    [view, currentDate, weekStart, language]
  );

  // Demo events + real events
  const demoEvents = useMemo(() => {
    const base = createDemoEvents(weekDays);
    return [...base, ...customEvents];
  }, [weekDays, customEvents]);

  // Filter events based on staff selection
  const filterEvents = (eventsList) => {
    return eventsList.filter((e) => {
      if (selectedStaff === "all-business") {
        return true;
      }
      if (selectedStaff === "scheduled-team") {
        const scheduledIds = STAFF_DAY_CALENDARS.filter(
          (s) => s.status !== "offline" && s.status !== "not-working"
        ).map((s) => s.id);
        return scheduledIds.includes(e.staff);
      }
      if (selectedStaff === "custom") {
        if (!selectedTeamMembers.length) return false;
        return selectedTeamMembers.includes(e.staff);
      }
      return e.staff === selectedStaff;
    });
  };

  const filteredEvents = useMemo(() => filterEvents(demoEvents), [demoEvents, selectedStaff, selectedTeamMembers]);

  // Filtered waitlist
  const filteredWaitlist = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const inRange = (item) => {
      if (waitlistRange === "all" || waitlistRange === "calendar") {
        return true;
      }

      const itemDateValue = item.date || item.requestedDate;
      if (!itemDateValue) return true;

      const itemDate = itemDateValue instanceof Date 
        ? new Date(itemDateValue)
        : new Date(itemDateValue);
      itemDate.setHours(0, 0, 0, 0);

      const diffMs = itemDate.getTime() - todayDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (waitlistRange === "today") return diffDays === 0;
      if (waitlistRange === "3days") return diffDays >= 0 && diffDays <= 3;
      if (waitlistRange === "7days") return diffDays >= 0 && diffDays <= 7;
      if (waitlistRange === "30days") return diffDays >= 0 && diffDays <= 30;

      return true;
    };

    return waitlistItems.filter(
      (item) =>
        (waitlistFilter === "all"
          ? true
          : item.status === waitlistFilter) && inRange(item)
    );
  }, [waitlistFilter, waitlistRange, waitlistItems]);

  // Handle flow apply - create appointments or waitlist entries
  const handleFlowApply = () => {
    // Validation - check required fields
    if (
      !selectedWaitlistClient ||
      !bookingSelectedService ||
      !bookingSelectedDate
    ) {
      console.warn("Missing required data", {
        selectedWaitlistClient: !!selectedWaitlistClient,
        bookingSelectedService: !!bookingSelectedService,
        bookingSelectedDate: !!bookingSelectedDate,
        bookingSelectedTime: bookingSelectedTime
      });
      return;
    }

    // Find service object
    const selectedServiceObj = DEMO_SERVICES.find(
      (s) => s.id === bookingSelectedService
    );

    if (!selectedServiceObj) {
      console.warn("Service not found");
      return;
    }

    // Route based on flow mode
    if (addFlowMode === "booking") {
      // Create calendar appointment
      const dateIso = bookingSelectedDate instanceof Date 
        ? formatDateLocal(bookingSelectedDate)
        : bookingSelectedDate;
      
      const timeStr = getExactStartTime(bookingSelectedTime);
      
      // Build full date-time for validation
      const startDateTime = new Date(bookingSelectedDate);
      const [h, m] = timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        startDateTime.setHours(h, m, 0, 0);
      }
      
      // Use selected staff from booking flow, or pre-selected from calendar click, or fallback to default
      let staffId, staffName;
      if (selectedStaffForBooking) {
        const selectedStaffObj = STAFF_DAY_CALENDARS.find(s => s.id === selectedStaffForBooking);
        staffId = selectedStaffObj?.id || selectedStaffForBooking;
        staffName = selectedStaffObj?.name || "דנה";
      } else if (bookingSelectedStaff) {
        staffId = bookingSelectedStaff.id;
        staffName = bookingSelectedStaff.name;
      } else {
        const defaultStaff = STAFF_DAY_CALENDARS.find(s => s.status !== "offline" && s.status !== "not-working") || STAFF_DAY_CALENDARS[0];
        staffId = defaultStaff?.id || "Dana";
        staffName = defaultStaff?.name || "דנה";
      }

      // Calculate end time based on service duration
      const durationMinutes = parseServiceDuration(selectedServiceObj.duration);
      const endTimeStr = calculateEndTime(timeStr, durationMinutes);

      // Calculate recurring dates if service type is recurring
      const recurringDates = recurringServiceType !== "Regular Appointment"
        ? calculateRecurringDates(bookingSelectedDate, recurringServiceType, recurringDuration)
        : [new Date(bookingSelectedDate)];

      // Create appointments for all recurring dates
      setCustomEvents((prev) => {
        const newEvents = [];
        let skippedCount = 0;
        const firstSelectedDateIso = dateIso;
        
        for (const appointmentDate of recurringDates) {
          const appointmentDateIso = formatDateLocal(appointmentDate);
          
          // Skip dates before first selected date
          if (appointmentDateIso < firstSelectedDateIso) {
            continue;
          }
          
          // Skip past dates
          const nowCheck = new Date();
          const currentDateIsoCheck = formatDateLocal(nowCheck);
          if (appointmentDateIso < currentDateIsoCheck) {
            continue;
          }
          
          // Check for duplicates
          const isDuplicate = prev.some((event) => {
            return (
              event.date === appointmentDateIso &&
              event.start === timeStr &&
              event.staff === staffId &&
              event.clientId === selectedWaitlistClient.id &&
              event.serviceId === bookingSelectedService
            );
          });

          if (isDuplicate) {
            skippedCount++;
            continue;
          }

          // Check for conflicts (only future dates)
          const now = new Date();
          const currentDateIso = formatDateLocal(now);
          const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          if (appointmentDateIso >= currentDateIso) {
            const relevantEvents = prev.filter((event) => {
              if (event.date < currentDateIsoCheck) {
                return false;
              }
              
              if (event.date === currentDateIsoCheck) {
                const [eventEndHour, eventEndMinute] = event.end.split(':').map(Number);
                const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
                const eventEndTimeMinutes = eventEndHour * 60 + eventEndMinute;
                const currentTimeMinutes = currentHour * 60 + currentMinute;
                
                if (eventEndTimeMinutes <= currentTimeMinutes) {
                  return false;
                }
              }
              
              return true;
            });
            
            const conflictingEvent = relevantEvents.find((event) => {
              if (event.staff !== staffId || event.date !== appointmentDateIso) {
                return false;
              }
              return timeRangesOverlap(timeStr, endTimeStr, event.start, event.end);
            });

            if (conflictingEvent) {
              hasConflictRef.current = true;
              setConflictingAppointment({
                client: conflictingEvent.client || conflictingEvent.clientName || "לקוח לא ידוע",
                date: appointmentDateIso,
                time: `${conflictingEvent.start}–${conflictingEvent.end}`,
              });
              setShowBookingConflictModal(true);
              return prev;
            }
          }

          // Create appointment for this date
          const newEvent = {
            id: uuid(),
            date: appointmentDateIso,
            title: `${selectedServiceObj.name} – ${selectedWaitlistClient.name}`,
            client: selectedWaitlistClient.name,
            clientId: selectedWaitlistClient.id,
            staff: staffId,
            staffName: staffName,
            start: timeStr,
            end: endTimeStr,
            serviceId: bookingSelectedService,
            serviceName: selectedServiceObj.name,
            color: "#FFE4F1",
          };

          newEvents.push(newEvent);
        }

        if (skippedCount > 0) {
          console.log(`[RECURRING APPOINTMENTS] Skipped ${skippedCount} appointment(s) due to conflicts`);
        }

        return [...prev, ...newEvents];
      });

      // Reset and close panel ONLY if there was no conflict
      if (!hasConflictRef.current) {
        closeFlow();
        setRecurringServiceType("Regular Appointment");
        setRecurringDuration("1 Month");
      } else {
        hasConflictRef.current = false;
      }

    } else if (addFlowMode === "waitlist") {
      // Create waitlist entry
      const startDateTime = new Date(bookingSelectedDate);
      if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":")) {
        const timeStr = getExactStartTime(bookingSelectedTime);
        const [h, m] = timeStr.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          startDateTime.setHours(h, m, 0, 0);
        }
      }

      addWaitlistItem({
        client: selectedWaitlistClient,
        service: selectedServiceObj,
        date: bookingSelectedDate instanceof Date 
          ? bookingSelectedDate 
          : new Date(bookingSelectedDate),
        time: bookingSelectedTime,
        startDateTime: startDateTime.toISOString(),
        status: "waiting",
      });

      // Reset and close panel
      closeFlow();
      
      // Open waitlist panel to show the new entry
      setWaitlistFilter("waiting");
      setWaitlistRange("all");
      setIsWaitlistOpen(true);
    }
  };

  // Handle creating a new client
  const handleCreateNewClient = () => {
    const errors = {};
    if (!newClientName.trim()) {
      errors.name = "שם הוא שדה חובה";
    }
    
    const phoneDigits = newClientPhone.trim().replace(/\D/g, '');
    if (!newClientPhone.trim()) {
      errors.phone = "טלפון הוא שדה חובה";
    } else if (phoneDigits.length !== 10) {
      errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";
    }

    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const initials = newClientName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newClient = {
      id: Date.now(),
      name: newClientName.trim(),
      phone: phoneDigits,
      email: newClientEmail.trim(),
      city: newClientCity.trim(),
      address: newClientAddress.trim(),
      initials: initials || "ל",
    };

    // Add client to clients list
    setClients((prev) => [newClient, ...prev]);
    
    // Set as selected client
    setSelectedWaitlistClient(newClient);
    
    // Close modal
    setIsNewClientModalOpen(false);
    
    // Reset form fields
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCity("");
    setNewClientAddress("");
    setNewClientErrors({});
  };

  // Apply date selection
  const applyDateSelection = () => {
    const hasRealRange =
      rangeStartDate &&
      rangeEndDate &&
      toDateOnly(rangeStartDate).getTime() !== toDateOnly(rangeEndDate).getTime();

    if (hasRealRange && isFullMonthRange(rangeStartDate, rangeEndDate)) {
      const monthDate = new Date(
        rangeStartDate.getFullYear(),
        rangeStartDate.getMonth(),
        1
      );
      setCurrentDate(monthDate);
      changeView("month");
      setCustomWeekStart(null);
    } else if (hasRealRange) {
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      changeView("week");
      setCustomWeekStart(startOnly);
    } else if (rangeStartDate) {
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      changeView("day");
      setCustomWeekStart(null);
    } else if (selectedDate) {
      const d = toDateOnly(selectedDate);
      setCurrentDate(d);
      changeView("day");
      setCustomWeekStart(null);
    }

    setIsDatePickerOpen(false);
  };

  // Day column click handler
  const handleDayColumnClick = (e, iso, staff) => {
    if (!staff || staff.status === "offline" || staff.status === "not-working") {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let y = e.clientY - rect.top;
    const maxHeight = HOURS.length * appliedSlotHeight;
    if (y < 0) y = 0;
    if (y > maxHeight) y = maxHeight;

    const slot5 = appliedSlotHeight / 12;
    let slotIndex = Math.floor(y / slot5);
    if (slotIndex < 0) slotIndex = 0;
    const maxIndex = HOURS.length * 12 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    const totalMinutes = START_HOUR * 60 + slotIndex * 5;
    const timeLabel = minutesToLabel(totalMinutes);

    // Open booking flow
    openBookingFlow({
      date: iso,
      time: timeLabel,
      staff: staff,
      step: "service",
    });
  };

  // Day mouse move handler
  const handleDayMouseMove = (iso, e, staffId = null) => {
    if (draggedEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const events = filterEvents(demoEvents);
    const dayEvents = events.filter((ev) => ev.date === iso);
    const staffEvents = dayEvents.filter((ev) => ev.staff === staffId);

    const isOverAppointment = staffEvents.some((event) => {
      const eventStart = parseTime(event.start);
      const eventEnd = parseTime(event.end);
      const eventTop = (eventStart - START_HOUR) * appliedSlotHeight;
      const eventHeight = Math.max((eventEnd - eventStart) * appliedSlotHeight - 2, 40);
      const eventBottom = eventTop + eventHeight;
      return y >= eventTop - 2 && y <= eventBottom + 2;
    });

    if (isOverAppointment) {
      setHoverPreview(null);
      return;
    }

    const slot5 = appliedSlotHeight / 12;
    let slotIndex = Math.floor(y / slot5);
    if (slotIndex < 0) slotIndex = 0;
    const maxIndex = HOURS.length * 12 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    const top = slotIndex * slot5;
    const totalMinutes = START_HOUR * 60 + slotIndex * 5;
    const label = minutesToLabel(totalMinutes);

    setHoverPreview({ iso, top, label, staffId });
  };

  const handleDayMouseLeave = () => {
    setHoverPreview(null);
  };

  // Appointment drag handlers
  const handleAppointmentDragStart = (e, event, dateIso, staffId) => {
    e.stopPropagation();
    setDraggedEvent(event);
    setActiveDraggedAppointmentId(event.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const columnRect = e.currentTarget.closest('[data-column]')?.getBoundingClientRect();
    if (columnRect) {
      const mouseYRelativeToColumn = e.clientY - columnRect.top;
      const eventStart = parseTime(event.start);
      const appointmentTopRelativeToColumn = (eventStart - START_HOUR) * appliedSlotHeight;
      const clickOffsetY = mouseYRelativeToColumn - appointmentTopRelativeToColumn;
      setDragClickOffsetY(clickOffsetY);

      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      const currentY = appointmentTopRelativeToColumn;
      const slot5 = appliedSlotHeight / 12;
      let slotIndex = Math.floor(currentY / slot5);
      if (slotIndex < 0) slotIndex = 0;
      const maxIndex = HOURS.length * 12 - 1;
      if (slotIndex > maxIndex) slotIndex = maxIndex;
      const snappedY = slotIndex * slot5;
      const totalMinutes = START_HOUR * 60 + slotIndex * 5;
      const timeLabel = minutesToLabel(totalMinutes);
      setDragPosition({ dateIso, staffId, y: snappedY, time: timeLabel });
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");

    const dragImage = document.createElement("img");
    dragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    dragImage.style.width = "1px";
    dragImage.style.height = "1px";
    dragImage.style.opacity = "0";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleAppointmentDragEnd = (e) => {
    e.stopPropagation();
    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
  };

  // Appointment drop handler
  const handleAppointmentDrop = (event, targetDateIso, targetStaff, targetTime) => {
    if (!event || !targetDateIso || !targetStaff || !targetTime) {
      return;
    }

    const selectedServiceObj = DEMO_SERVICES.find((s) => 
      event.title?.includes(s.name) || event.service === s.id
    );
    
    let durationMinutes = 30;
    if (selectedServiceObj?.duration) {
      durationMinutes = parseServiceDuration(selectedServiceObj.duration);
    } else {
      const oldStart = parseTime(event.start);
      const oldEnd = parseTime(event.end);
      durationMinutes = Math.round((oldEnd - oldStart) * 60);
    }

    const endTimeStr = calculateEndTime(targetTime, durationMinutes);

    // Check for overlaps
    const events = filterEvents(demoEvents);
    const hasOverlap = events.some((e) => {
      if (e.id === event.id) return false;
      if (e.staff !== targetStaff.id || e.date !== targetDateIso) return false;
      return timeRangesOverlap(targetTime, endTimeStr, e.start, e.end);
    });

    if (hasOverlap) {
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      setShowOverlapModal(true);
      return;
    }

    // Update appointment
    const staffObj = STAFF_DAY_CALENDARS.find((s) => s.id === targetStaff.id);
    const staffName = staffObj?.name || targetStaff.name;

    updateAppointment(event.id, {
      date: targetDateIso,
      start: targetTime,
      end: endTimeStr,
      staff: targetStaff.id,
      staffName: staffName,
    });

    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
  };

  return (
    <div dir="ltr" className="-mt-6 -mx-4 sm:-mx-6 h-[calc(100vh-85px)] flex flex-col bg-white dark:bg-[#111111]">
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

      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        weekStart={weekStart}
        headerLabel={headerLabel}
        handlePrev={handlePrev}
        handleNext={handleNext}
        jumpToToday={jumpToToday}
        changeView={changeView}
        slotHeight={slotHeight}
        appliedSlotHeight={appliedSlotHeight}
        setSlotHeight={setSlotHeight}
        onSettingsClick={() => {
          setSlotHeight(appliedSlotHeight);
          setIsSettingsOpen(true);
          setIsWaitlistOpen(false);
        }}
        selectedStaff={selectedStaff}
        selectedTeamMembers={selectedTeamMembers}
        setSelectedStaff={setSelectedStaff}
        setSelectedTeamMembers={setSelectedTeamMembers}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        pickerMonth={pickerMonth}
        setPickerMonth={setPickerMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        rangeStartDate={rangeStartDate}
        setRangeStartDate={setRangeStartDate}
        rangeEndDate={rangeEndDate}
        setRangeEndDate={setRangeEndDate}
        rangeHoverDate={rangeHoverDate}
        setRangeHoverDate={setRangeHoverDate}
        applyDateSelection={applyDateSelection}
        onWaitlistClick={() => {
          setIsWaitlistOpen(true);
          setIsSettingsOpen(false);
        }}
        language={language}
      />

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0">
        {view === "month" ? (
          <MonthGrid
            currentDate={currentDate}
            events={filteredEvents}
            selectedStaff={selectedStaff}
            selectedTeamMembers={selectedTeamMembers}
            language={language}
          />
        ) : (
          <TimeGrid
            view={view}
            currentDate={currentDate}
            weekStart={weekStart}
            weekDays={weekDays}
            slotHeight={appliedSlotHeight}
            events={filteredEvents}
            selectedStaff={selectedStaff}
            selectedTeamMembers={selectedTeamMembers}
            draggedEvent={draggedEvent}
            dragPosition={dragPosition}
            dragClickOffsetY={dragClickOffsetY}
            activeDraggedAppointmentId={activeDraggedAppointmentId}
            hoverPreview={hoverPreview}
            setHoverPreview={setHoverPreview}
            setDragPosition={setDragPosition}
            setDragClickOffsetY={setDragClickOffsetY}
            onDayColumnClick={handleDayColumnClick}
            onDayMouseMove={handleDayMouseMove}
            onDayMouseLeave={handleDayMouseLeave}
            onAppointmentDrop={handleAppointmentDrop}
            onAppointmentDragStart={handleAppointmentDragStart}
            onAppointmentDragEnd={handleAppointmentDragEnd}
            language={language}
          />
        )}
      </div>

      {/* Panels */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => {
          setSlotHeight(appliedSlotHeight);
          setIsSettingsOpen(false);
        }}
        slotHeight={slotHeight}
        appliedSlotHeight={appliedSlotHeight}
        setSlotHeight={setSlotHeight}
        applyZoom={() => {
          applyZoom();
          setIsSettingsOpen(false);
        }}
        resetZoom={() => {
          resetZoom();
          setIsSettingsOpen(false);
        }}
      />

      {/* Modals */}
      <OverlapModal
        isOpen={showOverlapModal}
        onClose={() => setShowOverlapModal(false)}
      />

      <ConflictModal
        isOpen={showBookingConflictModal}
        conflictingAppointment={conflictingAppointment}
        onClose={() => {
          setShowBookingConflictModal(false);
          setConflictingAppointment(null);
          setWaitlistAddStep("service");
        }}
      />

      {/* Waitlist Panel */}
      <WaitlistPanel
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        waitlistItems={waitlistItems}
        filteredWaitlist={filteredWaitlist}
        waitlistFilter={waitlistFilter}
        waitlistRange={waitlistRange}
        waitlistSort={waitlistSort}
        isWaitlistRangeOpen={isWaitlistRangeOpen}
        isSortDropdownOpen={isSortDropdownOpen}
        openWaitlistActionId={openWaitlistActionId}
        onFilterChange={setWaitlistFilter}
        onRangeChange={setWaitlistRange}
        onSortChange={setWaitlistSort}
        onRangeDropdownToggle={setIsWaitlistRangeOpen}
        onSortDropdownToggle={setIsSortDropdownOpen}
        onActionDropdownToggle={setOpenWaitlistActionId}
        onBookAppointment={(item) => {
          convertToAppointment(item.id);
          // TODO: Convert waitlist item to appointment
        }}
        onRemoveItem={(itemId) => {
          deleteWaitlistItem(itemId);
        }}
        onAddNew={() => {
          openWaitlistFlow();
          setIsWaitlistOpen(false);
        }}
      />

      {/* Booking Flow Panel */}
      <BookingFlowPanel
        isOpen={isWaitlistAddOpen}
        onClose={closeFlow}
        language={language}
        addFlowMode={addFlowMode}
        waitlistAddStep={waitlistAddStep}
        selectedWaitlistClient={selectedWaitlistClient}
        bookingSelectedDate={bookingSelectedDate}
        bookingSelectedTime={bookingSelectedTime}
        bookingSelectedService={bookingSelectedService}
        bookingSelectedStaff={bookingSelectedStaff}
        selectedStaffForBooking={selectedStaffForBooking}
        waitlistClientSearch={waitlistClientSearch}
        serviceSearch={serviceSearch}
        isTimeDropdownOpen={isTimeDropdownOpen}
        recurringServiceType={recurringServiceType}
        recurringDuration={recurringDuration}
        isServiceTypeDropdownOpen={isServiceTypeDropdownOpen}
        isRepeatDurationDropdownOpen={isRepeatDurationDropdownOpen}
        bookingMonth={bookingMonth}
        clients={clients}
        setWaitlistAddStep={setWaitlistAddStep}
        setSelectedWaitlistClient={setSelectedWaitlistClient}
        setBookingSelectedDate={setBookingSelectedDate}
        setBookingSelectedTime={setBookingSelectedTime}
        setBookingSelectedService={setBookingSelectedService}
        setSelectedStaffForBooking={setSelectedStaffForBooking}
        setWaitlistClientSearch={setWaitlistClientSearch}
        setServiceSearch={setServiceSearch}
        setIsTimeDropdownOpen={setIsTimeDropdownOpen}
        setRecurringServiceType={setRecurringServiceType}
        setRecurringDuration={setRecurringDuration}
        setIsServiceTypeDropdownOpen={setIsServiceTypeDropdownOpen}
        setIsRepeatDurationDropdownOpen={setIsRepeatDurationDropdownOpen}
        setBookingMonth={setBookingMonth}
        onApply={handleFlowApply}
        onOpenNewClientModal={() => {
          setSelectedWaitlistClient(null);
          setNewClientName("");
          setNewClientPhone("");
          setNewClientEmail("");
          setNewClientCity("");
          setNewClientAddress("");
          setNewClientErrors({});
          setIsNewClientModalOpen(true);
        }}
      />

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        newClientName={newClientName}
        newClientPhone={newClientPhone}
        newClientEmail={newClientEmail}
        newClientCity={newClientCity}
        newClientAddress={newClientAddress}
        newClientErrors={newClientErrors}
        onNameChange={setNewClientName}
        onPhoneChange={setNewClientPhone}
        onEmailChange={setNewClientEmail}
        onCityChange={setNewClientCity}
        onAddressChange={setNewClientAddress}
        onSubmit={handleCreateNewClient}
      />
    </div>
  );
}

